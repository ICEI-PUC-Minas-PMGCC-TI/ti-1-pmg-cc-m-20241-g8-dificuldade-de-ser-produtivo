$(() =>
{
    let currentDiscussionPage = 1;

    //Chamada da API para pegar X discussões após o carregamento da página
    getDiscussions(currentDiscussionPage, 0, retrieveDiscussions);

    function retrieveDiscussions(discussions)
    {
        if (currentDiscussionPage === 1 && discussions.length === 0)
        {
            showMessage('Ainda não há discussões.|Seja o primeiro a iniciar uma discussão!');
        }

        currentDiscussionPage++;

        const forumContainerEl = $('#forum-container');

        discussions.forEach(discussionData =>
        {
            forumContainerEl.append(createDiscussionElement(discussionData));
        });
    }

    function createDiscussionElement(discussionData)
    {
        const fragment = document.createDocumentFragment();

        const discussionContainer = createDiscussionContainer(discussionData);
        fragment.append(discussionContainer);

        return fragment;
    }

    function createDiscussionContainer(discussionData)
    {
        const discussionContainer = $('<div>', { class: 'discussion-container' });

        const userContainer = createUserContainer(discussionData.userName);
        discussionContainer.append(userContainer);

        const contentContainer = createContentContainer(discussionData.title, discussionData.text);
        discussionContainer.append(contentContainer);

        const optionsContainer = createOptionsContainer(discussionData.commentsCount);
        discussionContainer.append(optionsContainer);

        return discussionContainer;
    }

    function createUserContainer(userName)
    {
        const userContainer = $('<div>', { class: 'user' });
        userContainer.append($('<i>', { class: 'fa-solid fa-user' }));
        userContainer.append($('<span>', { text: userName }));
        return userContainer;
    }

    function createContentContainer(title, text)
    {
        const contentContainer = $('<div>', { class: 'content' });
        contentContainer.append($('<h2>', { text: title }));
        contentContainer.append($('<p>', { text: text }));
        return contentContainer;
    }

    function createOptionsContainer(commentsCount)
    {
        const optionsContainer = $('<div>', { class: 'options' });

        const options = [
            { iconClass: 'fa-solid fa-bookmark', text: 'Salvar' },
            { iconClass: 'fa-solid fa-comment', text: commentsCount },
            { iconClass: 'fa-solid fa-share-from-square', text: 'Compartilhar' }
        ];

        options.forEach(option =>
        {
            const optionContainer = $('<div>', { class: 'option' });
            optionContainer.append($('<i>', { class: option.iconClass }));
            optionContainer.append($('<span>', { text: option.text }));
            optionsContainer.append(optionContainer);

            optionContainer.on('click', e =>
            {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        return optionsContainer;
    }


    function showMessage(message)
    {
        const messageEl = $('#message');

        const messageLines = message.split('|');

        messageLines.forEach((line, index) =>
        {
            const paragraph = $('<p></p>');

            paragraph.text = line;

            messageEl.append(paragraph);
        });
    }
});


