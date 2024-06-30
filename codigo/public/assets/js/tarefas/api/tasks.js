import { getRemainingDays } from "../../util.js";

const apiUrl = '/tasks';

function addTask(newTask, callbackFunction)
{
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTask)
    })
        .then(response => response.json())
        .then(newTask =>
        {
            if (callbackFunction)
                callbackFunction(newTask);
        })
        .catch(error => console.error('Error adding task: ', error));
}

function getTasks(userId, callbackFunction)
{
    fetch(`${apiUrl}?userId=${userId}`)
        .then(response => response.json())
        .then(data =>
        {
            if (callbackFunction)
                callbackFunction(data);
        })
        .catch(error => console.error('Error getting tasks: ', error));
}

function updateTask(taskId, taskData, callbackFunction)
{
    fetch(`${apiUrl}/${taskId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
    })
        .then(response => response.json())
        .then(updatedTask =>
        {
            if (callbackFunction)
                callbackFunction(updatedTask);
        })
        .catch(error => console.error('Error updating task: ', error));
}

function deleteTask(taskId, callbackFunction)
{
    fetch(`${apiUrl}/${taskId}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(() =>
        {
            if (callbackFunction)
                callbackFunction();
        })
        .catch(error => console.error('Error deleting task: ', error))
}

function getTaskById(taskId, callbackFunction) 
{
    fetch(`${apiUrl}?id=${taskId}`)
        .then(response => response.json())
        .then(data =>
        {
            if (callbackFunction)
                callbackFunction(data);
        })
        .catch(error => console.error('Error getting task by id: ', error));
}

function getTasksByDate(date, userId, callbackFunction)
{
    getTasks(userId, data =>
    {
        const filteredData = data.filter(task => task.term === date && !task.complete);

        if (callbackFunction)
            callbackFunction(filteredData);
    })
}

function getExpiredTasks(userId, callbackFunction)
{
    getTasks(userId, data =>
    {
        const filteredData = data.filter(task => getRemainingDays(task.term) < 0 && !task.complete);

        if (callbackFunction)
            callbackFunction(filteredData);
    });
}

export { addTask, deleteTask, getExpiredTasks, getTaskById, getTasks, getTasksByDate, updateTask };

