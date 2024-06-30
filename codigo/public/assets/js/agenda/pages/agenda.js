import { getTasks } from "../../tarefas/api/tasks.js";

$(() =>
{
    const userId = sessionStorage.getItem('user');

    getTasks(userId, data =>
    {
        const events = [];

        const colors = { 'alta': 'crimson', 'media': 'orange', 'baixa': 'yellow' };

        data.forEach(task =>
        {
            events.push({
                title: task.title,
                allDay: true,
                start: task.term,
                color: task.complete ? 'green' : colors[task.priority],

            });
        });

        setUpCalendar(events);
    });

    function setUpCalendar(events) 
    {
        const calendar = new FullCalendar.Calendar(document.querySelector('#agenda-container'), {
            locale: 'pt-br',
            initialView: 'dayGridMonth',
            height: $('main').height(),
            events: events
        });

        $(window).on('resize', () =>
        {
            calendar.setOption('height', $('main').height());
        });

        calendar.render();
    }

});