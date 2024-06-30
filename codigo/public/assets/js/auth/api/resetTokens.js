import { getUser } from "./users.js";

const apiUrl = '/resetTokens';

function generateToken(userId, callbackFunction)
{
    fetch('http://localhost:3001/generateToken')
        .then(response => response.json())
        .then(token =>
        {
            token.id = userId;

            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(token)
            })
                .then(response =>
                {
                    if (response.ok && callbackFunction)
                    {
                        callbackFunction(token);
                    } else
                    {
                        console.error('Error generating token:', response.statusText);
                        callbackFunction(null);
                    }
                })
                .catch(error =>
                {
                    console.error('Error generating token:', error);
                    callbackFunction(null);
                });
        })
        .catch(error =>
        {
            console.error('Error generating token:', error);
            callbackFunction(null, 'Erro ao gerar o token.');
        });
}

function retrieveToken(email, callbackFunction)
{
    getUser(email, async userData =>
    {
        if (userData.length === 0 && callbackFunction)
        {
            callbackFunction('Um email com as próximas instruções foi enviado caso exista uma conta com este endereço.');
            return;
        }

        const user = userData[0];

        getToken(user.id, async data =>
        {
            if (data.length > 0)
            {
                const token = data[0];

                if (token.expiration > Date.now())
                {
                    const response = await sendToEmail(user.email, token.token);

                    if (callbackFunction)
                    {
                        if (response.ok)
                            callbackFunction('Um email com as próximas instruções foi enviado caso exista uma conta com este endereço.');
                        else
                            callbackFunction('Não foi possível prosseguir com a operação');
                    }

                    return;
                } else
                {
                    await deleteToken(token.id);
                }
            }

            generateToken(user.id, async token =>
            {
                if (token)
                {
                    const response = await sendToEmail(user.email, token.token);

                    if (response.ok)
                        callbackFunction('Um email com as próximas instruções foi enviado caso exista uma conta com este endereço.');
                    else
                        callbackFunction('Não foi possível prosseguir com a operação');
                } else
                {
                    console.error('Error generating token:', errorMessage);
                    callbackFunction('Não foi possível prosseguir com a operação');
                }
            });
        });
    });
}

function getToken(userId, callbackFunction)
{
    fetch(`${apiUrl}?id=${userId}`)
        .then(response => response.json())
        .then(data =>
        {
            if (callbackFunction)
            {
                callbackFunction(data);
            }
        })
        .catch(error =>
        {
            console.error('Error getting token:', error);
            callbackFunction(null);
        });
}

async function deleteToken(tokenId)
{
    try
    {
        const response = await fetch(`${apiUrl}/${tokenId}`, {
            method: 'DELETE'
        });
        if (!response.ok)
        {
            console.error('Erro ao excluir o token:', response.statusText);
        }
    } catch (error)
    {
        console.error('Error deleting token:', error);
    }
}

async function sendToEmail(email, token)
{
    try
    {
        const response = await fetch('http://localhost:3001/sendEmail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                subject: 'Redefinição de senha',
                html: `<p>Você recebeu este email pois você (ou outra pessoa) enviou uma requisição para redefinir a senha de sua conta.<br></br>
                            Utilize o link a seguir para dar sequênicia à redefinição:<br><br>
                            http://localhost:3000/redefinir-senha.html?t=${token} <br><br>
                            Se você não enviou a requisição, ignore este email e sua senha permanecerá inalterada.</p>`
            })
        });
        return response;
    } catch (error)
    {
        console.error('Erro ao enviar email:', error);
        return null;
    }
}

function validateToken(token, callbackFunction)
{
    if (token === null || token === undefined)
    {
        callbackFunction(null);
        return;
    }

    fetch(`${apiUrl}?token=${token}`)
        .then(response => response.json())
        .then(async data =>
        {
            if (callbackFunction)
            {
                if (data.length === 0)
                {
                    callbackFunction(null);
                    return;
                }

                const token = data[0];

                if (token.expiration < Date.now())
                {
                    await deleteToken(token.id);

                    callbackFunction(null);
                    return;
                }

                callbackFunction(token);
            }
        })
        .catch(error => console.error('Error validating token: ', error));
}

export { deleteToken, generateToken, getToken, retrieveToken, validateToken };

