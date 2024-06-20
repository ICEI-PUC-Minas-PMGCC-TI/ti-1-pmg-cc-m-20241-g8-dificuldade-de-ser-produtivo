import { getDate, infiniteScroll, throttle } from "../../util.js";
import { Targets, createComment, deleteComment, editComment, getComments, getUserComments, likeComment } from "../api/comments.js";
import { getSpecificDiscussion, updateComments } from "../api/discussions.js";
import { addLikeRelationship, getLikeRelationship, removeLikeRelationship } from "../api/likes.js";

$(() =>
{
    let params = new URLSearchParams(document.location.search);

    const discussionId = params.get('id');

    if (discussionId === null)
        window.location.href = 'forum.html';

    let currentCommentPage = 1;

    let shouldContinueRetrievingData = true;

    const userId = '0';

    let commentsList = {};

    start();

    $('#my-comment').on('input', resizeMyComment);

    $(window).on('resize', resizeMyComment);

    function retrieveDiscussion(discussionEntry)
    {
        if (discussionEntry.length === 0)
        {
            $('#discussion-container').remove();

            shouldContinueRetrievingData = false;

            showMessage('Erro 404|Essa discussão não existe.');

            return;
        }

        const discussion = discussionEntry[0];

        populateDiscussionWithData(discussion);
    }

    function retrieveComments(comments, shouldSendMessage = true, shouldDisableScroll = true, shouldChangePage = true)
    {
        if (comments.length === 0)
        {
            if (currentCommentPage === 1 && shouldSendMessage)
                showMessage("Ainda não há comentários.|Seja o primeiro a comentar!");
            if (shouldDisableScroll)
                $('#discussion').off('scroll');

            return;
        }

        if (shouldChangePage)
            currentCommentPage++;

        comments.forEach(commentData =>
        {
            getLikeRelationship(commentData.id, userId, likeRelationship =>
            {
                commentsList[commentData.id] = commentData;

                createCommentElement(commentData, likeRelationship).insertBefore($('.loader-container'));
            })
        });
    }

    function populateDiscussionWithData(discussion)
    {
        const userElement = $('#user span');
        const dateElement = $('header div:nth-child(3)');
        const titleElement = $('#content h2');
        const textElement = $('#content p');

        userElement.text(discussion.authorId === userId ? 'Você' : ''); //TODO author name
        dateElement.text(discussion.date);
        titleElement.text(discussion.title);
        textElement.text(discussion.text);

        if (discussion.authorId === userId)
        {
            $('.option').get(0).remove();
            $('#discussion-container footer').remove();
        }
    }

    function createCommentElement(commentData, likeRelationship)
    {
        const comment = $('<div>', { class: 'comment' });

        const commentHeader = createCommentHeader(() =>
        {
            if (commentData.authorId === userId)
                return 'Você';

            return `${commentData.authorName}`;
        }, commentData.date, commentData.edited);
        comment.append(commentHeader);

        const commentText = $('<p>', { text: commentData.text });
        comment.append(commentText);

        const commentOptions = createCommentOptions(comment, commentData, likeRelationship, commentText);
        comment.append(commentOptions);

        const commentIdInput = $('<input>', { class: 'commentId', type: 'hidden', value: commentData.id });
        comment.append(commentIdInput);

        return comment;
    }

    function createCommentHeader(userName, date, edited)
    {
        const commentHeader = $('<div>', { class: 'comment-user' });
        commentHeader.append($('<i>', { class: 'fa-solid fa-user' }));
        commentHeader.append($('<span>', { text: userName }));
        commentHeader.append($('<span>', { text: `${date}` }));

        if (edited)
            commentHeader.append($('<span>', { class: 'edited-tag', text: '(Editado)' }));

        return commentHeader;
    }

    function createCommentOptions(commentElement, comment, likeRelationship, commentText)
    {
        const commentId = comment.id;

        const commentOptions = $('<div>', { class: 'options' });

        const likesButton = $('<button>', { class: 'likes' });

        if (likeRelationship !== null && likeRelationship.length !== 0)
            likesButton.addClass('checked');

        likesButton.append($('<i>', { class: 'fa-regular fa-thumbs-up' }));
        likesButton.append($('<span>', { text: comment.likes }));

        let deleteButton = null;
        let editButton = null;
        let saveButton = null;

        if (comment.authorId === userId)
        {
            likesButton.prop('disabled', true);

            deleteButton = $('<button>', { class: 'delete' });
            deleteButton.append($('<i>', { class: 'fa-solid fa-trash' }));
            deleteButton.append($('<span>', { text: 'Remover' }));

            deleteButton.on('click', e =>
            {
                deleteComment(commentId, () =>
                {
                    updateComments(discussionId, -1, () => { deleteButton.closest('.comment').remove(); });
                });
            });

            saveButton = $('<button>', { class: 'save hidden' });
            saveButton.append($('<i>', { class: 'fa-solid fa-check' }));
            saveButton.append($('<span>', { text: 'Salvar' }));

            editButton = $('<button>', { class: 'edit' });
            editButton.append($('<i>', { class: 'fa-solid fa-pen-to-square' }));
            editButton.append($('<span>', { text: 'Editar' }));

            saveButton.on('click', e =>
            {
                const textAreaEl = commentElement.children('.edit-comment');

                if (textAreaEl.length === 0)
                    return;

                editComment(comment.id, textAreaEl.eq(0).val(), () =>
                {
                    commentText.text(textAreaEl.eq(0).val());

                    editButton.toggleClass('checked');

                    const commentHeaderEl = commentElement.children('.comment-user').eq(0);

                    commentHeaderEl.append($('<span>', { class: 'edited-tag', text: '(Editado)' }));

                    console.log(commentHeaderEl);

                    handleEditCommentState(editButton, saveButton, textAreaEl.eq(0), commentText);
                });
            });

            editButton.on('click', e =>
            {
                editButton.toggleClass('checked');

                const possibleElements = commentElement.children('.edit-comment');

                let textArea;

                if (possibleElements.length !== 0)
                    textArea = possibleElements.eq(0);

                handleEditCommentState(editButton, saveButton, textArea, commentText);
            });
        }
        else
        {
            likesButton.on('click', e =>
            {
                getLikeRelationship(commentId, userId, likeRelationship =>
                {
                    const operation = likeRelationship.length === 0 ? 1 : -1;

                    likeComment(comment, operation, () =>
                    {
                        if (operation === 1)
                        {
                            addLikeRelationship(commentId, userId, () => { handleLike(likesButton, operation) });
                            return;
                        }

                        removeLikeRelationship(likeRelationship[0].id, () => { handleLike(likesButton, operation) })
                    });
                });
            });
        }

        commentOptions.append(likesButton);

        if (comment.authorId === userId)
        {
            commentOptions.append(deleteButton);
            commentOptions.append(editButton);
            commentOptions.append(saveButton);
        }


        return commentOptions;
    }

    function handleEditCommentState(editButton, saveButton, textArea, commentText)
    {
        const iconEl = editButton.children('i').eq(0);

        if (editButton.hasClass('checked'))
        {
            saveButton.removeClass('hidden');
            saveButton.prop('disabled', true);

            editButton.text('Cancelar');

            iconEl.removeClass('fa-pen-to-square');
            iconEl.addClass('fa-xmark');

            iconEl.remove();

            editButton.prepend(iconEl);

            commentText.addClass('hidden');

            textArea = $('<textarea>', { class: 'edit-comment', text: commentText.text() });

            textArea.on('input', e =>
            {
                const oldText = commentText.text();

                const check = (textArea.val() !== oldText && (textArea.val().length > 0 && textArea.val().match(/^ *$/) == null));

                saveButton.prop('disabled', !check);
            });

            textArea.insertBefore(commentText);

            return;
        }

        saveButton.addClass('hidden');

        iconEl.removeClass('fa-xmark');
        iconEl.addClass('fa-pen-to-square');

        iconEl.remove();

        editButton.prepend(iconEl);

        editButton.text('Editar');

        commentText.removeClass('hidden');

        textArea.remove();
    }

    function handleLike(likesButton, operation)
    {
        likesButton.toggleClass('checked');

        const spanEl = likesButton.children('span').eq(0);

        spanEl.text(parseInt(spanEl.text()) + operation);

        const iEl = likesButton.children('i').eq(0);

        if (likesButton.hasClass('checked'))
        {
            iEl.removeClass('fa-regular');
            iEl.addClass('fa-solid');
        }
        else 
        {
            iEl.removeClass('fa-solid');
            iEl.addClass('fa-regular');
        }
    }

    function sendComment(text, target, targetId)
    {
        const comment = {
            authorId: userId,
            target: target,
            targetId: targetId,
            text: text,
            likes: 0,
            date: getDate(),
            edited: false
        };

        createComment(comment, data =>
        {
            updateComments(discussionId, 1, () =>
            {
                const commentEl = createCommentElement(data, null);

                commentsList[data.id] = data;

                $('#comments-container').prepend(commentEl);
            });
        });
    }

    function showMessage(message) 
    {
        const messageContainer = $('<div>', { id: 'message' });

        const messageLines = message.split('|');

        messageLines.forEach(line =>
        {
            const paragraph = $('<p>', { text: line });

            messageContainer.append(paragraph);
        });

        $('#discussion').append(messageContainer);
    }

    function start()
    {
        getSpecificDiscussion(discussionId, discussion =>
        {
            retrieveDiscussion(discussion);

            if (!shouldContinueRetrievingData)
                return;

            getUserComments(discussionId, userId, userComments =>
            {
                retrieveComments(userComments, false, false, false);

                getComments(currentCommentPage, discussionId, userId, comments =>
                {
                    retrieveComments(comments, userComments.length === 0);

                    if (comments.length > 0)
                        $('#discussion').on('scroll', () => { infiniteScroll(getComments, currentCommentPage, discussionId, userId, retrieveComments); });

                    const myCommentEl = $('#my-comment')

                    myCommentEl.on('input', setSendButtonState);

                    const sendCommentEl = $('#send-comment');

                    sendCommentEl.on('click', e =>
                    {
                        sendCommentEl.prop('disabled', true);

                        const commentText = myCommentEl.val();

                        myCommentEl.val('');

                        sendComment(commentText, Targets.DISCUSSION, discussionId);
                    });
                });
            });
        });
    }

    function setSendButtonState() 
    {
        const myCommentText = $('#my-comment').val().replace(' ', '');

        const check = (myCommentText.length > 0 && myCommentText.match(/^ *$/) === null);

        $('#send-comment').prop('disabled', !check);
    }

    function resizeMyComment()
    {
        const myCommentEl = $('#my-comment');

        myCommentEl.height(20);

        myCommentEl.height(myCommentEl.height() + (myCommentEl.get(0).scrollHeight - 23));
    }
}); 