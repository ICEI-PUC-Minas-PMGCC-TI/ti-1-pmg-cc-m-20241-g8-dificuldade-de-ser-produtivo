import { addXp, updateStats } from "../../auth/api/users.js";
import { getDate } from "../../util.js";
import { createDiscussion, getSpecificDiscussion, updateDiscussion } from "../api/discussions.js";

$(() =>
{
    const Modes = {
        CREATE: 0,
        EDIT: 1
    };

    let params = new URLSearchParams(window.location.search);

    let discussionId = params.get('id');

    let discussion;

    const userId = sessionStorage.getItem('user');

    let mode;

    if (!discussionId)
        mode = Modes.CREATE;
    else
        mode = Modes.EDIT;

    let lockState = false;

    onLoadPage();

    $(window).on('resize', resizeTextArea);

    $('form').on('submit', e =>
    {
        e.preventDefault();
    });

    $('#title').on('input', () =>
    {
        didFillInFields();

        if (mode === Modes.EDIT)
            checkSimilarityToOriginal();
    });

    $('#body').on('input', e =>
    {
        resizeTextArea();

        didFillInFields();

        if (mode === Modes.EDIT)
            checkSimilarityToOriginal();
    });


    $('#submit').on('click', () =>
    {
        lockState = true;

        if (mode === Modes.CREATE)
        {
            discussion = {
                authorId: userId,
                title: $('#title').val(),
                text: $('#body').val(),
                date: getDate(),
                commentCount: 0
            };

            $('#cancel').prop('disabled', true);

            createDiscussion(discussion, () =>
            {
                addXp(userId, 200, () =>
                {
                    updateStats(userId, 'discussionsStarted', () =>
                    {
                        window.location.href = `forum.html?state=2`;
                    });
                });
            });

            return;
        }

        discussion.title = $('#title').val();
        discussion.text = $('#body').val();
        discussion.updateDate = getDate();

        updateDiscussion(discussionId, discussion, () =>
        {
            window.location.href = `forum.html?state=2`;
        });

        return;
    });

    $('#cancel').on('click', () =>
    {
        console.log(lockState)

        if (!lockState)
            window.location.href = 'forum.html';
    });

    function onLoadPage()
    {
        if (mode !== Modes.EDIT)
            return;

        $('#submit span').text('Salvar');

        getSpecificDiscussion(discussionId, data =>
        {
            discussion = data[0];

            console.log(discussion)

            $('#title').val(discussion.title);
            $('#body').val(discussion.text);

        });
    }

    function didFillInFields()
    {
        const titleText = $('#title').val().replace(' ', '');
        const bodyText = $('#body').val().replace(' ', '');

        const check = (titleText.length > 0 && titleText.match(/^ *$/) == null) &&
            (bodyText.length > 0 && bodyText.match(/^ *$/) == null);

        $('#submit').prop('disabled', !check);
    }

    function checkSimilarityToOriginal()
    {
        const titleText = $('#title').val().replace(' ', '');
        const bodyText = $('#body').val().replace(' ', '');

        const check = titleText === discussion.title.replace(' ', '') && bodyText === discussion.text.replace(' ', '');

        console.log(check);

        $('#submit').prop('disabled', check);
    }


    function resizeTextArea()
    {
        const bodyEl = $('#body');

        bodyEl.height(96);

        bodyEl.height(bodyEl.height() + (bodyEl.get(0).scrollHeight - 126));
    }
});