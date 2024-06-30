import { dateToStringFormatted, getRemainingDays } from "../../util.js";

const apiUrl = '/suggestions';

function generateSuggestions(userId, tasks, callbackFunction)
{
    getSuggestions(userId, async data =>
    {
        if (data.length > 0)
        {
            const suggestionsObject = data[0];

            if (!suggestionsObject.done)
            {
                if (callbackFunction)
                    callbackFunction(suggestionsObject)
                return;
            }

            await deleteSuggestions(suggestionsObject.id);
        }

        const suggestions = [];

        const suggestionsObj = {
            userId: userId,
            date: Date.now() + (60 * 60 * 1000),
            done: false
        };

        const incompletedTasks = tasks.filter(task => !task.complete);

        if (tasks.length === 0)
        {
            callbackFunction(null, 'Não há tarefas para serem analisadas. Adicione mais tarefas e volte mais tarde.');
            return;
        }

        const priorityOrder = ['baixa', 'media', 'alta'];

        incompletedTasks.sort((a, b) =>
        {
            return priorityOrder.indexOf(b.priority) - priorityOrder.indexOf(a.priority);
        });

        for (let i = 0; i < incompletedTasks.length; i++)
        {
            if (suggestions.length === 3)
                break;

            const task = incompletedTasks[i];

            if (getRemainingDays(task.term) <= 2)
            {
                if (task.priority !== "alta")
                {
                    suggestions.push({
                        text: `A tarefa "${task.title}" está prestes a vencer. Deseja alterar a prioridade para alta?`,
                        taskId: task.id,
                        action: 1,
                        newValue: "alta",
                        answered: false
                    });
                }
            }

            for (let j = 0; j < incompletedTasks.length; j++)
            {
                if (i === j)
                    continue;

                const otherTask = incompletedTasks[j];

                if (task.term === otherTask.term && (task.priority === 'alta' && otherTask.priority === 'alta'))
                {
                    const newDate = new Date(otherTask.term);
                    newDate.setHours(newDate.getHours() + 3);
                    newDate.setDate(newDate.getDate() + 1);

                    suggestions.push({
                        text: `As tarefas "${task.title}" e "${otherTask.title}" possuem prioridade alta e vencem no mesmo dia. Deseja alterar a data da tarefa "${otherTask.title}" para ${dateToStringFormatted(newDate)} para evitar um conflito entre tarefa de alta prioridade?`,
                        taskId: otherTask.id,
                        action: 0,
                        newValue: newDate.getTime(),
                        answered: false
                    });

                    incompletedTasks.splice(i, 1);
                    incompletedTasks.splice(j, 1);
                }
            }
        }

        if (suggestions.length === 0)
        {
            callbackFunction(null, 'Suas tarefas já estão bem organizadas. Volte em outro momento para verificar se há sugestões.');
            return;
        }

        suggestionsObj.suggestions = suggestions;

        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(suggestionsObj)
        })
            .then(response => response.json())
            .then(newSuggestions =>
            {
                if (callbackFunction)
                    callbackFunction(newSuggestions);
            })
            .catch(error => console.error('Error adding suggestions: ', error));
    });

}

function getSuggestions(userId, callbackFunction)
{
    fetch(`${apiUrl}?userId=${userId}`)
        .then(response => response.json())
        .then(data =>
        {
            if (callbackFunction)
                callbackFunction(data);
        })
        .catch(error => console.error('Error getting suggestions: ', error));
}

async function deleteSuggestions(suggestionId)
{
    try
    {
        const response = await fetch(`${apiUrl}/${suggestionId}`, {
            method: 'DELETE'
        });
        if (!response.ok)
        {
            console.error('Error deleting suggestions: ', response.statusText);
        }
    } catch (error)
    {
        console.error('Error deleting suggestions: ', error);
    }

}

function updateSuggestions(newSuggestionData, callbackFunction)
{
    let isCompleted = true;

    newSuggestionData.suggestions.forEach(suggestion =>
    {
        if (!suggestion.answered)
            isCompleted = false;
    });

    if (isCompleted)
        newSuggestionData.done = true;

    fetch(`${apiUrl}/${newSuggestionData.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSuggestionData)
    })
        .then(response =>
        {
            if (response.ok && callbackFunction)
                callbackFunction();
        })
        .catch(error => console.error('Error updating suggestions: ', error));
}

export { deleteSuggestions, generateSuggestions, getSuggestions, updateSuggestions };

