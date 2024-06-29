const data = new Date()
const dia = String(data.getDate()).padStart(2, '0')
const mes = String(data.getMonth() + 1).padStart(2, '0')
const ano = data.getFullYear()
CurrentDate = `${ano}-${mes}-${dia}`

document.addEventListener("DOMContentLoaded", function () {

/*
    -------------------Ícone da barra-------------------*/
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
    });/*
    ---------------------------------------------------------*/
    
    fetch('/tasks')
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao buscar o arquivo JSON');
        }
        return response.json();
    })
    .then(data => {
        const datatarefa = data.tasks[0].term;
        if (CurrentDate === datatarefa) { // tarefa atual
            tarefaproxima();
        }
        if (CurrentDate > datatarefa) { // tarefa expirada
            tarefaatrasada();
        }
    })
    .catch(error => {
        console.error('Erro ao processar o arquivo JSON:', error);
    });
    /*
    -------------------NOTIFICAÇÃO PRÓXIMA-------------------*/
    function tarefaproxima() {
        const notificacao = document.querySelector('#notificacoes-separadas');
        if (!notificacao) {
            console.error('Elemento #notificacoes-separadas não encontrado no DOM.');
        } else {
            fetch('/tasks')
                .then(async res => {
                    if (!res.ok) {
                        throw new Error(res.status);
                    }

                    let data = await res.json();
                    let project = document.createElement('div');
                    project.innerHTML = `
                        <div class="notification">
                            <a class="texto-da-notificacao">Sua tarefa pendente está próxima do prazo</a>
                            <div class="botoes">
                                <a class="redirecionamento-tarefas">Editar</a>
                            </div>
                        </div>
                        `;
                    perfil.appendChild(project);
                })
                .catch(error => {
                    console.error('Erro ao buscar dados do json:', error);
                });
        }
    }/*
    ---------------------------------------------------------*/
    /*
    ------------------NOTIFICAÇÃO ATRASADA-------------------*/
    function tarefaatrasada() {
        const notificacao = document.querySelector('#notificacoes-separadas');
        if (!notificacao) {
            console.error('Elemento #notificacoes-separadas não encontrado no DOM.');
        } else {
            fetch('/tasks')
                .then(async res => {
                    if (!res.ok) {
                        throw new Error(res.status);
                    }

                    let data = await res.json();
                    let project = document.createElement('div');
                    project.innerHTML = `
                        <div class="notification">
                            <a class="texto-da-notificacao">Sua tarefa expirou no dia 19/05/24</a>
                            <div class="botoes">
                                <a class="marcar-ignorar">Ignorar</a>
                                <a class="redirecionamento-tarefas">Editar</a>
                            </div>
                        </div>
                        `;
                    perfil.appendChild(project);
                })
                .catch(error => {
                    console.error('Erro ao buscar dados do json:', error);
                });
        }
    }/*
    ---------------------------------------------------------*/
});
