import { infiniteScroll } from '../../util.js';
import { addBookmark, getBookmark, removeBookmark } from '../api/bookmarks.js';
import { getDiscussions } from '../api/discussions.js';

$(() =>
{
	let currentDiscussionPage = 1;

	const userId = '0';

	//Chamada da API para pegar X discussões após o carregamento da página
	getDiscussions(currentDiscussionPage, 0, retrieveDiscussions);

	$('#forum').on('scroll', () => { infiniteScroll(getDiscussions, currentDiscussionPage, 0, retrieveDiscussions) });

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
			getBookmark(discussionData.id, userId, bookmarkData =>
			{
				createDiscussionElement(discussionData, bookmarkData).insertBefore($('.loader-container'));
			})
		});
	}

	function createDiscussionElement(discussionData, bookmarkData)
	{
		const discussion = $('<a>', { class: 'discussion', href: 'discussao.html' });

		discussion.append(createDiscussionBoundaries(discussionData, bookmarkData));

		return discussion;
	}

	function createDiscussionBoundaries(discussionData, bookmarkData)
	{
		const discussionBoundaries = $('<div>', { class: 'discussion-boundaries' });

		discussionBoundaries.append(createDiscussionContainer(discussionData, bookmarkData));

		return discussionBoundaries;
	}

	function createDiscussionContainer(discussionData, bookmarkData)
	{
		const discussionContainer = $('<div>', { class: 'discussion-container' });

		const userContainer = createUserContainer(discussionData.userName);
		discussionContainer.append(userContainer);

		const contentContainer = createContentContainer(discussionData.title, discussionData.text);
		discussionContainer.append(contentContainer);

		const optionsContainer = createOptionsContainer(discussionData.commentCount, discussionData.id, bookmarkData);
		discussionContainer.append(optionsContainer);

		discussionContainer.append($('<input>', { class: 'discussion-id', type: 'hidden', value: discussionData.id }))

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

	function createOptionsContainer(commentCount, discussionId, bookmarkData)
	{
		const optionsContainer = $('<div>', { class: 'options' });

		const options = [
			{ iconClass: 'fa-solid fa-bookmark', text: 'Salvar' },
			{ iconClass: 'fa-solid fa-comment', text: commentCount },
			{ iconClass: 'fa-solid fa-share-from-square', text: 'Compartilhar' }
		];

		options.forEach((option, index) =>
		{
			const bookmarked = bookmarkData.length !== 0;

			const optionContainer = $('<div>', { class: 'option' });
			optionContainer.append($('<i>', { class: option.iconClass }));
			optionContainer.append($('<span>', { text: index === 0 && bookmarked ? 'Salvo' : option.text }));
			optionsContainer.append(optionContainer);

			if (index !== 1)
			{
				if (bookmarkData.length !== 0)
					optionContainer.addClass('checked');

				optionContainer.on('click', e =>
				{
					e.preventDefault();
					e.stopPropagation();

					if (index === 0)
						getBookmark(discussionId, userId, bookmarkData => { handleBookmark(bookmarkData, discussionId, optionContainer); });
				});

				return;
			}
		});

		return optionsContainer;
	}

	function handleBookmark(bookmarkData, discussionId, optionEl)
	{
		const spanEl = optionEl.children('span').eq(0);

		if (bookmarkData.length === 0)
		{
			addBookmark(discussionId, userId, () =>
			{
				optionEl.addClass('checked');
				spanEl.text('Salvo');
			});
		}
		else
		{
			removeBookmark(bookmarkData[0].id, () =>
			{
				optionEl.removeClass('checked');
				spanEl.text('Salvar');
			})
		}
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


