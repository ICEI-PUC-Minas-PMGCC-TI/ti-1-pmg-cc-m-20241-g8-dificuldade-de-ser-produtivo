$(() =>
{
    function buildLogin()
    {
        const loginContentEl = $('.loginContent');

        const titleEl = $('<h1>', { text: 'Entrar' });
        loginContentEl.append(titleEl);

        const emailInputEl = $('<input>', { type: 'email', class: 'input-email', placeholder: 'Email:' });
        loginContentEl.append(emailInputEl);

        const passwordDivEl = $('<div>', { class: 'password' });

        const noneDivEl = $('<div>', { class: 'none' });

        const passwordInputEl = $('<input>', { type: 'password', class: 'input-senha', placeholder: 'Senha:' });
        noneDivEl.append(passwordInputEl);

        const forgotPasswordLinkEl = $('<a>', { href: '#', text: 'Esqueci minha senha' });
        noneDivEl.append(forgotPasswordLinkEl);

        passwordDivEl.append(noneDivEl);

        loginContentEl.append(passwordDivEl);

        const loginButtonEl = $('<button>', { class: 'loginButton', text: 'Entrar' });
        loginContentEl.append(loginButtonEl);
    }

    function buildRegister()
    {

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

        contentContainer.append(logoEl);
        contentContainer.append($('<p>', { text: `${type === 1 ? loginMessage : registerMessage}` }));
        contentContainer.append($('<button>', {
            class: `${type === 1 ? 'loginButton' : 'registerButton'}`,
            text: `${type === 1 ? 'Cadastrar' : 'Entrar'}`
        }));
    }

    $('.loginButton').on('click', () =>
    {
        const loginContentEl = $('.loginContent');
        const registerContentEl = $('.registerContent');

        if ($('.loginContent').hasClass('active'))
        {
            return;
        }

        registerContentEl.removeClass('active');
        registerContentEl.empty();
        buildDeactivatedContent(registerContentEl);

        loginContentEl.addClass('active');
        loginContentEl.empty();
        buildLogin();
    })

    $('.registerButton').on('click', () =>
    {
        const loginContentEl = $('.loginContent');
        const registerContentEl = $('.registerContent');

        if ($('.registerContent').hasClass('active'))
        {
            return;
        }

        loginContentEl.removeClass('active');
        loginContentEl.empty();
        buildDeactivatedContent(loginContentEl);

        registerContentEl.addClass('active');
        registerContentEl.empty();
        buildRegister();
    });
});