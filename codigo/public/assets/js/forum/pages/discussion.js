import { infiniteScroll, throttle } from "../../util.js";
import { createComment, deleteComment, getComments, getUserComments, likeComment } from "../api/comments.js";
import { getSpecificDiscussion } from "../api/discussions.js";
import { addLikeRelationship, getLikeRelationship, removeLikeRelationship } from "../api/likes.js";

$(() =>
{
    let currentCommentPage = 1;

    let shouldContinueRetrievingData = true;

    let shouldSendMessage = false;

    const userId = '0';

    let params = new URLSearchParams(document.location.search);

    const discussionId = params.get('id');

    if (discussionId === null)
        window.location.href = 'forum.html';

    let commentsList = {};

    start();

    function retrieveDiscussion(discussionEntry)
    {
        if (discussionEntry.length === 0)
        {
            shouldContinueRetrievingData = false;
            return;
        }

        const discussion = discussionEntry[0];

        populateDiscussionWithData(discussion);
    }

    function retrieveComments(comments)
    {
        if (comments.length === 0)
        {
            if (currentCommentPage === 1 && shouldSendMessage)
                showMessage("Ainda não há comentários.|Seja o primeiro a comentar!");
            else
                $('#discussion').off('scroll');

            return;
        }

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

        userElement.text(discussion.authorName);
        dateElement.text(discussion.date);
        titleElement.text(discussion.title);
        textElement.text(discussion.text);

        if (discussion.authorId === userId)
            $('.option').get(0).remove(); 
    }

    function createCommentElement(commentData, likeRelationship)
    {
        const comment = $('<div>', { class: 'comment' });

        const commentUser = createCommentUser(() =>
        {
            if (commentData.authorId === userId)
                return 'Você';

            return commentData.authorName;
        });
        comment.append(commentUser);

        const commentText = $('<p>', { text: commentData.text });
        comment.append(commentText);

        const commentOptions = createCommentOptions(commentData.likes, commentData.id, commentData.authorId, likeRelationship);
        comment.append(commentOptions);

        const commentIdInput = $('<input>', { class: 'commentId', type: 'hidden', value: commentData.id });
        comment.append(commentIdInput);

        return comment;
    }

    function createCommentUser(userName)
    {
        const commentUser = $('<div>', { class: 'comment-user' });
        commentUser.append($('<i>', { class: 'fa-solid fa-user' }));
        commentUser.append($('<span>', { text: userName }));
        return commentUser;
    }

    function createCommentOptions(likes, commentId, authorId, likeRelationship)
    {
        const commentOptions = $('<div>', { class: 'comment-options' });

        const likesButton = $('<button>', { class: 'likes' });

        if (likeRelationship.length !== 0)
            likesButton.addClass('checked');

        likesButton.append($('<i>', { class: 'fa-regular fa-thumbs-up' }));
        likesButton.append($('<span>', { text: likes }));

        let deleteButton = null;

        if (authorId === userId)
        {
            likesButton.prop('disabled', true);

            deleteButton = $('<button>', { class: 'delete' });
            deleteButton.append($('<i>', { class: 'fa-solid fa-trash' }));
            deleteButton.append($('<span>', { text: 'Remover' }));

            deleteButton.on('click', e =>
            {
                deleteComment(commentId, () =>
                {
                    deleteButton.closest('.comment').remove();
                });
            });
        }
        else
            likesButton.on('click', e =>
            {
                getLikeRelationship(commentId, userId, likeRelationship =>
                {
                    const operation = likeRelationship.length === 0 ? 1 : -1;

                    likeComment(commentsList[commentId], operation, () =>
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

        commentOptions.append(likesButton);

        if (deleteButton !== null)
            commentOptions.append(deleteButton);

        return commentOptions;
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
            return;
        }
    }

    function sendComment()
    {
        const comment = {
            "authorId": userId,
            "discussionId": 0
        }

        createComment();
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

        $('#comments-container').append(messageContainer);
    }

    function start()
    {
        throttle(() => { getSpecificDiscussion(discussionId, retrieveDiscussion) });

        if (!shouldContinueRetrievingData)
            return;

        getUserComments(discussionId, userId, retrieveComments);

        shouldSendMessage = true;

        getComments(currentCommentPage, discussionId, userId, retrieveComments);

        $('#discussion').on('scroll', () => { infiniteScroll(getComments, currentCommentPage, 1, 0, retrieveComments); });

        $('#send-comment').on('click', sendComment);
    }
}); 