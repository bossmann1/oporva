import { GoogleGenAI } from "https://esm.run/@google/genai";

const ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
const chatWindow = document.getElementById('chatWindow');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');

window.toggleChat = function() {
    chatWindow.classList.toggle('active');
    if (chatWindow.classList.contains('active')) chatInput.focus();
};

window.openChat = function() {
    chatWindow.classList.add('active');
    chatInput.focus();
};

window.handleKeyPress = function(e) {
    if (e.key === 'Enter') sendMessage();
};

function addMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = 'message ' + sender;
    msg.textContent = text;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return msg;
}

window.sendMessage = async function() {
    const message = chatInput.value.trim();
    if (!message) return;
    addMessage(message, 'user');
    chatInput.value = '';
    chatSend.disabled = true;
    const typingMsg = addMessage('يكتب...', 'bot');
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-exp",
            contents: message,
        });
        typingMsg.remove();
        addMessage(response.text, 'bot');
    } catch (error) {
        console.error(error);
        typingMsg.remove();
        addMessage('عذراً، حدث خطأ. حاول مرة أخرى.', 'bot');
    }
    chatSend.disabled = false;
    chatInput.focus();
};
