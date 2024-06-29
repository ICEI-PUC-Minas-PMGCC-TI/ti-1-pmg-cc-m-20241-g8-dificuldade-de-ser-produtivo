import { getRemainingDays } from "../util.js";

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

fetch('/tasks')
    .then(response => response.json())
    .then(data =>
    {
        TotaldeTarefas = data.length;

        const TD = data.filter(task => task.date === CurrentDate).length;
        const FD = data.filter(task => task.date === CurrentDate && task.complete).length;
        TotaisDiarias = TD
        FeitasDiarias = FD

        const tasks = data;

        const tasksPendentes = tasks.filter(task => !task.complete);
        const pendentesContainer = document.getElementById('pendentes');

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

        // Gráfico 2
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
    });
