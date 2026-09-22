const puterScript = document.createElement('script');
puterScript.src = 'https://js.puter.com/v2/';
document.head.appendChild(puterScript);

puterScript.onload = function() {
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
        msg.innerHTML = text.replace(/\n/g, '<br>');
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

        try {
            const response = await puter.ai.chat(message, {
                model: 'gpt-5.4-nano'
            });

            typingIndicator.remove();
            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'message bot';
            botMessageDiv.innerHTML = String(response).replace(/\n/g, '<br>');
            chatMessages.appendChild(botMessageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
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
