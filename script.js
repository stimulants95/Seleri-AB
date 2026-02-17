// ==================== 
// Auth Management
// ====================

function checkAuthState() {
    const user = JSON.parse(localStorage.getItem('seleri_user'));

    // Manage Chat Input State
    const chatInput = document.getElementById('chatInput');
    const chatHeader = document.querySelector('.chat-header');

    // Remove existing logout button from header if it exists
    const existingLogout = document.getElementById('chat-logout-btn');
    if (existingLogout) existingLogout.remove();

    if (user) {
        if (chatInput) {
            chatInput.disabled = false;
            chatInput.placeholder = "Skriv ditt meddelande...";
        }

        // Add Logout button to Chat Header
        if (chatHeader) {
            const logoutBtn = document.createElement('button');
            logoutBtn.id = 'chat-logout-btn';
            logoutBtn.className = 'chat-logout-action';
            logoutBtn.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Logga ut</span>
            `;
            logoutBtn.onclick = (e) => {
                e.stopPropagation();
                logout();
            };
            chatHeader.appendChild(logoutBtn);
        }
    } else {
        if (chatInput) {
            chatInput.disabled = true;
            chatInput.placeholder = "Logga in för att använda chatten";
        }
    }
}

function logout() {
    localStorage.removeItem('seleri_user');
    window.location.reload();
}

// ==================== 
// Navigation
// ====================

const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

// Navbar scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// Active link on scroll
const sections = document.querySelectorAll('section[id]');

function updateActiveLink() {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const link = document.querySelector(`.nav-link[href="#${sectionId}"]`);

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(l => l.classList.remove('active'));
            if (link) link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', updateActiveLink);

// ==================== 
// Contact Form
// ====================

const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);

        // Simulate form submission
        console.log('Form submitted:', data);

        // Show success message
        alert('Tack för ditt meddelande! Vi återkommer så snart som möjligt.');

        // Reset form
        contactForm.reset();
    });
}

// ==================== 
// Chat Widget
// ====================

const chatWidget = document.getElementById('chatWidget');
const chatToggle = document.getElementById('chatToggle');
const chatContainer = document.getElementById('chatContainer');
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const quickReplies = document.querySelectorAll('.quick-reply');

// Toggle chat
if (chatToggle) {
    chatToggle.addEventListener('click', () => {
        chatWidget.classList.toggle('active');
        if (chatWidget.classList.contains('active')) {
            const user = JSON.parse(localStorage.getItem('seleri_user'));
            if (!user) {
                // Clear messages and show login prompt if not logged in
                chatMessages.innerHTML = `
                    <div class="message bot-message">
                        <div class="message-avatar">AI</div>
                        <div class="message-content">
                            <p>Hej! För att kunna chatta med mig och få personlig hjälp behöver du logga in.</p>
                            <a href="login.html" class="btn btn-primary" style="margin-top: 10px; font-size: 0.8rem; padding: 0.5rem 1rem;">Logga in nu</a>
                        </div>
                    </div>
                `;
            }
            chatInput.focus();
            // Remove notification badge
            const badge = chatToggle.querySelector('.chat-badge');
            if (badge) {
                setTimeout(() => {
                    badge.style.display = 'none';
                }, 300);
            }
        }
    });
}

// Quick replies
quickReplies.forEach(button => {
    button.addEventListener('click', async () => {
        const user = JSON.parse(localStorage.getItem('seleri_user'));
        if (!user) {
            window.location.href = 'login.html';
            return;
        }
        const message = button.getAttribute('data-message');
        if (message) {
            addUserMessage(message);

            // Bot "thinking" state
            const typingId = 'typing-' + Date.now();
            const typingMsg = document.createElement('div');
            typingMsg.id = typingId;
            typingMsg.className = 'message bot-message';
            typingMsg.innerHTML = `
                <div class="message-avatar">AI</div>
                <div class="message-content">
                    <div class="typing-indicator">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            `;
            chatMessages.appendChild(typingMsg);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            // Get real response from Azure
            const botResponse = await getBotResponse(message);

            // Remove typing indicator and add real message
            document.getElementById(typingId).remove();
            addBotMessage(botResponse);
        }
    });
});

// Bot response logic – tries Azure RAG first, falls back to keywords
async function getBotResponse(message) {
    const user = JSON.parse(localStorage.getItem('seleri_user'));
    const userName = user ? (user.name.split(' ')[1] || user.name) : '';

    // Step 1: Try Azure AI Search for document context
    let context = [];
    try {
        const searchResults = await AzureIntegration.searchKnowledge(message);
        if (searchResults && searchResults.length > 0 && !searchResults[0].includes('saknas')) {
            context = searchResults;
        }
    } catch (err) {
        console.warn('Search unavailable:', err);
    }

    // Step 2: Try Azure OpenAI (with or without search context)
    try {
        const result = await AzureIntegration.generateAnswer(message, context);
        const answer = typeof result === 'object' ? result.answer : result;
        const usage = typeof result === 'object' ? result.usage : null;

        if (answer && !answer.includes('nyckel saknas')) {
            // Show token usage as subtle footer
            if (usage) {
                const tokenInfo = `\n\n_📊 Tokens: ${usage.prompt_tokens} in / ${usage.completion_tokens} ut / ${usage.total_tokens} totalt_`;
                return answer + tokenInfo;
            }
            return answer;
        }
    } catch (err) {
        console.warn('OpenAI unavailable:', err);
    }

    // Step 3: Fallback keyword responses
    const msg = message.toLowerCase();
    if ((msg.includes('hej') || msg.includes('hallå')) && msg.length < 20) {
        return 'Hej' + (userName ? ' ' + userName : '') + '! Hur kan jag hjälpa dig idag?';
    } else if (msg.includes('tjänst') || msg.includes('service')) {
        return 'Vi erbjuder: Payroll Business Partner, Payroll Business Controller, Lönehantering och Utbildning.';
    } else if (msg.includes('kontakt') || msg.includes('ring') || msg.includes('mail')) {
        return 'Du når oss på:\nTelefon: 054-524 600\nE-post: lon@seleri.se';
    } else if (msg.includes('tack')) {
        return 'Varsågod!';
    }
    return 'Tack för din fråga! AI-assistenten kunde inte nås just nu. Testa igen om en stund eller fråga om våra tjänster!';
}




// Send message
if (chatForm) {
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('seleri_user'));
        if (!user) {
            window.location.href = 'login.html';
            return;
        }
        const message = chatInput.value.trim();
        if (!message) return;

        // Add user message
        addUserMessage(message);
        chatInput.value = '';

        // Bot "thinking" state
        const typingId = 'typing-' + Date.now();
        const typingMsg = document.createElement('div');
        typingMsg.id = typingId;
        typingMsg.className = 'message bot-message';
        typingMsg.innerHTML = `
            <div class="message-avatar">AI</div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;
        chatMessages.appendChild(typingMsg);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Get real response from Azure
        const botResponse = await getBotResponse(message);

        // Remove typing indicator and add real message
        document.getElementById(typingId).remove();
        addBotMessage(botResponse);
    });
}

