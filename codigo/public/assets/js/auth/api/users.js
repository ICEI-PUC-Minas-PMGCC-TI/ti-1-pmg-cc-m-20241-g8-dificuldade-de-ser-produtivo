import { generateUniqueId } from "../../util.js";

const apiUrl = '/users';

const serverUrl = 'http://localhost:3001';

function register(user, callbackFunction, errorFunction) 
{
    user.id = generateUniqueId();

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
                        callbackFunction();
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
}

function login(email, password, callbackFunction)
{
    fetch(`${apiUrl}?email=${email}`)
        .then(response => response.json())
        .then(data =>
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
        })
        .catch(error => { console.error('Error logging in: ', error) });
}

export { login, register };

