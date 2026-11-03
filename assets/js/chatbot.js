document.addEventListener('DOMContentLoaded', () => {
  console.log('Chatbot script loaded');
  
  if (!window.BurMenFAQData) {
    console.error('BurMenFAQData not found! Check that faq-data.js is loaded before chatbot.js.');
    return;
  }
  
  console.log('BurMenFAQData found.');

  const data = window.BurMenFAQData;
  let isOpen = false;
  let launcherBtn = null;
  let panel = null;
  let messagesContainer = null;
  let inputField = null;
  let sendBtn = null;
  let closeBtn = null;

  function init() {
    console.log('Initializing chatbot...');
    
    if (document.querySelector('.bm-chat-launcher')) {
      console.log('Chatbot launcher already exists, skipping init');
      return;
    }

    try {
      // 1. Create Launcher
      launcherBtn = document.createElement('button');
      launcherBtn.className = 'bm-chat-launcher';
      launcherBtn.type = 'button';
      launcherBtn.setAttribute('aria-expanded', 'false');
      launcherBtn.setAttribute('aria-controls', 'bm-chat-panel');
      launcherBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> Questions? Start here.';
      document.body.appendChild(launcherBtn);
      console.log('Launcher button created');

      // 2. Create Panel
      panel = document.createElement('div');
      panel.className = 'bm-chat-panel';
      panel.id = 'bm-chat-panel';
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-modal', 'false');
      panel.setAttribute('aria-labelledby', 'bm-chat-title');
      
      panel.innerHTML = `
        <div class="bm-chat-header">
          <h3 id="bm-chat-title">Bur-Men FAQ Assistant</h3>
          <button type="button" class="bm-chat-close" aria-label="Close chat assistant">&times;</button>
        </div>
        <div class="bm-chat-scope">General firm information only—not legal advice. Please do not share confidential or time-sensitive details.</div>
        <div class="bm-chat-messages" role="log" aria-live="polite" aria-atomic="false"></div>
        <div class="bm-chat-input-area">
          <label for="bm-chat-input" style="position:absolute;width:1px;height:1px;overflow:hidden;">Type your question</label>
          <textarea id="bm-chat-input" class="bm-chat-input" placeholder="Type your question..." rows="1" maxlength="500"></textarea>
          <button type="button" class="bm-chat-send" aria-label="Send message">Send</button>
        </div>
      `;
      document.body.appendChild(panel);
      console.log('Chat panel created');

      // 3. Cache DOM elements (MUST happen after innerHTML and append)
      messagesContainer = panel.querySelector('.bm-chat-messages');
      inputField = panel.querySelector('#bm-chat-input');
      sendBtn = panel.querySelector('.bm-chat-send');
      closeBtn = panel.querySelector('.bm-chat-close');

      // Safeguard: ensure elements were found
      if (!inputField || !messagesContainer || !sendBtn || !closeBtn) {
        console.error('Failed to find chat elements in panel. Check panel HTML structure.');
        return;
      }
      console.log('DOM elements cached successfully');

      // 4. Event Listeners (Now safely inside init)
      launcherBtn.addEventListener('click', togglePanel);
      closeBtn.addEventListener('click', closePanel);
      sendBtn.addEventListener('click', handleUserMessage);
      
      inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleUserMessage();
        }
      });

      // Auto-resize textarea
      inputField.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
      });

      // Homepage trigger button
      const homeTrigger = document.querySelector('.bm-chat-trigger-btn');
      if (homeTrigger) {
        homeTrigger.addEventListener('click', (e) => {
          e.preventDefault();
          openPanel();
        });
      }

      // Initial Welcome Message
      addBotMessage("Welcome. I can help you find information about Bur-Men Law Group’s practice areas, consultations, office, and payment link. What would you like to know?", [
        "What types of cases do you handle?",
        "Where is your office?",
        "How do I request a consultation?",
        "How do I make a payment?"
      ]);
      
      console.log('Chatbot initialization complete');
      
    } catch (error) {
      console.error('Error initializing chatbot:', error);
    }
  }

  function togglePanel() {
    isOpen ? closePanel() : openPanel();
  }

  function openPanel() {
    isOpen = true;
    panel.classList.add('is-open');
    launcherBtn.setAttribute('aria-expanded', 'true');
    setTimeout(() => inputField.focus(), 100);
  }

  function closePanel() {
    isOpen = false;
    panel.classList.remove('is-open');
    launcherBtn.setAttribute('aria-expanded', 'false');
    launcherBtn.focus();
  }

  function addBotMessage(text, suggestions = []) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'bm-chat-message bot';
    
    const p = document.createElement('p');
    p.textContent = text;
    msgDiv.appendChild(p);

    if (suggestions.length > 0) {
      const sugDiv = document.createElement('div');
      sugDiv.className = 'bm-chat-suggestions';
      suggestions.forEach(sug => {
        const btn = document.createElement('button');
        btn.className = 'bm-chat-suggestion';
        btn.type = 'button';
        btn.textContent = sug;
        btn.addEventListener('click', () => {
          inputField.value = sug;
          handleUserMessage();
        });
        sugDiv.appendChild(btn);
      });
      msgDiv.appendChild(sugDiv);
    }

    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function addUserMessage(text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'bm-chat-message user';
    msgDiv.textContent = text;
    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function normalizeText(text) {
    return text.toLowerCase().replace(/[^\w\s]/gi, '').trim();
  }

  function handleUserMessage() {
    const rawInput = inputField.value.trim();
    if (!rawInput) return;

    addUserMessage(rawInput);
    inputField.value = '';
    inputField.style.height = 'auto';

    const normalizedInput = normalizeText(rawInput);
    
    if (/\b(911|emergency|danger|hurt|unsafe|suicide)\b/i.test(normalizedInput)) {
      addBotMessage("If you are facing an immediate threat to physical safety, please call 911 immediately. This assistant cannot provide emergency assistance.");
      return;
    }

    if (/\b(ssn|social security|credit card|bank account|routing number)\b/i.test(normalizedInput)) {
      addBotMessage("⚠️ Please do not share confidential details, Social Security numbers, financial information, or card/bank details in this chat. This is not a secure channel. Please call the firm at (224) 637-8872.");
      return;
    }

    let bestMatch = null;
    let highestScore = 0;

    data.faqs.forEach(faq => {
      let score = 0;
      const qNorm = normalizeText(faq.question);
      
      if (qNorm.includes(normalizedInput) || normalizedInput.includes(qNorm)) {
        score += 10;
      }

      faq.keywords.forEach(kw => {
        if (normalizedInput.includes(normalizeText(kw))) score += 2;
      });

      faq.alternateQuestions.forEach(aq => {
        if (normalizeText(aq) === normalizedInput) score += 8;
        else if (normalizeText(aq).includes(normalizedInput) || normalizedInput.includes(normalizeText(aq))) score += 4;
      });

      if (score > highestScore) {
        highestScore = score;
        bestMatch = faq;
      }
    });

    if (highestScore >= 3 && bestMatch) {
      let suggestions = [];
      const sameCategory = data.faqs.filter(f => f.category === bestMatch.category && f.id !== bestMatch.id).slice(0, 2);
      suggestions = sameCategory.map(f => f.question);

      const msgDiv = document.createElement('div');
      msgDiv.className = 'bm-chat-message bot';
      const p = document.createElement('p');
      
      let htmlSafe = bestMatch.answer;
      if (bestMatch.relatedLinks && bestMatch.relatedLinks.length > 0) {
         htmlSafe += " " + bestMatch.relatedLinks.map(l => `<a href="${l.url}" target="_blank" rel="noopener">${l.text}</a>`).join(" ");
      }
      p.innerHTML = htmlSafe;
      msgDiv.appendChild(p);

      if (suggestions.length > 0) {
        const sugDiv = document.createElement('div');
        sugDiv.className = 'bm-chat-suggestions';
        suggestions.forEach(sug => {
          const btn = document.createElement('button');
          btn.className = 'bm-chat-suggestion';
          btn.type = 'button';
          btn.textContent = sug;
          btn.addEventListener('click', () => {
            inputField.value = sug;
            handleUserMessage();
          });
          sugDiv.appendChild(btn);
        });
        msgDiv.appendChild(sugDiv);
      }
      messagesContainer.appendChild(msgDiv);
    } else {
      addBotMessage("I don't have verified information to answer that. You can call Bur-Men Law Group at (224) 637-8872 or use the contact page to request a consultation. Please do not share confidential or time-sensitive details here.", [
        "How do I request a consultation?",
        "What is the firm's phone number?"
      ]);
    }
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Run initialization
  init();
});
