const apiUrl = '/likes';

function addLikeRelationship(commentId, userId, callbackFunction)
{
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commentId: commentId, userId: userId })
    })
        .then(response =>
        {
            if (response.ok && callbackFunction)
                callbackFunction();
        })
        .catch(error =>
        {
            console.error('Error creating a like relationship: ', error);
        });
}

function removeLikeRelationship(likeRelationshipId, callbackFunction)
{
    fetch(`${apiUrl}/${likeRelationshipId}`, {
        method: 'DELETE',
    })
        .then(response =>
        {
            if (response.ok && callbackFunction)
                callbackFunction();
        })
        .catch(error =>
        {
            console.error('Erro ao remover contato via API JSONServer:', error);
            return false;
        });
}

function getLikeRelationship(commentId, userId, callbackFunction)
{
    fetch(`${apiUrl}?userId=${userId}`)
        .then(response => response.json())
        .then(data =>
        {
            const filteredData = data.filter(comment => comment.commentId === commentId);

            if (callbackFunction)
                callbackFunction(filteredData);
        })
        .catch(error =>
        {
            console.error('Erro ao recuperar o relacionamento de like: ', error);
        })
}

export { addLikeRelationship, getLikeRelationship, removeLikeRelationship };

