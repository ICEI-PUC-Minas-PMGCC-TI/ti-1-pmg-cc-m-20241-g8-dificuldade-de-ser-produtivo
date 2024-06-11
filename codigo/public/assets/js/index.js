let TotaldeTarefas;
let TarefasTotaisFeitas;
// Obter o maior ID das tarefas
function getMaxTaskId(tasks) {
    return tasks.reduce((maxId, task) => {
        const id = parseInt(task.id, 10);
        return id > maxId ? id : maxId;
    }, 0);
}
// Número de tarefas principais completas
function countCompletedTasks(tasks) {
    return tasks.reduce((count, task) => {
        return task.complete ? count + 1 : count;
    }, 0);
}
// Carregar db.json
fetch('assets/db/db.json')
    .then(response => response.json())
    .then(data => {
        const tasks = data.tasks;
        TotaldeTarefas = getMaxTaskId(tasks);
        TarefasTotaisFeitas = countCompletedTasks(tasks);
        console.log('TotaldeTarefas:', TotaldeTarefas);
        console.log('TarefasTotaisFeitas:', TarefasTotaisFeitas);

        // Criar os gráficos
        const ctx = document.getElementById('grafico1').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                //labels: ['Feitas', 'Pendentes'],
                datasets: [{
                    //label: 'Tarefas',
                    data: [TarefasTotaisFeitas, TotaldeTarefas - TarefasTotaisFeitas], // dados do gráfico 1
                    backgroundColor: [
                        'rgb(34, 190, 110)',
                        'rgb(150, 150, 150)',
                    ],
                }]
            },
        });
        const ctx2 = document.getElementById('grafico2');
        new Chart(ctx2, {
            type: 'doughnut',
            data: {
                //labels: ['Pendentes', 'Feitas'],
                datasets: [{
                    //label: 'Tarefas',
                    data: [TarefasTotaisFeitas, TotaldeTarefas - TarefasTotaisFeitas],//dados do gráfico 2
                    backgroundColor: [
                        'rgb(34, 190, 110)',
                        'rgb(150, 150, 150)',
                    ],
                }]
            },
        });
    });