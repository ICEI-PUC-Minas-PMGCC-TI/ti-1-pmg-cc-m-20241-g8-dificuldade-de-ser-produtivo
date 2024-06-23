import { getDate } from "../../util.js";
import { login, register } from "../api/users.js";

$(() =>
{
    $('form').on('submit', e =>
    {
        console.log('a');
        e.preventDefault();
    });

    function buildLogin()
    {
        const loginContentEl = $('.loginContent');

        const passwordDivEl = $('<div>', { class: 'password' });

        const noneDivEl = $('<div>', { class: 'none' });
        noneDivEl.append($('<input>', { type: 'password', class: 'input login-senha', placeholder: 'Senha:', required: true }));
        noneDivEl.append($('<a>', { href: '#', text: 'Esqueci minha senha' }));

        passwordDivEl.append(noneDivEl);

        loginContentEl.prepend($('<p>', { id: 'msg' }));
        loginContentEl.prepend(passwordDivEl);
        loginContentEl.prepend($('<input>', { type: 'email', class: 'input login-email', placeholder: 'Email:', required: true }));
        loginContentEl.prepend($('<h1>', { text: 'Entrar' }));
    }

    function buildRegister()
    {
        const registerContentEl = $('.registerContent');

        const passwordContainer = $('<div>', { class: 'container-register-senha' });
        const passwordInput = $('<input>', { type: 'password', class: 'input register-senha', placeholder: 'Senha:', required: true });
        passwordInput.on('input', e =>
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

            passwordContainer.append(strengthContainer);
        });
        passwordContainer.append(passwordInput);

        registerContentEl.prepend($('<p>', { id: 'msg' }));
        registerContentEl.prepend(passwordContainer);
        registerContentEl.prepend($('<input>', { type: 'email', class: 'input register-email', placeholder: 'Email:', required: true }));
        registerContentEl.prepend($('<input>', { type: 'text', class: 'input register-nome', placeholder: 'Nome:', required: true }));
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
                const msgEl = $('#msg');

                msgEl.text('');

                if (result === null)
                {
                    msgEl.removeClass('hidden');
                    msgEl.text('Email ou senha incorretos.');
                }
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
            }, () =>
            {
                transition($('.registerContent'), $('.loginContent'));
                $('#msg').text('Cadastro feito com sucesso!');

                setTimeout(() =>
                {
                    $('.msg').addClass('hidden');
                }, 3000);
            });
        });
    });

    function analyzePasswordStrength(password)
    {
        let strength = 0;
        let suggestions = [];

        // Criteria for password strength
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const minLength = password.length >= 8;

        // Increment strength based on criteria met
        if (hasUpperCase) strength++;
        else suggestions.push('letras maiúsculas');

        if (hasLowerCase) strength++;
        else suggestions.push('letras minúsculas');

        if (hasNumber) strength++;
        else suggestions.push('números');

        if (hasSpecialChar) strength++;
        else suggestions.push('caracteres especiais');

        if (minLength) strength++;
        else
        {
            suggestions.push('8 caracteres ou mais');
            strength--;
        }

        return { strength, suggestions };
    }
});