// Helper functions to add messages to chat
function addUserMessage(message) {
    addMessageToChat(message, true);
}

function addBotMessage(message) {
    addMessageToChat(message, false);
}

function addMessageToChat(message, isUser = false) {
    if (!chatMessages) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = isUser ? 'message user-message' : 'message bot-message';

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.textContent = isUser ? 'DU' : 'AI';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    if (isUser) {
        const textP = document.createElement('p');
        textP.textContent = message;
        contentDiv.appendChild(textP);
    } else {
        // Render markdown for bot messages
        contentDiv.innerHTML = renderMarkdown(message);
    }

    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Lightweight markdown → HTML renderer
function renderMarkdown(text) {
    if (!text) return '';

    // Escape HTML first (security)
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Headers: ## Header → <h3>, ### Header → <h4>
    html = html.replace(/^### (.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^## (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^\*\*(.+?)\*\*$/gm, '<h4>$1</h4>');

    // Bold: **text** → <strong>
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Italic: _text_ → <em> (but not in URLs)
    html = html.replace(/(?<!\w)_(.+?)_(?!\w)/g, '<em>$1</em>');

    // Bullet lists: - item or • item → <li>
    html = html.replace(/^[\-•] (.+)$/gm, '<li>$1</li>');
    // Wrap consecutive <li> in <ul>
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

    // Numbered lists: 1. item → <li>
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Line breaks: double newline → paragraph break
    html = html.replace(/\n\n/g, '</p><p>');
    // Single newlines (not inside lists) → <br>
    html = html.replace(/\n/g, '<br>');

    // Clean up <br> inside <ul>
    html = html.replace(/<br><ul>/g, '<ul>');
    html = html.replace(/<\/ul><br>/g, '</ul>');
    html = html.replace(/<br><\/ul>/g, '</ul>');
    html = html.replace(/<br><li>/g, '<li>');

    // Wrap in paragraph
    html = '<p>' + html + '</p>';

    // Clean empty paragraphs
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p><br><\/p>/g, '');

    return html;
}


// getBotResponse is defined above with Azure RAG integration


// ==================== 
// Smooth Scroll
// ====================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ==================== 
// Intersection Observer for Animations
// ====================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.service-card, .testimonial-card, .about-feature, .visual-card, .team-member').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ==================== 
// Testimonials Typewriter Effect
// ====================

const testimonials = [
    {
        text: "De känms mer som vår egen löneavdelning än som en extern konsult. Vi kan alltid vända oss till Seleri med frågor och funderingar.",
        author: "Jenny Svenkvist",
        title: "CFO, Combi Wear Parts AB",
        avatar: "JS"
    },
    {
        text: "Seleri har hjälpt oss att utveckla våra processer och att hitta smartare arbetssätt. Resultatet är en trygg och effektiv löneprocess.",
        author: "Elisabeth Tengblad",
        title: "HR-chef, Spicer Nordiska Kardan",
        avatar: "ET"
    },
    {
        text: "Seleri hanterar inte bara våra löner effektivt, vi får även tillgång till specialister som verkligen förstår kopplingen mellan lön och ekonomi.",
        author: "Marie Nyström",
        title: "Redovisningschef, Bharat Forge Kilsta",
        avatar: "MN"
    }
];

let currentTestimonial = 0;
let typingInterval;
let autoAdvanceTimeout;
const typewriterText = document.getElementById('typewriterText');
const authorAvatar = document.getElementById('authorAvatar');
const authorName = document.getElementById('authorName');
const authorTitle = document.getElementById('authorTitle');
const testimonialAuthor = document.getElementById('testimonialAuthor');
const testimonialDots = document.getElementById('testimonialDots');

function initTestimonials() {
    if (!typewriterText) return;

    // Create dots
    testimonials.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = index === 0 ? 'dot active' : 'dot';
        dot.addEventListener('click', () => {
            if (currentTestimonial === index) return;
            showTestimonial(index);
        });
        testimonialDots.appendChild(dot);
    });

    showTestimonial(0);
}

