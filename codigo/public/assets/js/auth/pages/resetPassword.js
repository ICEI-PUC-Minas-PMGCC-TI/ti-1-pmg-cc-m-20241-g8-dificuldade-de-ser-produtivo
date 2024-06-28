import { analyzePasswordStrength } from "../../util.js";
import { deleteToken, validateToken } from "../api/resetTokens.js";
import { changePassword } from "../api/users.js";

$(() =>
{
    let params = new URLSearchParams(window.location.search);

    let token = params.get('t');

    validateToken(token, fullToken =>
    {
        if (fullToken === null)
        {
            $('form').empty();
            $('form').append($('<h1>', { text: 'Link expirado' }));

            setTimeout(() =>
            {
                window.location.href = '/';
            }, 3000);

            return;
        }

        const passwordEl = $('.input');

        passwordEl.on('input', e =>
        {
            const password = $(e.target).val();

            $('#forca-senha').remove();

            if (password.length === 0)
                return;

            const { strength, suggestions } = analyzePasswordStrength(password);

            let strengthIcon;
            let strengthClass;
            let message;

            if (strength < 4)
            {
                if (strength < 2)
                {
                    strengthIcon = 'fa-chevron-down';
                    strengthClass = 'senha-fraca';
                    message = 'Senha fraca! Use ';
                }
                else
                {
                    strengthIcon = 'fa-minus'; 8
                    strengthClass = 'senha-mediana';
                    message = 'Senha mediana! Use ';
                }

                suggestions.forEach((suggestion, index) =>
                {
                    message += suggestion;

                    if (suggestions.length - 1 === index)
                        message += '.';
                    else if (suggestions.length - 2 === index)
                        message += ' e ';
                    else
                        message += ', ';
                });
            }
            else
            {
                strengthIcon = 'fa-chevron-up';
                strengthClass = 'senha-forte';
                message = 'Senha forte!';
            }

            const strengthContainer = $('<div>', { id: 'forca-senha', class: strengthClass });

            strengthContainer.append($('<i>', { class: `fa-solid ${strengthIcon}` }));
            strengthContainer.append($('<div>', { id: 'forca-senha-mensagem', class: 'hidden', text: message }));

            strengthContainer.on('mouseenter', () =>
            {
                $('#forca-senha-mensagem').removeClass('hidden');
            });
            strengthContainer.on('mouseleave', () =>
            {
                $('#forca-senha-mensagem').addClass('hidden');
            });

            $('#container-senha').append(strengthContainer);
        });

        $('form').on('submit', e =>
        {
            e.preventDefault();

            changePassword(fullToken.id, $('input').val(), async () =>
            {
                await deleteToken(fullToken.id);

                sessionStorage.clear();

                window.location.href = '/';
            });
        });
    });


})