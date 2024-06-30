import { generateUniqueId } from "../../util.js";

const apiUrl = '/users';

const serverUrl = 'http://localhost:3001';

function register(user, callbackFunction, errorFunction) 
{
    user.id = generateUniqueId();

    getUser(user.email, data =>
    {
        if (data.length > 0)
        {
            callbackFunction(false);
            return;
        }

        fetch(`${serverUrl}/hashPassword`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password: user.password })
        })
            .then(response =>
            {
                if (!response.ok)
                    throw new Error('Response was not OK');

                return response.json();
            })
            .then(data =>
            {
                user.password = data.hashedPassword;

                fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(user)
                })
                    .then(response => response.json())
                    .then(data =>
                    {
                        if (callbackFunction)
                            callbackFunction(true);
                    })
                    .catch(error =>
                    {
                        console.error('Error registering user: ', error);
                        if (errorFunction)
                            errorFunction();
                    });
            })
            .catch(error =>
            {
                console.error('Error registering user: ', error);
                if (errorFunction)
                    errorFunction();
            });
    });
}

function login(email, password, callbackFunction)
{
    getUser(email, data =>
    {
        if (data.length === 0)
        {
            callbackFunction(null);
            return;
        }

        const user = data[0];

        const requestBody = {
            password: password,
            hashedPassword: user.password
        };

        fetch(`${serverUrl}/validatePassword`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        })
            .then(response =>
            {
                if (!response.ok)
                    throw new Error(`Response was not OK`);

                return response.json();
            })
            .then(result =>
            {
                const id = result.isValid ? user.id : null;

                if (callbackFunction)
                    callbackFunction(id);
            })
            .catch(error => { console.error('Error logging in: ', error); });
    });
}

function getUser(email, callbackFunction)
{
    fetch(`${apiUrl}?email=${email}`)
        .then(response => response.json())
        .then(data =>
        {
            if (callbackFunction)
                callbackFunction(data);
        })
        .catch(error => { console.error('Error getting user: ', error) });
}

function getUserById(id, callbackFunction)
{
    fetch(`${apiUrl}/${id}`)
        .then(response => response.json())
        .then(user =>
        {
            if (callbackFunction)
                callbackFunction(user);
        })
        .catch(error => console.error('Error getting user by id: ', error));
}

function getUserByIdSecure(id, callbackFunction)
{
    fetch(`${apiUrl}?id=${id}`)
        .then(response => response.json())
        .then(user =>
        {
            user.password = '';

            if (callbackFunction)
                callbackFunction(user);
        })
        .catch(error => console.error('Error getting user by id: ', error));
}

function changePassword(id, newPassword, callbackFunction)
{
    getUserById(id, user =>
    {
        fetch(`${serverUrl}/hashPassword`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password: newPassword })
        })
            .then(response => response.json())
            .then(data =>
            {
                user.password = data.hashedPassword;

                fetch(`${apiUrl}/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(user)
                })
                    .then(response =>
                    {
                        if (callbackFunction)
                            callbackFunction();
                    })
                    .catch(error => console.error('Error changing password: ', error));

            })
            .catch(error => console.error('Error hashing password: ', error));
    });
}

function updateUser(userId, updatedFields, callbackFunction)
{
    getUserById(userId, user =>
    {
        Object.keys(updatedFields).forEach(key =>
        {
            user[key] = updatedFields[key];
        });

        fetch(`${apiUrl}/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        })
            .then(response =>
            {
                if (response.ok && callbackFunction)
                    callbackFunction();
            })
            .catch(error => console.error('Error updating user', error));
    });
}

function updateStats(userId, statsName, callbackFunction)
{
    getUserById(userId, user =>
    {
        user[statsName] += 1;

        fetch(`${apiUrl}/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        })
            .then(response =>
            {
                if (response.ok && callbackFunction)
                    callbackFunction();
            })
            .catch(error => console.error('Error updating user', error));
    })
}

function addXp(userId, ammount, callbackFunction)
{
    getUserById(userId, user =>
    {
        user.experience += ammount;
        if (user.experience >= 1000)
        {
            user.level++;
            user.experience -= 1000;
        }

        fetch(`${apiUrl}/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        })
            .then(response =>
            {
                if (response.ok && callbackFunction)
                    callbackFunction();
            })
            .catch(error => console.error('Error updating user', error));
    });
}

function getUserName(userId, callbackFunction)
{
    fetch(`${apiUrl}?id=${userId}`)
        .then(response => response.json())
        .then(data =>
        {
            if (callbackFunction)
            {
                if (data.length === 0)
                    callbackFunction(null);
                else
                {
                    const user = data[0];
                    callbackFunction(user.name);
                }
            }
        })
        .catch(error => console.error('Error getting user id: ', error));
}

export { addXp, changePassword, getUser, getUserByIdSecure, getUserName, login, register, updateStats, updateUser };

