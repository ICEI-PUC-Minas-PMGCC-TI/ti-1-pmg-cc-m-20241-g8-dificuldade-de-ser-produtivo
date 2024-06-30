import { addXp, updateStats } from "../../auth/api/users.js";
import { getRemainingDays } from "../../util.js";
import { addTask, deleteTask, getTasks, updateTask } from "../api/tasks.js";

const userId = sessionStorage.getItem('user');

function readTasks(processData)
{
    getTasks(userId, data => processData(data));
}

function renderTasks(tasks)
{
    const containers = document.querySelectorAll('.priority-tasks-container');

    containers.forEach(container =>
    {
        container.innerHTML = '';
        container.closest('.priority').classList.add('hidden');
    })

    const priorityOrder = { 'alta': 1, 'media': 2, 'baixa': 3 };

    tasks.sort((a, b) =>
    {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    tasks.forEach((task, taskId) =>
    {
        const taskElement = document.createElement("div");
        taskElement.classList.add("task");
        if (task.complete)
        {
            taskElement.classList.add("completed");
        }
        taskElement.setAttribute('data-task-id', taskId);

        taskElement.innerHTML = `
            <div class="task-containers">
                <h3>${task.title}</h3>
                <p>${task.description}</p>
                ${!task.complete ?
                `<p>${generateRemainingDates(task)}</p>
                <div class="select-container">
                    <label>Prioridade:</label>
                    <select class="priority-select" name="priority-select" data-task-id="${taskId}">
                        <option value="alta" ${task.priority === 'alta' ? 'selected' : ''}>Alta</option>
                        <option value="media" ${task.priority === 'media' ? 'selected' : ''}>Média</option>
                        <option value="baixa" ${task.priority === 'baixa' ? 'selected' : ''}>Baixa</option>
                    </select>
                </div>` : ''}
                
                <button class="edit-btn">
                    Editar <i class="fa-solid fa-pen-to-square"></i>
                </button>
            </div>
            <div class="task-buttons">
                <button class="complete-btn" data-task-id="${taskId}">${task.complete ? 'Reabrir' : 'Concluir'} <i class="fa-solid ${task.complete ? 'fa-rotate-right' : 'fa-check'}"></i></button>
            </div>
        `;

        taskElement.querySelector('.edit-btn').addEventListener('click', () => { openEditModal(taskId) });

        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = 'Excluir <i class="fa-solid fa-x"></i>';
        deleteButton.classList.add('delete-btn');
        deleteButton.addEventListener('click', function ()
        {
            const taskId = task.id;
            doDeleteTask(taskId);
        });
        taskElement.querySelector('.task-buttons').appendChild(deleteButton);

        const remainingDays = getRemainingDays(task.term);

        if (task.complete)
        {
            containers[4].appendChild(taskElement);
            containers[4].closest('.priority').classList.remove('hidden');
        }
        else if (remainingDays < 0) 
        {
            containers[0].appendChild(taskElement);
            containers[0].closest('.priority').classList.remove('hidden');
        }
        else
        {
            containers[priorityOrder[task.priority]].appendChild(taskElement);
            containers[priorityOrder[task.priority]].closest('.priority').classList.remove('hidden');
        }
    });

    document.querySelectorAll('.complete-btn').forEach(button =>
    {
        button.addEventListener('click', handleTaskCompleteButtonClick);
    });

    document.querySelectorAll('.subtask-complete').forEach(checkbox =>
    {
        checkbox.addEventListener('change', handleSubTaskCheckboxChange);
    });

    document.querySelectorAll('.priority-select').forEach(select =>
    {
        select.addEventListener('change', handlePriorityChange);
    });
}

function generateRemainingDates(task)
{
    const remainingDays = getRemainingDays(task.term);

    if (remainingDays > 0)
    {
        return `Vence em ${remainingDays} ${remainingDays === 1 ? 'dia' : 'dias'}`;
    }

    if (remainingDays === 0)
    {
        return 'Vence hoje';
    }

    return 'Venceu';

}

function handleTaskCompleteButtonClick(event)
{
    const taskId = event.target.getAttribute('data-task-id');
    const taskIndex = tasks.findIndex((t, index) => index == taskId);
    if (taskIndex === -1) return;

    tasks[taskIndex].complete = !tasks[taskIndex].complete;

    updateTask(tasks[taskIndex].id, tasks[taskIndex], updatedTask =>
    {
        tasks[taskIndex] = updatedTask;
        renderTasks(tasks);

        if (tasks[taskIndex].complete)
        {
            addXp(userId, 200, () =>
            {
                updateStats(userId, 'tasksCompleted');
            });
        }
    });
}

function handlePriorityChange(event)
{
    const taskId = event.target.getAttribute('data-task-id');
    const taskIndex = tasks.findIndex((t, index) => index == taskId);
    if (taskIndex === -1) return;

    tasks[taskIndex].priority = event.target.value;

    updateTask(tasks[taskIndex].id, tasks[taskIndex], updatedTask =>
    {
        tasks[taskIndex] = updatedTask;
        renderTasks(tasks);
    });
}

function displayMessage(message)
{
    const tasksContainer = document.getElementById("tasks");
    tasksContainer.innerHTML = `<h2>${message}</h2>`;
}

function formatDate(date)
{
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

function openEditModal(taskId)
{
    const modal = document.getElementById("editTaskModal");
    const form = document.getElementById("editTaskForm");
    const task = tasks[taskId];

    document.getElementById("editTaskTitle").value = task.title;
    document.getElementById("editTaskDescription").value = task.description;
    const date = new Date(task.term);
    date.setHours(date.getHours() + 3);
    document.getElementById("editTaskTerm").value = formatDate(date);

    form.onsubmit = function (e)
    {
        e.preventDefault();
        saveTask(taskId);
    };

    modal.classList.remove('hidden');
}

function closeModal()
{
    const modal = document.getElementById("editTaskModal");
    modal.classList.add('hidden');
}

document.querySelector(".close").onclick = closeModal;

function doDeleteTask(taskId)
{
    deleteTask(taskId, () => readTasks(processData));
}

function saveTask(taskId)
{
    const taskIndex = tasks.findIndex((t, index) => index === taskId);
    if (taskIndex === -1) return;

    tasks[taskIndex].title = document.getElementById("editTaskTitle").value;
    tasks[taskIndex].description = document.getElementById("editTaskDescription").value;
    tasks[taskIndex].term = document.getElementById("editTaskTerm").value;

    updateTask(tasks[taskIndex].id, tasks[taskIndex], updatedTask =>
    {
        tasks[taskIndex] = updatedTask;
        renderTasks(tasks);
        closeModal();
    });
}

function handleSubTaskCheckboxChange(event)
{
    const taskId = event.target.getAttribute('data-task-id');
    const subTaskId = event.target.getAttribute('data-subtask-id');
    const taskIndex = tasks.findIndex((t, index) => index == taskId);
    if (taskIndex === -1) return;

    const subTaskIndex = tasks[taskIndex].subTasks.findIndex((st, index) => index == subTaskId);
    if (subTaskIndex === -1) return;

    tasks[taskIndex].subTasks[subTaskIndex].complete = event.target.checked;

    updateTask(tasks[taskIndex].id, tasks[taskIndex], updatedTask =>
    {
        tasks[taskIndex] = updatedTask;
        renderTasks(tasks);
    });
}

let tasks = [];

function processData(data)
{
    tasks = data;
    renderTasks(tasks);
}

readTasks(processData);

document.addEventListener('DOMContentLoaded', function ()
{
    const addTaskButton = document.querySelector('.add-task-header');
    const modals = document.querySelectorAll('.modal');

    addTaskButton.addEventListener('click', function ()
    {
        modals[0].classList.remove('hidden');
    });

    const closeButtons = document.querySelectorAll('.close');
    console.log(closeButtons)
    closeButtons.forEach((button, index) => button.addEventListener('click', function ()
    {
        modals[index].classList.add('hidden');
    }));

    const addTaskForm = document.getElementById('addTaskForm');
    addTaskForm.addEventListener('submit', function (event)
    {
        event.preventDefault();

        const formData = new FormData(addTaskForm);
        const newTaskData = {};
        formData.forEach((value, key) =>
        {
            newTaskData[key] = value;
        });

        console.log(newTaskData);

        console.log(newTaskData)

        newTaskData.userId = userId;
        newTaskData.complete = false;

        addTask(newTaskData, newTask =>
        {
            addTaskForm.closest('.modal').classList.add('hidden');
            readTasks(processData);

            addXp(userId, 50, () =>
            {
                updateStats(userId, 'tasksCreated');
            });
        });
    });

    const wrappers = document.querySelectorAll('.priority .wrapper');
    const priorityTaskContainers = document.querySelectorAll('.priority-tasks-container');
    const priorityHeaders = document.querySelectorAll('.priority-header');
    const chevrons = document.querySelectorAll('.priority-header i');

    priorityHeaders.forEach((header, index) =>
    {
        header.addEventListener('click', () =>
        {
            const wrapper = wrappers[index];

            chevrons[index].classList.toggle('fa-chevron-up');
            chevrons[index].classList.toggle('fa-chevron-down');

            if (wrapper.classList.contains('collapse'))
            {
                wrapper.classList.remove('collapse');
                console.log($(priorityTaskContainers[index]).outerHeight(true))
                wrapper.style.height = `${$(priorityTaskContainers[index]).outerHeight(true)}px`;
                return;
            }

            wrapper.classList.add('collapse');
            wrapper.style.height = '0px';
        })
    })
});
