const apiUrl = '/discussions';

function createDiscussion(discussion, callbackFunction)
{
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(discussion)
    })
        .then(response => response.json())
        .then(data =>
        {
            if (callbackFunction)
                callbackFunction();
        })
        .catch(error =>
        {
            console.error('Error creating a discussion: ', error);
        });
}

function getDiscussions(pageNumber, currentUserId, callbackFunction)
{
    const discussionsPerPage = 5;

    const start = (pageNumber - 1) * discussionsPerPage;
    const end = pageNumber * discussionsPerPage - 1;

    fetch(`${apiUrl}?_start=${start}&_end=${end}&authorId_ne=${currentUserId}`)
        .then(response => response.json())
        .then(data =>
        {
            if (callbackFunction)
                callbackFunction(data);
        })
        .catch(error =>
        {
            console.error('Error getting discussions: ', error);
        });
}

function getUserDiscussions(userId, callbackFunction)
{
    fetch(`${apiUrl}?authorId=${userId}`)
        .then(response => response.json())
        .then(data =>
        {
            if (callbackFunction)
                callbackFunction(data);
        })
        .catch(error =>
        {
            console.error('Error getting user discussions: ', error);
        })
}

function getSpecificDiscussion(discussionId, callbackFunction)
{
    fetch(`${apiUrl}?id=${discussionId}`)
        .then(response => response.json())
        .then(data =>
        {
            callbackFunction(data);
        })
        .catch(error =>
        {
            console.error(`Error getting discussions: `, error);
        });
}


function updateDiscussion(discussionId, newDiscussionData, callbackFunction)
{
    fetch(`${apiUrl}/${discussionId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newDiscussionData)
    })
        .then(response => response.json())
        .then(data =>
        {
            if (callbackFunction)
                callbackFunction();
        })
        .catch(error =>
        {
            console.error(`Error updating discussion of id ${discussionId}: `, error);
        })
}

function deleteDiscussion(discussionId, callbackFunction)
{
    fetch(`${apiUrl}/${discussionId}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data =>
        {
            if (callbackFunction)
                callbackFunction();
        })
        .catch(error =>
        {
            console.error('Erro ao remover contato via API JSONServer:', error);
        });
}

export { createDiscussion, deleteDiscussion, getDiscussions, getSpecificDiscussion, getUserDiscussions, updateDiscussion };

