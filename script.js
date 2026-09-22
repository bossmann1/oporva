const puterScript = document.createElement('script');
puterScript.src = 'https://js.puter.com/v2/';
document.head.appendChild(puterScript);

let hasGreeted = false;
let currentLang = document.documentElement.lang || 'ar';
let isListening = false;
let recognition = null;
let currentAudio = null;
let isSpeaking = false;

// ===== إيقاف كل الأصوات =====
function stopAllAudio() {
    // إيقاف Puter audio
    if (currentAudio) {
        try {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio = null;
        } catch (e) { console.log('Audio stop error:', e); }
    }
    // إيقاف speechSynthesis
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
    isSpeaking = false;
    updateStopButton(false);
}

// ===== تحديث زر الإيقاف =====
function updateStopButton(speaking) {
    const stopBtn = document.getElementById('stopAudioButton');
    if (stopBtn) {
        stopBtn.style.display = speaking ? 'flex' : 'none';
    }
}

// ===== الترحيب الصوتي =====
function speakGreeting() {
    const greetings = {
        ar: 'مرحباً بك في PLANVOR. أنا مستشارك الذكي. كيف يمكنني مساعدتك اليوم؟',
        en: 'Welcome to PLANVOR. I am your smart advisor. How can I help you today?',
        de: 'Willkommen bei PLANVOR. Ich bin Ihr intelligenter Berater. Wie kann ich Ihnen heute helfen?'
    };
    speakText(greetings[currentLang] || greetings.ar);
}

// ===== تحويل النص إلى صوت =====
async function speakText(text) {
    // أوقف أي صوت قيد التشغيل
    stopAllAudio();
    
    try {
        isSpeaking = true;
        updateStopButton(true);
        
        const audio = await puter.ai.txt2speech(text, {
            provider: 'xai',
            voice: 'ara',
            language: 'ar'
        });
        
        currentAudio = audio;
        
        audio.onended = () => {
            isSpeaking = false;
            currentAudio = null;
            updateStopButton(false);
        };
        
        audio.onerror = () => {
            isSpeaking = false;
            currentAudio = null;
            updateStopButton(false);
        };
        
        audio.play();
    } catch (error) {
        console.log('Puter TTS failed, using browser TTS:', error);
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ar-SA';
            utterance.rate = 0.95;
            utterance.pitch = 1.05;
            utterance.onend = () => {
                isSpeaking = false;
                updateStopButton(false);
            };
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        } else {
            isSpeaking = false;
            updateStopButton(false);
        }
    }
}

// ===== تحويل الصوت إلى نص =====
function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;
    
    const rec = new SpeechRecognition();
    rec.lang = currentLang === 'ar' ? 'ar-SA' : (currentLang === 'de' ? 'de-DE' : 'en-US');
    rec.continuous = false;
    rec.interimResults = false;
    
    rec.onstart = () => {
        isListening = true;
        updateMicButton(true);
        // أوقف أي صوت قيد التشغيل
        stopAllAudio();
    };
    
    rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById('chatInput').value = transcript;
        isListening = false;
        updateMicButton(false);
        setTimeout(() => sendMessage(), 300);
    };
    
    rec.onerror = (event) => {
        isListening = false;
        updateMicButton(false);
    };
    
    rec.onend = () => {
        isListening = false;
        updateMicButton(false);
    };
    
    return rec;
}

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

// ===== إضافة زر الميكروفون وزر الإيقاف =====
function addControls() {
    const inputArea = document.querySelector('.chat-input-area');
    if (!inputArea) return;
    
    // زر الميكروفون
    const micBtn = document.createElement('button');
    micBtn.id = 'micButton';
    micBtn.className = 'chat-mic';
    micBtn.innerHTML = '🎤';
    micBtn.title = 'اضغط للتحدث';
    micBtn.onclick = toggleListening;
    inputArea.insertBefore(micBtn, inputArea.firstChild);
    
    // زر إيقاف الصوت (في رأس المحادثة)
    const chatHeader = document.querySelector('.chat-header');
    if (chatHeader) {
        const stopBtn = document.createElement('button');
        stopBtn.id = 'stopAudioButton';
        stopBtn.className = 'stop-audio';
        stopBtn.innerHTML = '⏹️';
        stopBtn.title = 'إيقاف الصوت';
        stopBtn.style.display = 'none';
        stopBtn.onclick = stopAllAudio;
        chatHeader.insertBefore(stopBtn, chatHeader.querySelector('.chat-close'));
    }
}

function toggleListening() {
    if (!recognition) {
        recognition = initSpeechRecognition();
        if (!recognition) {
            addMessage('⚠️ متصفحك لا يدعم التعرف على الصوت. استخدم Chrome.', 'bot');
            return;
        }
    }
    if (isListening) {
        recognition.stop();
    } else {
        try { recognition.start(); } catch (e) {}
    }
}

// ===== CSS للأزرار =====
function addStyles() {
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
        .chat-mic:hover { background: rgba(201, 169, 97, 0.3); transform: scale(1.05); }
        .chat-mic.listening {
            background: rgba(220, 38, 38, 0.3);
            border-color: #EF4444;
            animation: pulseMic 1s infinite;
        }
        @keyframes pulseMic {
            0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.5); }
            50% { box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
        }
        .stop-audio {
            background: rgba(239, 68, 68, 0.2);
            border: 1px solid rgba(239, 68, 68, 0.5);
            color: white;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            cursor: pointer;
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-left: auto;
            margin-right: 10px;
            transition: all 0.3s;
            animation: pulseStop 1.5s infinite;
        }
        .stop-audio:hover { background: rgba(239, 68, 68, 0.4); transform: scale(1.1); }
        @keyframes pulseStop {
            0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.5); }
            50% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
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

    addControls();
    addStyles();

    window.toggleChat = function() {
        chatWindow.classList.toggle('active');
        if (chatWindow.classList.contains('active')) {
            chatInput.focus();
            if (!hasGreeted) {
                hasGreeted = true;
                setTimeout(speakGreeting, 500);
            }
        } else {
            // عند إغلاق النافذة، أوقف الصوت
            stopAllAudio();
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
        
        // أوقف أي صوت قبل إرسال رسالة جديدة
        stopAllAudio();
        
        addMessage(message, 'user');
        chatInput.value = '';
        chatSend.disabled = true;

        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message bot';
        typingIndicator.textContent = 'يكتب...';
        chatMessages.appendChild(typingIndicator);

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
            addMessage('عذراً، حدث خطأ.', 'bot');
        } finally {
            chatSend.disabled = false;
            chatInput.focus();
        }
    };
};

// ===== إيقاف الصوت عند مغادرة الصفحة =====
window.addEventListener('beforeunload', stopAllAudio);
