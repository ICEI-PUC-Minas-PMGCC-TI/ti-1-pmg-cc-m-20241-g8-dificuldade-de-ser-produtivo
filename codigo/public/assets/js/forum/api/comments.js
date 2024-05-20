const apiUrl = '/comments';

function createComment(comment, callbackFunction)
{
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(comment)
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

function getComments(pageNumber, discussionId, currentUserId, callbackFunction)
{
    const commentsPerPage = 5;

    const start = (pageNumber - 1) * commentsPerPage;
    const end = pageNumber * commentsPerPage - 1;

    fetch(`${apiUrl}?_start=${start}&_end=${end}&authorId_ne=${currentUserId}&discussionId=${discussionId}`)
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

function getUserComments(discussionId, userId, callbackFunction)
{
    fetch(`${apiUrl}?&discussionId=${discussionId}&authorId=${userId}`)
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

function deleteComment(commentId, callbackFunction)
{
    fetch(`${apiUrl}?id=${commentId}`, {
        method: 'DELETE',
    })
        .then(response =>
        {
            if (response.ok)
                callbackFunction();
        })
        .catch(error =>
        {
            console.error('Erro ao remover contato via API JSONServer:', error);
            return false;
        });
}

function likeComment(comment, operation, callbackFunction)
{
    comment.likes += operation;

    fetch(`${apiUrl}/${comment.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(comment)
    })
        .then(response =>
        {
            if (response.ok)
                callbackFunction();
        })
        .catch(error =>
        {
            console.error('Erro ao atualizar a quantidade de likes: ', error);
        });
}

export { createComment, deleteComment, getComments, getUserComments, likeComment };

