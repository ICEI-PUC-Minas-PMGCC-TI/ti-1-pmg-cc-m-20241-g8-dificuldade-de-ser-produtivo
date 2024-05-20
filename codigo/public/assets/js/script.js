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
    <button class="edit-btn" onclick="openEditModal(${taskId})">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<rect width="16" height="16" fill="url(#pattern0_62_18)"/>
<defs>
<pattern id="pattern0_62_18" patternContentUnits="objectBoundingBox" width="1" height="1">
<use xlink:href="#image0_62_18" transform="scale(0.00195312)"/>
</pattern>
<image id="image0_62_18" width="512" height="512" xlink:href="data:image/png;base64,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"/>
</defs>
</svg>
    
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
