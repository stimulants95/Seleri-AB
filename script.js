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
chatToggle.addEventListener('click', () => {
    chatWidget.classList.toggle('active');
    if (chatWidget.classList.contains('active')) {
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

// Quick replies
quickReplies.forEach(button => {
    button.addEventListener('click', () => {
        const message = button.getAttribute('data-message');
        sendMessage(message, true);
    });
});

// Send message
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (message) {
        sendMessage(message, true);
        chatInput.value = '';
    }
});

function sendMessage(message, isUser = false) {
    // Add user message
    if (isUser) {
        addMessageToChat(message, true);

        // Simulate bot response
        setTimeout(() => {
            const response = getBotResponse(message);
            addMessageToChat(response, false);
        }, 1000);
    } else {
        addMessageToChat(message, false);
    }
}

function addMessageToChat(message, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = isUser ? 'message user-message' : 'message bot-message';

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.textContent = isUser ? 'DU' : 'AI';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    const textP = document.createElement('p');
    textP.textContent = message;

    contentDiv.appendChild(textP);
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);

    chatMessages.appendChild(messageDiv);

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getBotResponse(userMessage) {
    const message = userMessage.toLowerCase();

    // Simple keyword-based responses
    if (message.includes('tjänst') || message.includes('service')) {
        return 'Vi erbjuder flera tjänster: Payroll Business Partner, Payroll Business Controller, Lönehantering och Utbildning. Vilken tjänst är du intresserad av?';
    } else if (message.includes('payroll business partner')) {
        return 'Vår Payroll Business Partner-tjänst kombinerar specialistkunskap inom lön med ett konsultativt förhållningssätt. Vi skapar värde för både HR, ekonomi och verksamheten. Vill du veta mer?';
    } else if (message.includes('payroll business controller')) {
        return 'Som Payroll Business Controller kombinerar vi djup förståelse för lön med ekonomisk analys och styrning. Vi levererar kunskap och rätt beslutsunderlag till ledningen. Ska vi boka ett möte?';
    } else if (message.includes('lönehantering')) {
        return 'Vi erbjuder komplett lönehantering med trygghet och precision. Vi tar rollen som er löneavdelning och säkrar att löneutbetalningen fungerar. Vill du ha en offert?';
    } else if (message.includes('utbildning')) {
        return 'Vi erbjuder utbildningar inom Agda PS, för lönespecialister och skräddarsydda program. Vilken typ av utbildning är du intresserad av?';
    } else if (message.includes('pris') || message.includes('kostnad') || message.includes('offert')) {
        return 'För att ge dig en korrekt prisuppgift behöver vi veta lite mer om dina behov. Vill du fylla i kontaktformuläret så återkommer vi med en skräddarsydd offert?';
    } else if (message.includes('möte') || message.includes('boka')) {
        return 'Utmärkt! Du kan ringa oss på 054-524 600 (vardagar 8.00-17.00) eller skicka ett mail till lon@seleri.se så bokar vi ett möte.';
    } else if (message.includes('kontakt') || message.includes('ring') || message.includes('mail')) {
        return 'Du når oss på:\nTelefon: 054-524 600 (vardagar 8.00-17.00)\nE-post: lon@seleri.se\nAdress: Nolgårdsvägen 15, 663 41 Hammarö';
    } else if (message.includes('företag') || message.includes('hjälp')) {
        return 'Vi hjälper företag med komplexa löneprocesser. Med över 15 års erfarenhet är vi specialister på att skapa trygghet och effektivitet i lönehanteringen. Vad kan vi hjälpa dig med specifikt?';
    } else if (message.includes('hej') || message.includes('hallå') || message.includes('tjena')) {
        return 'Hej! Vad roligt att du hör av dig. Hur kan jag hjälpa dig idag?';
    } else if (message.includes('tack')) {
        return 'Varsågod! Finns det något mer jag kan hjälpa dig med?';
    } else {
        return 'Tack för ditt meddelande. Jag kan hjälpa dig med information om våra tjänster, priser, eller boka ett möte. Vad är du intresserad av?';
    }
}

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
        text: "De känns mer som vår egen löneavdelning än som en extern konsult. Vi kan alltid vända oss till Seleri med frågor och funderingar.",
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
    testimonialAuthor.classList.remove('visible');
    typewriterText.textContent = '';

    // Preparare next author info (but keep hidden)
    authorAvatar.textContent = data.avatar;
    authorName.textContent = data.author;
    authorTitle.textContent = data.title;

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
                testimonialAuthor.classList.add('visible');
            }, 100);

            // Auto-advance after 7 seconds
            autoAdvanceTimeout = setTimeout(() => {
                const next = (index + 1) % testimonials.length;
                showTestimonial(next);
            }, 7000);
        }
    }, 25); // Slightly faster typing for better flow
}

// ==================== 
// Initialize
// ====================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Seleri website loaded successfully!');

    initTestimonials();

    // Show welcome notification after 3 seconds
    setTimeout(() => {
        const badge = chatToggle.querySelector('.chat-badge');
        if (badge && !chatWidget.classList.contains('active')) {
            badge.style.display = 'flex';
        }
    }, 3000);
});
