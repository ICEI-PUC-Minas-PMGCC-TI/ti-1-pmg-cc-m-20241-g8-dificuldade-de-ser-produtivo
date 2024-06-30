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
    const end = pageNumber * discussionsPerPage;

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
            if (callbackFunction)
                callbackFunction(data);
        })
        .catch(error =>
        {
            console.error(`Error getting discussions: `, error);
        });
}

function searchDiscussions(search, currentUserId, callbackFunction)
{
    if (search.length === 0 || search.match(/^ *$/) !== null)
    {
        callbackFunction(null);
        return;
    }

    fetch(`${apiUrl}?authorId_ne=${currentUserId}`)
        .then(response => response.json())
        .then(data =>
        {
            const filteredData = data.filter(discussion =>
            {
                return discussion.title.toLowerCase().includes(search.toLowerCase()) || discussion.text.toLowerCase().includes(search.toLowerCase());
            });

            if (callbackFunction)
                callbackFunction(filteredData);
        })
        .catch(error =>
        {
            console.error(`Error searching for discussions with ${search}: `, error);
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
            console.error(`Error deleting discussion of id ${discussionId}:`, error);
        });
}

function updateComments(discussionId, delta, callbackFunction)
{
    getSpecificDiscussion(discussionId, data =>
    {
        if (data.length === 0)
        {
            console.error(`Error updating comment count of discussion of id ${discussionId}:\nDiscussion not found`);
            return;
        }

        const discussion = data[0];

        discussion.commentCount += delta;

        fetch(`${apiUrl}/${discussionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
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
                console.error(`Error updating comment count of discussion of id ${discussionId}:`, error);
            })
    });
}

export { createDiscussion, deleteDiscussion, getDiscussions, getSpecificDiscussion, getUserDiscussions, searchDiscussions, updateComments, updateDiscussion };

