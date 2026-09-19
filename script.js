const chatWindow = document.getElementById('chatWindow');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');

const API_URL = 'https://wild-tree-5125.hozayelhelal.workers.dev';

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
}

window.sendMessage = async function() {
    const message = chatInput.value.trim();
    if (!message) return;
    addMessage(message, 'user');
    chatInput.value = '';
    chatSend.disabled = true;
    const typingMsg = document.createElement('div');
    typingMsg.className = 'message bot';
    typingMsg.textContent = 'يكتب...';
    chatMessages.appendChild(typingMsg);

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message })
        });
        const data = await response.json();
        typingMsg.remove();
        addMessage(data.reply, 'bot');
    } catch (error) {
        typingMsg.remove();
        addMessage('عذراً، حدث خطأ. حاول مرة أخرى.', 'bot');
    }
    chatSend.disabled = false;
    chatInput.focus();
};
