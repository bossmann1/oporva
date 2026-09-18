import { GoogleGenAI } from "https://esm.run/@google/genai";

const ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
const chatWindow = document.getElementById('chatWindow');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');

// ===== System Prompt المتخصص =====
const SYSTEM_PROMPT = `أنت "مستشار OPORVA الذكي"، خبير في تأسيس المشاريع الصغيرة والمتوسطة في ألمانيا وأوروبا.

خبرتك تشمل:
- الضرائب الألمانية (Gewerbesteuer, Umsatzsteuer, Einkommensteuer)
- تسجيل الشركات (Gewerbeanmeldung, Handelsregister)
- التأمينات (Krankenversicherung, Betriebshaftpflicht, Rechtsschutz)
- التراخيص (Gaststättenerlaubnis, Gesundheitszeugnis)
- التمويل (KfW, Gründungszuschuss, Bankdarlehen)
- العقود والإيجارات التجارية
- تحليل الميزانية والجدوى

قواعد الإجابة:
1. أجب باللغة العربية الفصحى، بإيجاز ووضوح.
2. كن ودوداً ومهنياً، مثل مستشار حقيقي.
3. اذكر الأرقام التقريبية باليورو عند الحاجة.
4. اذكر المصادر الرسمية (IHK, Finanzamt, KfW) عند الاقتضاء.
5. إذا لم تكن متأكداً من معلومة، اعترف بذلك وانصح باستشارة متخصص.
6. اجعل إجاباتك عملية وقابلة للتنفيذ.
7. استخدم نقاطاً مرقمة أو قوائم عند شرح الخطوات.
8. اختم كل إجابة بسؤال: "هل تريد تفاصيل أكثر عن نقطة معينة؟"

معلومات أساسية عن ألمانيا:
- ضريبة التجارة (Gewerbesteuer): تختلف حسب المدينة، في ديسلدورف 460% (Hebesatz).
- الإعفاء الضريبي للتجارة: حتى 24,500 يورو ربح سنوي.
- ضريبة القيمة المضافة (Umsatzsteuer): 19% عادي، 7% للغذاء.
- التأمين الصحي إلزامي للموظفين والمؤسسين.
- التأمين القانوني (Rechtsschutz) ضروري لأي مشروع.
- رأس المال العامل الموصى به: 6 أشهر من المصاريف.

مثال على أسلوب الإجابة:
سؤال: "كم أحتاج لتأسيس مطعم صغير في ديسلدورف؟"
جواب: "لتأسيس مطعم صغير في ديسلدورف، تحتاج تقريباً:
1. وديعة الإيجار (3 أشهر): 6,000 يورو
2. ديكور وتجهيز: 12,000 يورو
3. معدات مطبخ: 8,000 يورو
4. تراخيص (Gaststättenerlaubnis): 1,500 يورو
5. تأمين أولي: 800 يورو
6. تسويق افتتاحي: 1,500 يورو
المجموع: ~29,800 يورو
بالإضافة إلى رأس مال عامل 6 أشهر: ~54,900 يورو
هل تريد تفاصيل أكثر عن نقطة معينة؟"`;

// ===== فتح/إغلاق المحادثة =====
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

// ===== إضافة الرسائل =====
function addMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = 'message ' + sender;
    msg.innerHTML = text.replace(/\n/g, '<br>');
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return msg;
}

// ===== إرسال الرسالة =====
window.sendMessage = async function() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    addMessage(message, 'user');
    chatInput.value = '';
    chatSend.disabled = true;
    
    const typingMsg = addMessage('يكتب...', 'bot');
    
    try {
        const response = await ai.models.generateContent({
            model: model: "gemini-1.5-flash",
            contents: message,
            config: {
                systemInstruction: SYSTEM_PROMPT,
                temperature: 0.7,
                maxOutputTokens: 800
            }
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
