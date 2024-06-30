import { getUserName } from "../auth/api/users.js";
import { generateSuggestions, updateSuggestions } from "../suggestions/api/suggestions.js";
import { getTaskById, getTasks, updateTask } from "../tarefas/api/tasks.js";
import { dateToString, getRemainingDays } from "../util.js";

const userId = sessionStorage.getItem('user');

let TotaldeTarefas;
let TarefasTotaisFeitas;
let TotaisDiarias;
let FeitasDiarias;
let CurrentDate;

// recebe a data atual e formata para o formato adequado
const data = new Date()
const dia = String(data.getDate()).padStart(2, '0')
const mes = String(data.getMonth() + 1).padStart(2, '0')
const ano = data.getFullYear()
CurrentDate = `${ano}-${mes}-${dia}`

function countCompletedTasks(tasks)
{ // Número de tarefas principais completas
    return tasks.reduce((count, task) =>
    {
        return task.complete ? count + 1 : count;
    }, 0);
}

getUserName(userId, (name) =>
{
    $('#inicio #user-name').text(name);
});

getTasks(userId, data =>
{
    TotaldeTarefas = data.length;

    const TD = data.filter(task => task.term === CurrentDate).length;
    const FD = data.filter(task => task.term === CurrentDate && task.complete).length;
    TotaisDiarias = TD
    FeitasDiarias = FD

    const tasks = data;

    const tasksPendentes = tasks.filter(task => !task.complete);
    const pendentesContainer = document.getElementById('pendentes');

    if (data.length === 0)
    {
        document.querySelector('.pends').classList.add('empty');
        pendentesContainer.innerHTML += '<h2>Nenhuma tarefa</h2>';
    }

    tasksPendentes.forEach(task =>
    {
        const taskName = document.createElement('div');

        let icon;

        switch (task.priority)
        {
            case 'alta':
                icon = 'fa-chevron-up';
                break;
            case 'media':
                icon = 'fa-minus';
                break;
            case 'baixa':
                icon = 'fa-chevron-down';
                break;
            default:
                icon = '';
                break;
        }

        const remainingDays = getRemainingDays(task.term);

        taskName.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${task.title}</span> <span>-</span> <span>${remainingDays >= 0 ? (remainingDays === 0 ? 'Vence hoje' : `Vence em ${remainingDays} dias`) : 'Venceu'}</span>`;
        taskName.classList.add('pend');

        if (task.complete)
            taskName.classList.add('completo');
        else
            taskName.classList.add(task.priority);

        pendentesContainer.insertBefore(taskName, document.querySelector(`#delim-${task.priority}`));
    });

    document.querySelectorAll('.delim').forEach(element => element.remove());

    TarefasTotaisFeitas = countCompletedTasks(tasks);

    // Gráfico 1
    if (TotaisDiarias > 0)
    {
        const ctx = document.getElementById('grafico1').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                // labels: ['Feitas', 'Pendentes'],
                datasets: [{
                    // label: 'Tarefas',
                    data: [FeitasDiarias, TotaisDiarias - FeitasDiarias], // dados do gráfico 1
                    backgroundColor: [
                        'rgb(34, 190, 110)',
                        'rgb(150, 150, 150)',
                    ],
                }]
            },
        });
    }
    else
    {
        const graficoContainer = $('#grafico1-container');
        $('#grafico1').remove();
        graficoContainer.addClass('empty');
        graficoContainer.append($('<h2>', { text: 'Nenhuma tarefa diária' }));
    }

    // Gráfico 2
    if (TotaldeTarefas > 0)
    {
        const ctx2 = document.getElementById('grafico2');
        new Chart(ctx2, {
            type: 'doughnut',
            data: {
                // labels: ['Pendentes', 'Feitas'],
                datasets: [{
                    // label: 'Tarefas',
                    data: [TarefasTotaisFeitas, TotaldeTarefas - TarefasTotaisFeitas],// dados do gráfico 2
                    backgroundColor: [
                        'rgb(34, 190, 110)',
                        'rgb(150, 150, 150)',
                    ],
                }]
            },
        });
    }
    else
    {
        const graficoContainer = $('#grafico2-container');
        $('#grafico2').remove();
        graficoContainer.addClass('empty');
        graficoContainer.append($('<h2>', { text: 'Nenhuma tarefa' }));
    }

    generateSuggestions(userId, tasks, (suggestionsObj, msg) =>
    {
        const suggestionsContainer = $('#sugestoes');

        if (suggestionsObj === null)
        {
            suggestionsContainer.append($('<p>', { text: msg }));
            $('#container-sugestoes h2').text('Sugestões');

            return;
        }

        $('#container-sugestoes h2').text('Sugestão ');
        $('#container-sugestoes h2').append($('<span>', { id: 'count', text: '1' }));

        let i = 0;

        suggestionsObj.suggestions.forEach(suggestion =>
        {
            if (!suggestion.answered)
            {
                const divButtons = $('<div>', { class: 'buttons' });

                const buttonYes = $('<button>', { class: 'yes', text: 'Sim' });
                const buttonNo = $('<button>', { class: 'no', text: 'Não' });

                buttonYes.on('click', () =>
                {
                    const taskId = suggestion.taskId;

                    getTaskById(taskId, data =>
                    {
                        suggestion.answered = true;

                        updateSuggestions(suggestionsObj, () =>
                        {
                            if (data.length > 0)
                            {
                                const task = data[0];

                                if (suggestion.action === 0)
                                    task.term = dateToString(new Date(suggestion.newValue));
                                else
                                    task.priority = suggestion.newValue;

                                updateTask(task.id, task, () =>
                                {
                                    buttonYes.closest('.suggestion').remove();
                                    const count = $('#count');
                                    count.text(parseInt(count.text()) + 1);

                                    const remainingSuggestions = $('.suggestion');

                                    if (remainingSuggestions.length > 0)
                                        remainingSuggestions.eq(0).removeClass('hidden');
                                    else
                                    {
                                        $('#container-sugestoes h2').text('Sugestões');
                                        $('#sugestoes').append($('<p>', { text: 'Não há mais sugestões, volte mais tarde.' }))
                                    }
                                });
                            }
                        });
                    });
                });

                buttonNo.on('click', () =>
                {
                    suggestion.answered = true;

                    updateSuggestions(suggestionsObj, () =>
                    {
                        buttonNo.closest('.suggestion').remove();
                        const count = $('#count');
                        count.text(parseInt(count.text()) + 1);

                        const remainingSuggestions = $('.suggestion');

                        if (remainingSuggestions.length > 0)
                            remainingSuggestions.eq(0).removeClass('hidden');
                        else
                        {
                            $('#container-sugestoes h2').text('Sugestões');
                            $('#sugestoes').append($('<p>', { text: 'Não há mais sugestões, volte mais tarde.' }))
                        }
                    })
                });

                divButtons.append(buttonYes, buttonNo);

                suggestionsContainer.append(
                    $('<div>', { class: `suggestion${i > 0 ? ' hidden' : ''}` }).append(
                        $('<p>', { text: suggestion.text }),
                        divButtons
                    )
                );

                i++;
            }
        })
    });
});
