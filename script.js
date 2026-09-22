const puterScript = document.createElement('script');
puterScript.src = 'https://js.puter.com/v2/';
document.head.appendChild(puterScript);

let hasGreeted = false;
let currentLang = document.documentElement.lang || 'ar';

function speakGreeting() {
    if (!('speechSynthesis' in window)) return;
    const greetings = {
        ar: 'مرحباً بك في بلان فور. أنا مستشارك الذكي. كيف يمكنني مساعدتك اليوم؟',
        en: 'Welcome to PLANVOR. I am your smart advisor. How can I help you today?',
        de: 'Willkommen bei PLANVOR. Ich bin Ihr intelligenter Berater. Wie kann ich Ihnen heute helfen?'
    };
    const langCodes = { ar: 'ar-SA', en: 'en-US', de: 'de-DE' };
    const greeting = new SpeechSynthesisUtterance(greetings[currentLang] || greetings.ar);
    greeting.lang = langCodes[currentLang] || 'ar-SA';
    greeting.rate = 0.92;
    greeting.pitch = 1.05;
    greeting.volume = 0.95;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(greeting);
}

puterScript.onload = function() {
    const chatWindow = document.getElementById('chatWindow');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const chatSend = document.getElementById('chatSend');

    window.toggleChat = function() {
        chatWindow.classList.toggle('active');
        if (chatWindow.classList.contains('active')) {
            chatInput.focus();
            if (!hasGreeted) {
                hasGreeted = true;
                setTimeout(speakGreeting, 300);
            }
        }
    };

    window.openChat = function() {
        chatWindow.classList.add('active');
        chatInput.focus();
        if (!hasGreeted) {
            hasGreeted = true;
            setTimeout(speakGreeting, 300);
        }
    };

    window.handleKeyPress = function(e) {
        if (e.key === 'Enter') sendMessage();
    };

    window.quickAsk = function(question) {
        chatInput.value = question;
        sendMessage();
    };

    function addMessage(text, sender) {
        const msg = document.createElement('div');
        msg.className = 'message ' + sender;
        msg.innerHTML = String(text).replace(/\n/g, '<br>');
        chatMessages.appendChild(msg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    window.sendMessage = async function() {
        const message = chatInput.value.trim();
        if (!message) return;
        addMessage(message, 'user');
        chatInput.value = '';
        chatSend.disabled = true;

        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message bot';
        typingIndicator.textContent = 'يكتب...';
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            const response = await puter.ai.chat(message, {
                model: 'gpt-5.4-nano'
            });
            typingIndicator.remove();
            addMessage(response, 'bot');
        } catch (error) {
            console.error('Puter.js Error:', error);
            typingIndicator.remove();
            addMessage('عذراً، حدث خطأ. حاول مرة أخرى.', 'bot');
        } finally {
            chatSend.disabled = false;
            chatInput.focus();
        }
    };
};
