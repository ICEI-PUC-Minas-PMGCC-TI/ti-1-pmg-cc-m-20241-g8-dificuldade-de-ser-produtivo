document.addEventListener('DOMContentLoaded', function () {
    const notificationsIcon = document.getElementById('nav-notifications');
    const mainContainer = document.querySelector('.main-container');

    notificationsIcon.addEventListener('click', function (event) {
        event.preventDefault(); // Evita o comportamento padrão do link
        mainContainer.classList.toggle('hidden');
    });
    const botaoNotificacoes = document.querySelectorAll('.botoes a');

    botaoNotificacoes.forEach(botao => {
        botao.addEventListener('click', function () {
            // Seleciona a notificação pai e a oculta
            const notification = this.closest('.notification');
            notification.classList.add('hidden');
        });
    });
});
