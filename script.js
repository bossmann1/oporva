window.toggleChat = function() {
    var w = document.getElementById('chatWindow');
    if (w) { w.classList.toggle('active'); }
};

window.openChat = function() {
    var w = document.getElementById('chatWindow');
    if (w) { w.classList.add('active'); }
};

window.handleKeyPress = function(e) {
    if (e.key === 'Enter') { window.sendMessage(); }
};

window.sendMessage = function() {
    var input = document.getElementById('chatInput');
    var messages = document.getElementById('chatMessages');
    if (!input || !messages) return;
    var message = input.value.trim();
    if (!message) return;
    var userMsg = document.createElement('div');
    userMsg.className = 'message user';
    userMsg.textContent = message;
    messages.appendChild(userMsg);
    input.value = '';
    var botMsg = document.createElement('div');
    botMsg.className = 'message bot';
    botMsg.textContent = 'شكراً على سؤالك! المستشار الذكي قيد التطوير حالياً.';
    messages.appendChild(botMsg);
    messages.scrollTop = messages.scrollHeight;
};
