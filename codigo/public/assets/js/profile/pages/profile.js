import { generateToken } from "../../auth/api/resetTokens.js";
import { getUserByIdSecure, updateUser } from "../../auth/api/users.js";

$(() =>
{
    //const userId = sessionStorage.getItem('user');

    const userId = sessionStorage.getItem('user');

    let params = new URLSearchParams(window.location.search);

    let selectedUser = params.get('user');

    if (selectedUser === null)
        selectedUser = userId;

    if (selectedUser === userId)
        generateEditorFeatures();

    let user;

    getUserByIdSecure(selectedUser, data =>
    {
        if (data.length === 0)
        {
            const perfil = $('#perfil');
            perfil.empty();
            perfil.addClass('vazio');

            const msg = $('<div>', { id: 'perfil-mensagem' });
            msg.append($('<h1>', { text: 'Oh não!' }));
            msg.append($('<h1>', { text: 'Este usuário não existe.' }));

            perfil.append(msg);

            return;
        }

        user = data[0];

        $('.nome-perfil').text(user.name);
        $('.banner-perfil').css('background', `linear-gradient(180deg, ${user.bannerColor} 65%, rgb(227, 227, 227) 35%)`);

        if (user.picturePath !== null)
        {
            $('img-perfil').prop('src', user.picturePath);
        }

        $('#nivel-perfil').text(user.level);
        $('#xp-atual').text(user.experience);
        $('.barra-xp2').css('width', `${user.experience / 10}%`);
        $('#sobre-mim-texto').text(user.aboutMe.length > 0 ? user.aboutMe : 'Nada informado.');
    });

    function generateEditorFeatures()
    {
        generateImagePicker();
        generateOptions();
    }

    function generateImagePicker()
    {
        const picNameEl = $('#foto-nome-perfil');

        const label = $('<label>', { for: 'input-foto-perfil', id: 'label-foto-perfil' });
        label.append($('<i>', { class: 'fa-solid fa-pen-to-square' }));

        const input = $('<input>', { type: 'file', id: 'input-foto-perfil', name: 'input-foto-perfil', accept: 'image/*' });

        input.on('change', e =>
        {
            console.log(e.target.files[0]);
        });

        picNameEl.prepend(label);
        picNameEl.prepend(input);
    }

    function generateOptions()
    {
        const headerEl = $('header');

        const div = $('<div>', { id: 'opcoes-perfil' });

        const labelColorPicker = $('<label>', { for: 'cor-banner', id: 'label-cor-banner' });

        labelColorPicker.append($('<i>', { class: 'fa-solid fa-palette' }));

        const inputColorPicker = $('<input>', { type: 'color', id: 'cor-banner' });

        inputColorPicker.on('change', e =>    
        {
            const color = $(e.target).val();

            updateUser(selectedUser, { bannerColor: color }, () =>
            {
                $('.banner-perfil').css('background', `linear-gradient(180deg, ${color} 65%, rgb(227, 227, 227) 35%)`);
            });
        });

        const configs = $('<i>', { class: 'fa-solid fa-gear', id: 'configuracoes-perfil' });

        configs.on('click', () =>
        {
            showModal();
            console.log('a');
        });

        div.append(inputColorPicker);
        div.append(labelColorPicker);
        div.append(configs);

        headerEl.append(div);
    }

    function showModal()
    {
        const fundoModalPerfil = $('<div>', { id: 'fundo-modal-perfil' });
        const modalPerfil = $('<div>', { id: 'modal-perfil' });

        const sectionNome = $('<section>').append(
            $('<label>', { for: 'modal-nome-perfil', text: 'Nome' }).append(
                $('<span>', { id: 'modal-msg' })
            ),
            $('<input>', { id: 'modal-nome-perfil', name: 'modal-nome-perfil', type: 'text', value: user.name, maxlength: '30' })
        );

        console.log(user.aboutMe);

        const sectionDescricao = $('<section>').append(
            $('<label>', { for: 'modal-descricao', text: 'Sobre mim' }),
            $('<textarea>', { name: 'modal-descricao', id: 'modal-descricao' }).val(user.aboutMe)
        );

        const senhaButton = $('<button>', { id: 'modal-alterar-senha' }).append(
            $('<i>', { class: 'fa-solid fa-pen-to-square' }),
            ' Alterar senha'
        );

        senhaButton.on('click', () =>
        {
            generateToken(userId, token =>
            {
                window.location.href = `${window.location.origin}/redefinir-senha.html?t=${token.token}`;
            });
        });

        const sectionAlterarSenha = $('<section>').append(senhaButton);

        const salvarButton = $('<button>', { id: 'salvar' }).append(
            'Salvar ',
            $('<i>', { class: 'fa-solid fa-check' })
        );

        salvarButton.on('click', () =>
        {
            $('#modal-msg').text('');

            if ($('#modal-nome-perfil').val().trim().length === 0)
                $('#modal-msg').text('(o nome não pode ser vazio)');

            const newData = {
                name: $('#modal-nome-perfil').val().trim(),
                aboutMe: $('#modal-descricao').val().trim()
            };

            updateUser(userId, newData, () =>
            {
                user.name = newData.name;
                user.aboutMe = newData.aboutMe;

                $('.nome-perfil').text(user.name);
                $('#sobre-mim-texto').text(user.aboutMe.length > 0 ? user.aboutMe : 'Nada informado.');

                $('#cancelar').click();
            });
        });

        const cancelarButton = $('<button>', { id: 'cancelar' }).append(
            'Cancelar ',
            $('<i>', { class: 'fa-solid fa-x' })
        );

        cancelarButton.on('click', () =>
        {
            fundoModalPerfil.remove();
            modalPerfil.remove();
        });

        const buttonsDiv = $('<div>', { id: 'buttons' }).append(
            salvarButton,
            cancelarButton
        );

        const idDiv = $('<div>', { id: 'id' }).append(
            $('<p>', { text: 'id: ' }).append(
                $('<span>', { text: userId })
            )
        );

        modalPerfil.append(
            sectionNome,
            sectionDescricao,
            sectionAlterarSenha,
            buttonsDiv,
            idDiv
        );

        $('body').append(
            fundoModalPerfil,
            modalPerfil
        );
    }
});