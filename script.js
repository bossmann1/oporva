const puterScript = document.createElement('script');
puterScript.src = 'https://js.puter.com/v2/';
document.head.appendChild(puterScript);

let hasGreeted = false;
let currentLang = document.documentElement.lang || 'ar';
let isListening = false;
let recognition = null;

// ===== الترحيب الصوتي =====
function speakGreeting() {
    const greetings = {
        ar: 'مرحباً بك في PLANVOR. أنا مستشارك الذكي. كيف يمكنني مساعدتك اليوم؟',
        en: 'Welcome to PLANVOR. I am your smart advisor. How can I help you today?',
        de: 'Willkommen bei PLANVOR. Ich bin Ihr intelligenter Berater. Wie kann ich Ihnen heute helfen?'
    };
    speakText(greetings[currentLang] || greetings.ar);
}

// ===== تحويل النص إلى صوت (Puter.js TTS) =====
async function speakText(text) {
    try {
        // استخدام xAI TTS (سريع ويدعم العربية)
        const audio = await puter.ai.txt2speech(text, {
            provider: 'xai',
            voice: 'ara', // صوت دافئ وودود
            language: 'ar'
        });
        audio.play();
    } catch (error) {
        console.log('Puter TTS failed, trying browser TTS:', error);
        // بديل: استخدام speechSynthesis المدمج
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ar-SA';
            utterance.rate = 0.95;
            utterance.pitch = 1.05;
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        }
    }
}

// ===== تحويل الصوت إلى نص (Web Speech API) =====
function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        console.log('Speech Recognition not supported');
        return null;
    }
    
    const rec = new SpeechRecognition();
    rec.lang = currentLang === 'ar' ? 'ar-SA' : (currentLang === 'de' ? 'de-DE' : 'en-US');
    rec.continuous = false;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    
    rec.onstart = () => {
        isListening = true;
        updateMicButton(true);
    };
    
    rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        chatInput.value = transcript;
        isListening = false;
        updateMicButton(false);
        // إرسال تلقائي بعد التعرف
        setTimeout(() => sendMessage(), 300);
    };
    
    rec.onerror = (event) => {
        console.log('Speech recognition error:', event.error);
        isListening = false;
        updateMicButton(false);
        if (event.error === 'not-allowed') {
            addMessage('⚠️ يرجى السماح بالوصول إلى الميكروفون', 'bot');
        }
    };
    
    rec.onend = () => {
        isListening = false;
        updateMicButton(false);
    };
    
    return rec;
}

// ===== تحديث زر الميكروفون =====
function updateMicButton(listening) {
    const micBtn = document.getElementById('micButton');
    if (micBtn) {
        if (listening) {
            micBtn.classList.add('listening');
            micBtn.textContent = '🔴';
        } else {
            micBtn.classList.remove('listening');
            micBtn.textContent = '🎤';
        }
    }
}

// ===== إضافة زر الميكروفون إلى الواجهة =====
function addMicButton() {
    const inputArea = document.querySelector('.chat-input-area');
    if (!inputArea) return;
    
    // إنشاء زر الميكروفون
    const micBtn = document.createElement('button');
    micBtn.id = 'micButton';
    micBtn.className = 'chat-mic';
    micBtn.innerHTML = '🎤';
    micBtn.title = 'اضغط للتحدث';
    micBtn.onclick = toggleListening;
    
    // إضافته قبل حقل الكتابة
    inputArea.insertBefore(micBtn, inputArea.firstChild);
}

// ===== تبديل الاستماع =====
function toggleListening() {
    if (!recognition) {
        recognition = initSpeechRecognition();
        if (!recognition) {
            addMessage('⚠️ متصفحك لا يدعم التعرف على الصوت. استخدم Chrome أو Edge.', 'bot');
            return;
        }
    }
    
    if (isListening) {
        recognition.stop();
    } else {
        try {
            recognition.start();
        } catch (e) {
            console.log('Recognition already started');
        }
    }
}

// ===== إضافة CSS لزر الميكروفون =====
function addMicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .chat-mic {
            background: rgba(201, 169, 97, 0.15);
            border: 1px solid rgba(201, 169, 97, 0.4);
            border-radius: 50%;
            width: 44px;
            height: 44px;
            cursor: pointer;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
            flex-shrink: 0;
        }
        .chat-mic:hover {
            background: rgba(201, 169, 97, 0.3);
            transform: scale(1.05);
        }
        .chat-mic.listening {
            background: rgba(220, 38, 38, 0.3);
            border-color: #EF4444;
            animation: pulseMic 1s infinite;
        }
        @keyframes pulseMic {
            0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.5); }
            50% { box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
        }
    `;
    document.head.appendChild(style);
}

// ===== التهيئة =====
puterScript.onload = function() {
    const chatWindow = document.getElementById('chatWindow');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const chatSend = document.getElementById('chatSend');

    // إضافة زر الميكروفون
    addMicButton();
    addMicStyles();

    window.toggleChat = function() {
        chatWindow.classList.toggle('active');
        if (chatWindow.classList.contains('active')) {
            chatInput.focus();
            if (!hasGreeted) {
                hasGreeted = true;
                setTimeout(speakGreeting, 500);
            }
        }
    };

    window.openChat = function() {
        chatWindow.classList.add('active');
        chatInput.focus();
        if (!hasGreeted) {
            hasGreeted = true;
            setTimeout(speakGreeting, 500);
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
            // قراءة الرد بصوت
            speakText(response);
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
