const apiUrl = '/notifications';

function addNotification(notification, callbackFunction)
{
    fetch(`${apiUrl}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(notification)
    })
        .then(response =>
        {
            if (response.ok && callbackFunction)
                callbackFunction();
        })
        .catch(error => console.error('Error creating notification: ', error));
}

function getNotifications(userId, callbackFunction)
{
    fetch(`${apiUrl}?userId=${userId}`)
        .then(response => response.json())
        .then(data =>
        {
            if (callbackFunction)
                callbackFunction(data);
        })
        .catch(error => console.error('Error getting user notifications: ', error));
}

function deleteNotification(notificationId, callbackFunction)
{
    fetch(`${apiUrl}/${notificationId}`, {
        method: 'DELETE'
    })
        .then(response =>
        {
            if (response.ok && callbackFunction)
                callbackFunction();
        })
        .catch(error => console.error('Error deleting notification: ', error));
}

export { addNotification, deleteNotification, getNotifications };

