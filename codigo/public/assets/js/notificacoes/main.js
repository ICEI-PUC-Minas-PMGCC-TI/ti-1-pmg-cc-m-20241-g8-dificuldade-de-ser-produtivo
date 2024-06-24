const data = new Date()
const dia = String(data.getDate()).padStart(2, '0')
const mes = String(data.getMonth() + 1).padStart(2, '0')
const ano = data.getFullYear()
CurrentDate = `${ano}-${mes}-${dia}`

const datatarefaanalizada = "2024-06-22";

let tarefastatus = 0;
if (CurrentDate < datatarefaanalizada) { // tarefa futura
    tarefastatus = 3;
}
if (CurrentDate === datatarefaanalizada) { // tarefa atual
    tarefastatus = 2;
}
if (CurrentDate > datatarefaanalizada) { // tarefa expirada
    tarefastatus = 1;
}

console.log(tarefastatus);

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
