import { getExpiredTasks, getTasksByDate } from "../../tarefas/api/tasks.js";
import { getNotifications } from "../api/notifications.js";

const userId = sessionStorage.getItem('user');

const data = new Date()
const dia = String(data.getDate()).padStart(2, '0')
const mes = String(data.getMonth() + 1).padStart(2, '0')
const ano = data.getFullYear()
const CurrentDate = `${ano}-${mes}-${dia}`;

function gerarNotificacao(txt, index)
{
    const notificationEl = document.createElement('div');
    notificationEl.classList.add('notification');
    notificationEl.innerHTML = `<i class="fa-solid fa-x fechar-notificacao"></i><p class="texto-da-notificacao">${txt}</p>`

    notificationEl.querySelector('i').addEventListener('click', () =>
    {
        notificationEl.remove();
        const notifications = JSON.parse(sessionStorage.getItem('notifications'));
        notifications.splice(index, 1);
        sessionStorage.setItem('notifications', JSON.stringify(notifications));
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

    const notifications = JSON.parse(sessionStorage.getItem('notifications'));

    if (notifications.length === 0)
    {
        document.querySelector('#notificacoes-separadas').classList.add('empty');
        document.querySelector('#notificacoes-separadas').innerHTML = '<p>Nenhuma notificação nova.</p>';
        return;
    }

    notifications.forEach((notification, index) => { gerarNotificacao(notification, index) });
});