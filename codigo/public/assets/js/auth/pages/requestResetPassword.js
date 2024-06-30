import { retrieveToken } from "../api/resetTokens.js";

$(() =>
{
    const sendEl = $('#send');

    $('#cancelar').on('click', () =>
    {
        window.location.href = '/';
    });

    $('form').on('submit', e =>
    {
        e.preventDefault();

        if (sendEl.hasClass('loading'))
            return;

        sendEl.text('');
        sendEl.addClass('loading');
        sendEl.append($('<div>', { class: 'loader' }));

        const email = $('input').val();

        retrieveToken(email, msg =>
        {
            $('#msg').text(msg);
            sendEl.empty();
            sendEl.text('Enviar');
            sendEl.removeClass('loading');
        });
    })
});