// Telegram WebApp API wrapper
const tg = window.Telegram?.WebApp || {
    initDataUnsafe: { user: { id: 123456, first_name: 'Test' } },
    expand: () => {},
    ready: () => {},
    BackButton: { show: () => {}, hide: () => {}, onClick: () => {} }
};

// Inizializza Telegram
try {
    tg.ready();
    tg.expand();
} catch(e) {
    console.log('Telegram non disponibile, modalità test');
}

// Funzioni helper
function getUserId() {
    return tg.initDataUnsafe?.user?.id || 'test_' + Date.now();
}

function getUserName() {
    return tg.initDataUnsafe?.user?.first_name || 'Giocatore';
}

function vibrate(style) {
    try {
        if (tg.HapticFeedback) {
            tg.HapticFeedback.impactOccurred(style || 'light');
        }
    } catch(e) {}
}

function shareToTelegram(score, total) {
    const message = `🧠 Ho fatto ${score}/${total} nel QuizMania Daily! Riesci a battermi? 🎯`;
    try {
        if (tg.openTelegramLink) {
            tg.openTelegramLink(`https://t.me/share/url?url=https://t.me/quiz_daily_italia_bot&text=${encodeURIComponent(message)}`);
        } else {
            alert(message);
        }
    } catch(e) {
        alert(message);
    }
}

console.log('Telegram API caricata');
console.log('User:', getUserName(), 'ID:', getUserId());
