const apiUrl = '/comments';

const Targets = {
    DISCUSSION: 0,
    COMMENT: 1
};

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
                callbackFunction(data);
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

    fetch(`${apiUrl}?_start=${start}&_end=${end}&target=0`)
        .then(response => response.json())
        .then(data =>
        {
            const filteredData = data.filter(comment => (comment.targetId === discussionId && comment.authorId !== currentUserId));

            callbackFunction(filteredData);
        })
        .catch(error =>
        {
            console.error(`Error getting discussions: `, error);
        });
}

function getUserComments(discussionId, userId, callbackFunction)
{
    fetch(`${apiUrl}?authorId=${userId}`)
        .then(response => response.json())
        .then(data =>
        {
            const filteredData = data.filter(comment => (comment.targetId === discussionId));

            callbackFunction(filteredData);
        })
        .catch(error =>
        {
            console.error(`Error getting user comments: `, error);
        });
}

function getSpecificComment(commentId, callbackFunction)
{
    fetch(`${apiUrl}?id=${commentId}`)
        .then(response => response.json())
        .then(data =>
        {
            callbackFunction(data);
        })
        .catch(error => console.error(`Error getting comment id ${commentId}: `, error));
}

function deleteComment(commentId, callbackFunction)
{
    fetch(`${apiUrl}/${commentId}`, {
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

function editComment(commentId, text, callbackFunction)
{
    getSpecificComment(commentId, data =>
    {
        const comment = data[0];

        comment.text = text;
        comment.edited = true;

        fetch(`${apiUrl}/${commentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(comment)
        })
            .then(response =>
            {
                if (response.ok && callbackFunction)
                    callbackFunction();
            })
            .catch(error => console.error(`Error editing comment: `, error));
    });
}

export { Targets, createComment, deleteComment, editComment, getComments, getUserComments, likeComment };

