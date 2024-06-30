const serverUrl = 'http://localhost:3001/upload';

function uploadImage(userId, formData, callbackFunction)
{
    fetch(serverUrl, {
        method: 'POST',
        headers: {
            filename: userId
        },
        body: formData
    })
        .then(response => response.json())
        .then(data =>
        {
            if (data.filePath)
            {
                callbackFunction(data.filePath);
                return;
            }

            callbackFunction(null);
        })
        .catch(error => console.error('Error uploading image: ', error));
}

export { uploadImage };

