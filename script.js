// ملف script.js - تحديث كامل لربط الموقع مع Puter.js

// 1. تحميل مكتبة Puter.js (يجب أن يكون هذا في أعلى الملف)
const puterScript = document.createElement('script');
puterScript.src = 'https://js.puter.com/v2/';
document.head.appendChild(puterScript);

// 2. انتظر تحميل المكتبة، ثم ابدأ في تعريف الوظائف
puterScript.onload = function() {
    console.log("Puter.js loaded successfully!");

    // العثور على عناصر واجهة المحادثة
    const chatWindow = document.getElementById('chatWindow');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const chatSend = document.getElementById('chatSend');

    // دالة لفتح وإغلاق نافذة المحادثة
    window.toggleChat = function() {
        chatWindow.classList.toggle('active');
        if (chatWindow.classList.contains('active')) chatInput.focus();
    };

    window.openChat = function() {
        chatWindow.classList.add('active');
        chatInput.focus();
    };

    // دالة للتعامل مع الضغط على زر Enter
    window.handleKeyPress = function(e) {
        if (e.key === 'Enter') sendMessage();
    };

    // دالة لإضافة رسالة إلى نافذة المحادثة
    function addMessage(text, sender) {
        const msg = document.createElement('div');
        msg.className = 'message ' + sender;
        msg.innerHTML = text.replace(/\n/g, '<br>'); // لدعم الأسطر الجديدة
        chatMessages.appendChild(msg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // الدالة الرئيسية لإرسال الرسالة
    window.sendMessage = async function() {
        const message = chatInput.value.trim();
        if (!message) return;

        // 1. عرض رسالة المستخدم فوراً
        addMessage(message, 'user');
        chatInput.value = '';
        chatSend.disabled = true;

        // 2. عرض مؤشر "يكتب..."
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message bot';
        typingIndicator.textContent = 'يكتب...';
        chatMessages.appendChild(typingIndicator);

        try {
            // 3. استدعاء Puter.js مع النموذج المحدد
            // يمكنك تغيير النموذج إلى "openai/gpt-5.4-nano" أو "anthropic/claude-sonnet-5" إذا أردت
            const response = await puter.ai.chat(message, {
    model: 'gpt-5.4-nano'
});
                stream: true // تفعيل البث للحصول على رد فوري
            });

            // 4. إزالة مؤشر "يكتب..."
            typingIndicator.remove();

            // 5. معالجة الرد المتدفق وإضافته للواجهة
            const botMessageDiv = document.createElement('div');
            botMessageDiv.className = 'message bot';
            chatMessages.appendChild(botMessageDiv);

            let fullResponse = '';
            for await (const part of response) {
                if (part?.text) {
                    fullResponse += part.text;
                    botMessageDiv.innerHTML = fullResponse.replace(/\n/g, '<br>');
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }
            }

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
