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

    const debugClass = document.getElementById('debug-id');
    const painelDebug = document.getElementById('painel-debug');

    debugClass.addEventListener('click', function () {
        painelDebug.classList.toggle('ocultar');
    });

    const debugOptions = document.querySelectorAll('.debug-separado');
    const notificacoesContainer = document.querySelector('.notificacoes-separadas');
    const semNotificacoesDiv = document.querySelector('.sem-notificacoes');

    const templates = {
        'task-expired': `
            <div class="notification">
                <a class="texto-da-notificacao">Sua tarefa expirou no dia 19/05/24</a>
                <div class="botoes">
                    <a class="marcar-ignorar">Ignorar</a>
                    <a class="redirecionamento-tarefas">Editar</a>
                </div>
            </div>
        `,
        'near-deadline': `
            <div class="notification">
                <a class="texto-da-notificacao">Sua tarefa pendente está próxima do prazo</a>
                <div class="botoes">
                    <a class="redirecionamento-tarefas">Editar</a>
                </div>
            </div>
        `,
        'forum-reply': `
            <div class="notification">
                <a class="texto-da-notificacao">Usuário 2 respondeu sua publicação no fórum</a>
                <div class="botoes">
                    <a class="redirecionamento-forum">Acessar</a>
                </div>
            </div>
        `
    };

    debugOptions.forEach(option => {
        option.addEventListener('click', function () {
            const type = this.getAttribute('data-type');
            const template = templates[type];
            if (template) {
                const tempElement = document.createElement('div');
                tempElement.innerHTML = template.trim();
                const newNotification = tempElement.firstChild;
                notificacoesContainer.appendChild(newNotification);
                addEventListenersToButtons(newNotification);
                checkNotifications();
            }
        });
    });

    function addEventListenersToButtons(notification) {
        const ignoreButton = notification.querySelector('.marcar-ignorar');
        const editButton = notification.querySelector('.redirecionamento-tarefas');
        const accessButton = notification.querySelector('.redirecionamento-forum');

        if (ignoreButton) {
            ignoreButton.addEventListener('click', function () {
                notification.remove();
                checkNotifications();
            });
        }

        if (editButton) {
            editButton.addEventListener('click', function () {
                notification.remove();
                checkNotifications();
            });
        }

        if (accessButton) {
            accessButton.addEventListener('click', function () {
                notification.remove();
                checkNotifications();
            });
        }
    }

    function checkNotifications() {
        const notifications = document.querySelectorAll('.notification');
        if (notifications.length === 0) {
            semNotificacoesDiv.textContent = 'Sem novas notificações';
        } else {
            semNotificacoesDiv.textContent = '';
        }
    }

    // Add event listeners to existing notifications
    document.querySelectorAll('.notification').forEach(notification => {
        addEventListenersToButtons(notification);
    });

    // Check notifications on page load
    checkNotifications();
});
