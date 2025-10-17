const tg = window.Telegram.WebApp;
tg.expand();
tg.setHeaderColor('#6C5CE7');
tg.setBackgroundColor('#6C5CE7');

const telegramUser = tg.initDataUnsafe.user || {
    id: 'test_user',
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
    tg.BackButton.show();
    tg.BackButton.onClick(callback);
}

function hideBackButton() {
    tg.BackButton.hide();
}

function showAlert(message) {
    tg.showAlert(message);
}

function showConfirm(message, callback) {
    tg.showConfirm(message, callback);
}

function vibrate(style) {
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred(style || 'light');
    }
}

function shareToTelegram(score, totalQuestions) {
    const message = `🧠 Ho fatto ${score}/${totalQuestions} nel QuizMania Daily!\n\nRiesci a battermi? 🎯`;
    const url = `https://t.me/share/url?url=https://t.me/${tg.initDataUnsafe.bot_username || 'quiz_daily_italia_bot'}&text=${encodeURIComponent(message)}`;
    tg.openTelegramLink(url);
}

function inviteFriend() {
    const message = `🧠 Unisciti a me su QuizMania Daily!\n\nQuiz giornalieri, classifiche e sfide! 🎯`;
    const url = `https://t.me/share/url?url=https://t.me/${tg.initDataUnsafe.bot_username || 'quiz_daily_italia_bot'}&text=${encodeURIComponent(message)}`;
    tg.openTelegramLink(url);
}

function challengeFriendTelegram(score) {
    const message = `🎯 Ti sfido su QuizMania Daily!\n\nHo fatto ${score}/10 punti. Riesci a fare di meglio?`;
    const url = `https://t.me/share/url?url=https://t.me/${tg.initDataUnsafe.bot_username || 'quiz_daily_italia_bot'}&text=${encodeURIComponent(message)}`;
    tg.openTelegramLink(url);
}

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

console.log('Telegram API inizializzata');
console.log('Utente:', getUserName());
console.log('User ID:', getUserId());
