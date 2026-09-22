const puterScript = document.createElement('script');
puterScript.src = 'https://js.puter.com/v2/';
document.head.appendChild(puterScript);

let hasGreeted = false;
let currentLang = document.documentElement.lang || 'ar';
let isListening = false;
let recognition = null;
let currentAudio = null;

window.stopAllAudio = function() {
    if (currentAudio) {
        try {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio = null;
        } catch (e) { console.log('Audio stop error:', e); }
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    const stopBtn = document.getElementById('stopAudioButton');
    if (stopBtn) stopBtn.style.display = 'none';
};

function showStopButton() {
    const stopBtn = document.getElementById('stopAudioButton');
    if (stopBtn) stopBtn.style.display = 'flex';
}

function speakGreeting() {
    const greetings = {
        ar: 'مرحباً بك في PLANVOR. أنا مستشارك الذكي. كيف يمكنني مساعدتك اليوم؟',
        en: 'Welcome to PLANVOR. I am your smart advisor. How can I help you today?',
        de: 'Willkommen bei PLANVOR. Ich bin Ihr intelligenter Berater. Wie kann ich Ihnen heute helfen?'
    };
    speakText(greetings[currentLang] || greetings.ar);
}

async function speakText(text) {
    window.stopAllAudio();
    showStopButton();
    try {
        const audio = await puter.ai.txt2speech(text, {
            provider: 'xai',
            voice: 'ara',
            language: 'ar'
        });
        currentAudio = audio;
        audio.onended = () => window.stopAllAudio();
        audio.onerror = () => window.stopAllAudio();
        audio.play();
    } catch (error) {
        console.log('Puter TTS failed, using browser:', error);
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ar-SA';
            utterance.rate = 0.95;
            utterance.onend = () => window.stopAllAudio();
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        } else {
            window.stopAllAudio();
        }
    }
}

function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;
    const rec = new SpeechRecognition();
    rec.lang = currentLang === 'ar' ? 'ar-SA' : (currentLang === 'de' ? 'de-DE' : 'en-US');
    rec.continuous = false;
    rec.interimResults = false;
    rec.onstart = () => { isListening = true; updateMicButton(true); window.stopAllAudio(); };
    rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById('chatInput').value = transcript;
        isListening = false;
        updateMicButton(false);
        setTimeout(() => sendMessage(), 300);
    };
    rec.onerror = () => { isListening = false; updateMicButton(false); };
    rec.onend = () => { isListening = false; updateMicButton(false); };
    return rec;
}

function updateMicButton(listening) {
    const micBtn = document.getElementById('micButton');
    if (micBtn) {
        if (listening) { micBtn.classList.add('listening'); micBtn.textContent = '🔴'; }
        else { micBtn.classList.remove('listening'); micBtn.textContent = '🎤'; }
    }
}

function toggleListening() {
    if (!recognition) {
        recognition = initSpeechRecognition();
        if (!recognition) { alert('⚠️ متصفحك لا يدعم الصوت. استخدم Chrome.'); return; }
    }
    if (isListening) recognition.stop();
    else try { recognition.start(); } catch (e) {}
}

puterScript.onload = function() {
    const chatWindow = document.getElementById('chatWindow');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const chatSend = document.getElementById('chatSend');
    const micButton = document.getElementById('micButton');
    if (micButton) micButton.onclick = toggleListening;

    window.toggleChat = function() {
        chatWindow.classList.toggle('active');
        if (chatWindow.classList.contains('active')) {
            chatInput.focus();
            if (!hasGreeted) { hasGreeted = true; setTimeout(speakGreeting, 500); }
        } else {
            window.stopAllAudio();
        }
    };

    window.openChat = function() {
        chatWindow.classList.add('active');
        chatInput.focus();
        if (!hasGreeted) { hasGreeted = true; setTimeout(speakGreeting, 500); }
    };

    window.handleKeyPress = function(e) { if (e.key === 'Enter') sendMessage(); };
    window.quickAsk = function(question) { chatInput.value = question; sendMessage(); };

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
        window.stopAllAudio();
        addMessage(message, 'user');
        chatInput.value = '';
        chatSend.disabled = true;
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message bot';
        typingIndicator.textContent = 'يكتب...';
        chatMessages.appendChild(typingIndicator);
        try {
            const response = await puter.ai.chat(message, { model: 'gpt-5.4-nano' });
            typingIndicator.remove();
            addMessage(response, 'bot');
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

window.addEventListener('beforeunload', window.stopAllAudio);