function showTestimonial(index) {
    if (!typewriterText) return;

    // Clear any existing processes
    clearInterval(typingInterval);
    clearTimeout(autoAdvanceTimeout);

    currentTestimonial = index;
    const data = testimonials[index];

    // Update dots
    document.querySelectorAll('.dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });

    // Hide author immediately and clear text
    if (testimonialAuthor) testimonialAuthor.classList.remove('visible');
    typewriterText.textContent = '';

    // Preparare next author info (but keep hidden)
    if (authorAvatar) authorAvatar.textContent = data.avatar;
    if (authorName) authorName.textContent = data.author;
    if (authorTitle) authorTitle.textContent = data.title;

    // Type text
    let charIndex = 0;
    typingInterval = setInterval(() => {
        if (charIndex < data.text.length) {
            typewriterText.textContent += data.text.charAt(charIndex);
            charIndex++;
        } else {
            clearInterval(typingInterval);

            // Show author with a slight delay for better flow
            setTimeout(() => {
                if (testimonialAuthor) testimonialAuthor.classList.add('visible');
            }, 100);

            // Auto-advance after 7 seconds
            autoAdvanceTimeout = setTimeout(() => {
                const next = (index + 1) % testimonials.length;
                showTestimonial(next);
            }, 7000);
        }
    }, 25);
}

// ==================== 
// Initialize
// ====================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Seleri website loaded successfully!');

    checkAuthState();
    initTestimonials();

    // Show welcome notification after 3 seconds
    setTimeout(() => {
        if (chatToggle) {
            const badge = chatToggle.querySelector('.chat-badge');
            if (badge && !chatWidget.classList.contains('active')) {
                badge.style.display = 'flex';
            }
        }
    }, 3000);
});
