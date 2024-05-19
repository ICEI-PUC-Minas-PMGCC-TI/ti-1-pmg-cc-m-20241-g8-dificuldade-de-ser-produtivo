$(() =>
{
    let currentDiscussionPage = 1;

    let throttleTimer;

    //Chamada da API para pegar X discussões após o carregamento da página
    getDiscussions(currentDiscussionPage, 0, retrieveDiscussions);

    $('#forum').on('scroll', infiniteScroll);

    function retrieveDiscussions(discussions)
    {
        if (discussions.length === 0)
        {
            if (currentDiscussionPage === 1)
                showMessage('Ainda não há discussões.|Seja o primeiro a iniciar uma discussão!');
            else
                $('#forum').off('scroll');

            return;
        }

        currentDiscussionPage++;

        discussions.forEach(discussionData =>
        {
            createDiscussionElement(discussionData).insertBefore($('.loader-container'));
        });
    }

    function createDiscussionElement(discussionData)
    {
        const discussion = $('<a>', { class: 'discussion', href: 'discussao.html' });

        discussion.append(createDiscussionBoundaries(discussionData));

        return discussion;
    }

    function createDiscussionBoundaries(discussionData)
    {
        const discussionBoundaries = $('<div>', { class: 'discussion-boundaries' });

        discussionBoundaries.append(createDiscussionContainer(discussionData));

        return discussionBoundaries;
    }

    function createDiscussionContainer(discussionData)
    {
        const discussionContainer = $('<div>', { class: 'discussion-container' });

        const userContainer = createUserContainer(discussionData.userName);
        discussionContainer.append(userContainer);

        const contentContainer = createContentContainer(discussionData.title, discussionData.text);
        discussionContainer.append(contentContainer);

        const optionsContainer = createOptionsContainer(discussionData.commentCount);
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

    function createOptionsContainer(commentCount)
    {
        const optionsContainer = $('<div>', { class: 'options' });

        const options = [
            { iconClass: 'fa-solid fa-bookmark', text: 'Salvar' },
            { iconClass: 'fa-solid fa-comment', text: commentCount },
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

    function throttle(callback, time)
    {
        if (throttleTimer)
            return;

        const loaderContainerEl = $('.loader-container');

        loaderContainerEl.removeClass('hidden');

        throttleTimer = true;

        setTimeout(() =>
        {
            callback();

            throttleTimer = false;

            loaderContainerEl.addClass('hidden');
        }, time);
    }

    function infiniteScroll()
    {
        throttle(() =>
        {
            const $window = $(window);

            const endOfPage = $window.innerHeight() + $window.scrollTop() >= $('body').offset().top;

            if (endOfPage)
                getDiscussions(currentDiscussionPage, 0, retrieveDiscussions);
        }, 1000);
    }

    function showMessage(message) 
    {
        const messageContainer = $('<div>', { id: 'message' });

        const messageLines = message.split('|');

        messageLines.forEach(line =>
        {
            const paragraph = $('<p>', { texxt: line });

            messageContainer.append(paragraph);
        });

        $('#forum-container').append(messageContainer);
    }
});


