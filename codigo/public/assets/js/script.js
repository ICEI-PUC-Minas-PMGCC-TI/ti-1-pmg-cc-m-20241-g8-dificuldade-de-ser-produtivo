const apiUrl = '/tasks';

function readTasks(processData) {
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na rede ao tentar acessar a API');
            }
            return response.json();
        })
        .then(data => {
            console.log('Dados recebidos da API:', data);
            if (data && data.length > 0) {
                processData(data);
            } else {
                displayMessage("Nenhuma tarefa encontrada.");
            }
        })
        .catch(error => {
            console.error('Erro ao ler tarefas via API JSONServer:', error);
            displayMessage("Erro ao ler tarefas");
        });
}

function renderTasks(tasks) {
    const tasksContainer = document.getElementById("tasks");
    tasksContainer.innerHTML = "";

    tasks.sort((a, b) => {
        const priorityOrder = { 'alta': 0, 'media': 1, 'baixa': 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
   
        tasks.forEach((task, taskId) => {
        const taskElement = document.createElement("div");
        taskElement.classList.add("task");
        if (task.complete) {
            taskElement.classList.add("completed");
        }
        taskElement.setAttribute('data-task-id', taskId);

        taskElement.innerHTML = `
            <div class="task-containers">
                <h3>${task.title}</h3>
                <p>${task.description}</p>
                <select class="priority-select" data-task-id="${taskId}">
                    <option value="alta" ${task.priority === 'alta' ? 'selected' : ''}>Alta</option>
                    <option value="media" ${task.priority === 'media' ? 'selected' : ''}>Média</option>
                    <option value="baixa" ${task.priority === 'baixa' ? 'selected' : ''}>Baixa</option>
                </select>
                <button class="edit-btn" onclick="openEditModal(${taskId})">
                    <!-- SVG for edit icon -->
                </button>
                <ul>
                    ${task.subTasks ? task.subTasks.map((subTask, subTaskId) => `
                        <li class="subtask ${subTask.complete ? 'completed' : ''}" data-subtask-id="${subTaskId}">
                            <input type="checkbox" class="subtask-complete" id="subtask-${taskId}-${subTaskId}" ${subTask.complete ? 'checked' : ''} data-task-id="${taskId}" data-subtask-id="${subTaskId}">
                            <label for="subtask-${taskId}-${subTaskId}">${subTask.title}</label>
                        </li>
                    `).join("") : ''}
                </ul>
                <div class="progress-bar">
                    <div class="progress"></div>
                </div>
            </div>
        `;
        const progressBar = taskElement.querySelector('.progress-bar');
        if (task.subTasks && task.subTasks.length > 0) {
            const subTasksCompleted = task.subTasks.filter(subTask => subTask.complete).length;
            const progressBarWidth = (subTasksCompleted / task.subTasks.length) * 100;
            const progressBarElement = progressBar.querySelector('.progress');
            progressBarElement.style.width = progressBarWidth + '%';
        } else {
            progressBar.style.display = 'none';
        }

        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'Excluir';
        deleteButton.classList.add('delete-btn');
        deleteButton.addEventListener('click', function () {
            const taskId = task.id;
            deleteTask(taskId);
        });
        taskElement.appendChild(deleteButton);
        tasksContainer.appendChild(taskElement);
    });

    document.querySelectorAll('.subtask-complete').forEach(checkbox => {
        checkbox.addEventListener('change', handleSubTaskCheckboxChange);
    });

    document.querySelectorAll('.priority-select').forEach(select => {
        select.addEventListener('change', handlePriorityChange);
    });
}

function handlePriorityChange(event) {
    const taskId = event.target.getAttribute('data-task-id');
    const taskIndex = tasks.findIndex((t, index) => index == taskId);
    if (taskIndex === -1) return;

    tasks[taskIndex].priority = event.target.value;

    fetch(`${apiUrl}/${tasks[taskIndex].id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(tasks[taskIndex])
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao atualizar a prioridade da tarefa');
        }
        return response.json();
    })
    .then(updatedTask => {
        tasks[taskIndex] = updatedTask;
        renderTasks(tasks);
    })
    .catch(error => {
        console.error('Erro ao salvar a prioridade da tarefa:', error);
    });
}


function displayMessage(message) {
    const tasksContainer = document.getElementById("tasks");
    tasksContainer.innerHTML = `<p>${message}</p>`;
}

function formatDate(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

function openEditModal(taskId) {
    const modal = document.getElementById("editTaskModal");
    const form = document.getElementById("editTaskForm");
    const task = tasks[taskId];

    document.getElementById("editTaskTitle").value = task.title;
    document.getElementById("editTaskDescription").value = task.description;
    document.getElementById("editTaskTerm").value = formatDate(task.term);
    document.getElementById("editTaskDate").value = formatDate(task.date);

    form.onsubmit = function(e) {
        e.preventDefault();
        saveTask(taskId);
    };

    modal.style.display = "block";
}

function closeModal() {
    const modal = document.getElementById("editTaskModal");
    modal.style.display = "none";
}

document.querySelector(".close").onclick = closeModal;
window.onclick = function(event) {
    const modal = document.getElementById("editTaskModal");
    if (event.target === modal) {
        closeModal();
    }
};

function deleteTask(taskId) {
fetch(`${apiUrl}/${taskId}`, {
method: 'DELETE'
})
.then(response => {
if (!response.ok) {
    throw new Error('Erro ao excluir a tarefa');
}
return response.json();
})
.then(() => {
console.log('Tarefa excluída com sucesso');
readTasks(processData); 
})
.catch(error => {
console.error('Erro ao excluir a tarefa:', error);
});
}


function saveTask(taskId) {
    const taskIndex = tasks.findIndex((t, index) => index === taskId);
    if (taskIndex === -1) return;

    tasks[taskIndex].title = document.getElementById("editTaskTitle").value;
    tasks[taskIndex].description = document.getElementById("editTaskDescription").value;
    tasks[taskIndex].term = document.getElementById("editTaskTerm").value;
    tasks[taskIndex].date = document.getElementById("editTaskDate").value;

    fetch(`${apiUrl}/${tasks[taskIndex].id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(tasks[taskIndex])
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao atualizar a tarefa');
        }
        return response.json();
    })
    .then(updatedTask => {
        tasks[taskIndex] = updatedTask;
        renderTasks(tasks);
        closeModal();
    })
    .catch(error => {
        console.error('Erro ao salvar a tarefa:', error);
    });
}

function handleTaskCheckboxChange(event) {
    const taskId = event.target.getAttribute('data-task-id');
    const taskIndex = tasks.findIndex((t, index) => index == taskId);
    if (taskIndex === -1) return;

    tasks[taskIndex].complete = event.target.checked;

    fetch(`${apiUrl}/${tasks[taskIndex].id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(tasks[taskIndex])
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao atualizar a tarefa');
        }
        return response.json();
    })
    .then(updatedTask => {
        tasks[taskIndex] = updatedTask;
        renderTasks(tasks);
    })
    .catch(error => {
        console.error('Erro ao salvar a tarefa:', error);
    });
}

function handleSubTaskCheckboxChange(event) {
    const taskId = event.target.getAttribute('data-task-id');
    const subTaskId = event.target.getAttribute('data-subtask-id');
    const taskIndex = tasks.findIndex((t, index) => index == taskId);
    if (taskIndex === -1) return;

    const subTaskIndex = tasks[taskIndex].subTasks.findIndex((st, index) => index == subTaskId);
    if (subTaskIndex === -1) return;

    tasks[taskIndex].subTasks[subTaskIndex].complete = event.target.checked;

    fetch(`${apiUrl}/${tasks[taskIndex].id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(tasks[taskIndex])
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao atualizar a subtarefa');
        }
        return response.json();
    })
    .then(updatedTask => {
        tasks[taskIndex] = updatedTask;
        renderTasks(tasks);
    })
    .catch(error => {
        console.error('Erro ao salvar a subtarefa:', error);
    });
}

let tasks = [];

function processData(data) {
    tasks = data;
    renderTasks(tasks);
}

readTasks(processData);

document.addEventListener('DOMContentLoaded', function () {
const addTaskButton = document.getElementById('addTaskButton');
const modal = document.getElementById('addTaskModal');

addTaskButton.addEventListener('click', function () {
    modal.style.display = 'block';
});

const closeButton = document.querySelector('.close');
closeButton.addEventListener('click', function () {
    modal.style.display = 'none';
});

window.addEventListener('click', function (event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
    
});

const addTaskForm = document.getElementById('addTaskForm');
addTaskForm.addEventListener('submit', function (event) {
    event.preventDefault();
    
    const formData = new FormData(addTaskForm);
    const newTaskData = {};
    formData.forEach((value, key) => {
        newTaskData[key] = value;
    });

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTaskData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao adicionar a tarefa');
        }
        return response.json();
    })
    .then(newTask => {
        console.log('Nova tarefa adicionada:', newTask);
        modal.style.display = 'none';
         readTasks(processData);

    })
    
    .catch(error => {
        console.error('Erro ao adicionar a tarefa:', error);
    });
});
});
