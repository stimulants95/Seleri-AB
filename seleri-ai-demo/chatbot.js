// Demo chatbot with pre-programmed responses
const chatToggle = document.getElementById('chat-toggle');
const chatWindow = document.getElementById('chat-window');
const chatClose = document.getElementById('chat-close');
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');
const chatMessages = document.getElementById('chat-messages');

// Demo responses for common questions
const demoResponses = {
    'hur lägger jag upp ny medarbetare': 'För att lägga upp en ny medarbetare i Agdaweb:\n\n1. Logga in på Agdaweb\n2. Gå till "Personal" → "Ny medarbetare"\n3. Fyll i personnummer och grunduppgifter\n4. Välj anställningsform och lön\n5. Spara och bekräfta\n\nDu kan också se vår instruktionsvideo här: [Länk till video]',

    'hur gör jag lönerevision': 'Lönerevision i Agdaweb görs så här:\n\n1. Gå till "Lön" → "Lönerevision"\n2. Välj period och medarbetare\n3. Ange nya lönebelopp\n4. Granska ändringar\n5. Godkänn och spara\n\nOBS: Kontrollera att alla ändringar är korrekta innan du godkänner!',

    'vad kostar era tjänster': 'Vi erbjuder flera olika tjänster:\n\n• Payroll Business Partner - från 15 000 kr/mån\n• Payroll Business Controller - från 12 000 kr/mån\n• Lönehantering - anpassat efter företagets storlek\n• Utbildning - 5 000 kr/deltagare\n\nKontakta oss för en skräddarsydd offert!',

    'hur bokar jag möte': 'För att boka ett möte med oss:\n\n1. Ring oss på 054-524 600\n2. Maila till info@seleri.se\n3. Eller fyll i kontaktformuläret på hemsidan\n\nVi återkommer inom 24 timmar!',

    'default': 'Tack för din fråga! Jag är en demo-version av Seleri AI. I den riktiga versionen skulle jag kunna svara på alla dina frågor om lönehantering, Agdaweb och våra tjänster.\n\nProva att fråga:\n• "Hur lägger jag upp ny medarbetare?"\n• "Hur gör jag lönerevision?"\n• "Vad kostar era tjänster?"\n• "Hur bokar jag möte?"'
};

// Check if user is logged in when trying to open chat
function checkAuth() {
    if (!sessionStorage.getItem('isLoggedIn') || sessionStorage.getItem('userRole') !== 'customer') {
        // Redirect to login page
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Toggle chat window
chatToggle.addEventListener('click', () => {
    // Check authentication before opening chat
    if (!checkAuth()) {
        return;
    }

    chatWindow.classList.remove('hidden');
    chatInput.focus();
});

chatClose.addEventListener('click', () => {
    chatWindow.classList.add('hidden');
});

// Send message
function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    // Add user message
    addUserMessage(message);
    chatInput.value = '';

    // Simulate bot typing and response
    setTimeout(() => {
        const response = getBotResponse(message);
        addBotMessage(response);
    }, 1000);
}

function getBotResponse(message) {
    const lowerMessage = message.toLowerCase();

    for (const [key, response] of Object.entries(demoResponses)) {
        if (key !== 'default' && lowerMessage.includes(key)) {
            return response;
        }
    }

    return demoResponses.default;
}

function addUserMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.innerHTML = `<div class="message-content">${escapeHtml(text)}</div>`;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function addBotMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    messageDiv.innerHTML = `<div class="message-content">${escapeHtml(text).replace(/\n/g, '<br>')}</div>`;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event listeners
chatSend.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Welcome message on first open (only if authenticated)
let hasOpenedChat = false;
chatToggle.addEventListener('click', () => {
    if (!hasOpenedChat && checkAuth()) {
        hasOpenedChat = true;
        setTimeout(() => {
            addBotMessage('Välkommen! Jag kan hjälpa dig med frågor om:\n\n• Lönehantering i Agdaweb\n• Våra tjänster och priser\n• Boka möten\n• Utbildningar\n\nVad kan jag hjälpa dig med?');
        }, 500);
    }
});
