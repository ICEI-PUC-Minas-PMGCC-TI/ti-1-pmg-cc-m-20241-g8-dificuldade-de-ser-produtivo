import { getExpiredTasks, getTasksByDate } from "../../tarefas/api/tasks.js";
import { getNotifications } from "../api/notifications.js";

const userId = sessionStorage.getItem('user');

const data = new Date()
const dia = String(data.getDate()).padStart(2, '0')
const mes = String(data.getMonth() + 1).padStart(2, '0')
const ano = data.getFullYear()
const CurrentDate = `${ano}-${mes}-${dia}`;

function gerarNotificacao(txt)
{
    const notificationEl = document.createElement('div');
    notificationEl.classList.add('notification');
    notificationEl.innerHTML = `<i class="fa-solid fa-x fechar-notificacao"></i><p class="texto-da-notificacao">${txt}</p>`

    notificationEl.querySelector('i').addEventListener('click', () =>
    {
        notificationEl.remove();
    });

    document.querySelector('#notificacoes-separadas').append(notificationEl);
}

document.addEventListener("DOMContentLoaded", function ()
{

    /*
        -------------------Ícone da barra-------------------*/
    const notificationsIcon = document.getElementById('notification-button');
    const mainContainer = document.querySelector('.main-container');

    notificationsIcon.addEventListener('click', function (event)
    {
        event.preventDefault(); // Evita o comportamento padrão do link
        mainContainer.classList.toggle('hidden');
    });

    getNotifications(userId, data =>
    {
        console.log(data);
        data.forEach(notification =>
        {
            gerarNotificacao(notification.text);
        });

        getTasksByDate(CurrentDate, userId, data =>
        {
            console.log(data);
            data.forEach(task =>
            {
                gerarNotificacao(`A tarefa "${task.title}" vence hoje.`);
            });

            getExpiredTasks(userId, data =>
            {
                console.log(data);
                data.forEach(task =>
                {
                    gerarNotificacao(`A tarefa "${task.title}" venceu.`);
                });

                const notifications = document.querySelectorAll('.notification');

                if (notifications.length === 0)
                    document.querySelector('#notificacoes-separadas').innerHtml = '<p>Nenhuma notificação.</p>'
            });
        });
    });

});