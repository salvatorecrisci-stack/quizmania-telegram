const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : {
    initDataUnsafe: { user: null },
    expand: function() {},
    setHeaderColor: function() {},
    setBackgroundColor: function() {},
    BackButton: { show: function() {}, hide: function() {}, onClick: function() {} },
    showAlert: function(msg) { alert(msg); },
    showConfirm: function(msg, callback) { if(confirm(msg)) callback(true); },
    HapticFeedback: { impactOccurred: function() {} },
    openTelegramLink: function() {},
    colorScheme: 'light',
    onEvent: function() {}
};

try {
    tg.expand();
    tg.setHeaderColor('#6C5CE7');
    tg.setBackgroundColor('#6C5CE7');
} catch(e) {
    console.log('Telegram WebApp non disponibile');
}

const telegramUser = (tg.initDataUnsafe && tg.initDataUnsafe.user) || {
    id: 'test_user_' + Math.random(),
    first_name: 'Utente',
    username: 'test'
};

function getUserId() {
    return telegramUser.id || 'local_user_' + Date.now();
}

function getUserName() {
    return telegramUser.first_name || telegramUser.username || 'Giocatore';
}

function showBackButton(callback) {
    try {
        tg.BackButton.show();
        tg.BackButton.onClick(callback);
    } catch(e) {}
}

function hideBackButton() {
    try {
        tg.BackButton.hide();
    } catch(e) {}
}

function showAlert(message) {
    try {
        tg.showAlert(message);
    } catch(e) {
        alert(message);
    }
}

function showConfirm(message, callback) {
    try {
        tg.showConfirm(message, callback);
    } catch(e) {
        if(confirm(message)) callback(true);
    }
}

function vibrate(style) {
    try {
        if (tg.HapticFeedback) {
            tg.HapticFeedback.impactOccurred(style || 'light');
        }
    } catch(e) {}
}

function shareToTelegram(score, totalQuestions) {
    try {
        const message = `🧠 Ho fatto ${score}/${totalQuestions} nel QuizMania Daily!\n\nRiesci a battermi? 🎯`;
        const botUsername = (tg.initDataUnsafe && tg.initDataUnsafe.bot_username) || 'quiz_daily_italia_bot';
        const url = `https://t.me/share/url?url=https://t.me/${botUsername}&text=${encodeURIComponent(message)}`;
        tg.openTelegramLink(url);
    } catch(e) {
        alert('Condividi: Ho fatto ' + score + '/' + totalQuestions + '!');
    }
}

function inviteFriend() {
    try {
        const message = `🧠 Unisciti a me su QuizMania Daily!\n\nQuiz giornalieri, classifiche e sfide! 🎯`;
        const botUsername = (tg.initDataUnsafe && tg.initDataUnsafe.bot_username) || 'quiz_daily_italia_bot';
        const url = `https://t.me/share/url?url=https://t.me/${botUsername}&text=${encodeURIComponent(message)}`;
        tg.openTelegramLink(url);
    } catch(e) {
        alert('Invita i tuoi amici a giocare!');
    }
}

function challengeFriendTelegram(score) {
    try {
        const message = `🎯 Ti sfido su QuizMania Daily!\n\nHo fatto ${score}/10 punti. Riesci a fare di meglio?`;
        const botUsername = (tg.initDataUnsafe && tg.initDataUnsafe.bot_username) || 'quiz_daily_italia_bot';
        const url = `https://t.me/share/url?url=https://t.me/${botUsername}&text=${encodeURIComponent(message)}`;
        tg.openTelegramLink(url);
    } catch(e) {
        alert('Sfida i tuoi amici!');
    }
}

try {
    if (tg.colorScheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
    
    tg.onEvent('themeChanged', function() {
        if (tg.colorScheme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    });
} catch(e) {}

console.log('Telegram API inizializzata');
console.log('Utente:', getUserName());
console.log('User ID:', getUserId());
