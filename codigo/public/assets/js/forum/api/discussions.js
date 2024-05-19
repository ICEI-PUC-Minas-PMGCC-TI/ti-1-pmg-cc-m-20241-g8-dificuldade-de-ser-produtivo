const apiUrl = '/discussions';

const discussionsPerPage = 5;

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
    const start = (pageNumber - 1) * discussionsPerPage;
    const end = pageNumber * discussionsPerPage - 1;

    fetch(`${apiUrl}?_start=${start}&_end=${end}&user-id_ne=${currentUserId}`)
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
    fetch(`%{apiUrl}/${discussionId}`, {
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
    fetch()
}