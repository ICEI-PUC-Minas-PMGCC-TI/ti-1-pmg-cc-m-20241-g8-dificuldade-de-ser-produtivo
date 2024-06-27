const apiUrl = '/bookmarks';

function getBookmark(discussionId, userId, callbackFunction)
{
    fetch(`${apiUrl}?userId=${userId}`)
        .then(response => response.json())
        .then(data =>
        {
            const bookmarks = data.filter(bookmark =>
            {
                return bookmark.discussionId === discussionId;
            });

            if (callbackFunction)
                callbackFunction(bookmarks);
        })
        .catch(error =>
        {
            console.error('Erro ao recuperar a discussão salva do usuário: ', error);
        });
}

function getAllUserBookmarks(userId, callbackFunction)
{
    fetch(`${apiUrl}?userId=${userId}`)
        .then(response => response.json())
        .then(data =>
        {
            if (callbackFunction)
                callbackFunction(data);
        })
        .catch(error =>
        {
            console.error('Erro ao recuperar discussões salvas do usuário: ', error);
        })
}

function addBookmark(discussionId, userId, callbackFunction)
{
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ discussionId: discussionId, userId: userId })
    })
        .then(response =>
        {
            if (response.ok && callbackFunction)
                callbackFunction();
        })
        .catch(error =>
        {
            console.error('Erro ao salvar uma discussão: ', error);
        });
}

function removeBookmark(bookmarkId, callbackFunction)
{
    fetch(`${apiUrl}/${bookmarkId}`, {
        method: 'DELETE',
    })
        .then(response =>
        {
            if (response.ok && callbackFunction)
                callbackFunction();
        })
        .catch(error =>
        {
            console.error('Erro ao remover salvamento de discussão:', error);
            return false;
        });
}

export { addBookmark, getAllUserBookmarks, getBookmark, removeBookmark };

