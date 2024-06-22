import { getDate } from "../../util.js";
import { login, register } from "../api/users.js";

$(() =>
{
    function buildLogin()
    {
        const loginContentEl = $('.loginContent');

        const passwordDivEl = $('<div>', { class: 'password' });

        const noneDivEl = $('<div>', { class: 'none' });
        noneDivEl.append($('<input>', { type: 'password', class: 'input login-senha', placeholder: 'Senha:' }));
        noneDivEl.append($('<a>', { href: '#', text: 'Esqueci minha senha' }));

        passwordDivEl.append(noneDivEl);

        loginContentEl.prepend(passwordDivEl);
        loginContentEl.prepend($('<input>', { type: 'email', class: 'input login-email', placeholder: 'Email:' }));
        loginContentEl.prepend($('<h1>', { text: 'Entrar' }));
    }

    function buildRegister()
    {
        const registerContentEl = $('.registerContent');

        registerContentEl.prepend($('<input>', { type: 'password', class: 'input register-senha', placeholder: 'Senha:' }));
        registerContentEl.prepend($('<input>', { type: 'email', class: 'input register-email', placeholder: 'Email:' }));
        registerContentEl.prepend($('<input>', { type: 'text', class: 'input register-nome', placeholder: 'Nome:' }));
        registerContentEl.prepend($('<h1>', { text: 'Cadastrar' }));
    }

    function buildDeactivatedContent(contentContainer)
    {
        let type;

        if (contentContainer.hasClass('loginContent'))
            type = 1;
        else if (contentContainer.hasClass('registerContent'))
            type = 2;
        else
            return;

        const registerMessage = 'Faça seu registro e comece a ser produtivo com a sua agenda totalmente organizada!';
        const loginMessage = 'Entre na sua conta e continue a tornar sua vida mais organizada e produtiva!';

        const logoEl = $('<div>', { class: 'logo' });
        logoEl.append($('<h4>', { text: `Bem vindo${type === 1 ? ' de volta' : ''} ao` }));
        logoEl.append($('<img>', { src: 'assets/imgs/logo.png', alt: 'logo' }));

        contentContainer.prepend($('<p>', { text: `${type === 1 ? loginMessage : registerMessage}` }));
        contentContainer.prepend(logoEl);
    }

    function transition(from, to, executeFunction)
    {
        if (to.hasClass('active'))
        {
            executeFunction();
            return;
        }

        from.children().not('.button').remove();
        to.children().not('.button').remove();

        from.removeClass('active');
        buildDeactivatedContent(from);

        to.addClass('active');

        if (to.hasClass('loginContent'))
            buildLogin();
        else
            buildRegister();
    }

    $('.loginButton').on('click', () =>
    {
        transition($('.registerContent'), $('.loginContent'), () =>
        {
            login($('.login-email').val(), $('.login-senha').val(), result =>
            {
                console.log(result);
            });
        });
    });

    $('.registerButton').on('click', () =>
    {
        transition($('.loginContent'), $('.registerContent'), () =>
        {
            register({
                name: $('.register-nome').val(),
                email: $('.register-email').val(),
                password: $('.register-senha').val(),
                experience: '0',
                aboutMe: '',
                creationDate: getDate()
            }, () => { transition($('.registerContent'), $('.loginContent')); });
        });
    });
});