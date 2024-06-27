$(() =>
{
    const userId = sessionStorage.getItem('user');

    function generateEditOptions()
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

    generateEditOptions();
});