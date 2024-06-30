import { getUser, getUserByIdSecure, getUserName } from '../../auth/api/users.js';
import { infiniteScroll } from '../../util.js';
import { addBookmark, getAllUserBookmarks, getBookmark, removeBookmark } from '../api/bookmarks.js';
import { deleteDiscussion, getDiscussions, getSpecificDiscussion, getUserDiscussions, searchDiscussions } from '../api/discussions.js';

$(() =>
{
	const PageStates = {
		FORUM: 0,
		BOOKMARKED_DISCUSSIONS: 1,
		MY_DISCUSSIONS: 2,
		SEARCH: 3
	};

	let params = new URLSearchParams(window.location.search);

	let curState = parseInt(params.get('state'));

	if (!curState)
		curState = PageStates.FORUM;

	let currentDiscussionPage = 1;

	const userId = sessionStorage.getItem('user');

	let timerId;

	let processing = false;

	onLoadPage();

	$('.category').each((index, element) =>
	{
		const $element = $(element);

		$element.on('click', () =>
		{
			$('.category').each((i, el) => { if (i !== index) $(el).removeClass('checked') });

			clearDiscussions();

			if ($element.hasClass('checked'))
			{
				curState = PageStates.FORUM;

				$element.removeClass('checked');

				executeStateAction();

				return;
			}

			$element.addClass('checked');

			if (index === 0)
				curState = PageStates.BOOKMARKED_DISCUSSIONS;
			else if (index === 1)
				curState = PageStates.MY_DISCUSSIONS;

			executeStateAction();
		});
	});

	$('.search i').on('click', () =>
	{
		clearDiscussions();
		console.log('a');
		curState = PageStates.SEARCH;
		executeStateAction();
	});

	$('.search input').on('keydown', e =>
	{
		if (e.key === 'Enter')
		{
			clearDiscussions();
			curState = PageStates.SEARCH;
			executeStateAction();
		}
	});


	function onLoadPage()
	{
		executeStateAction();

		const categoryElements = $('.item.category');

		if (curState !== PageStates.FORUM)
			$(categoryElements.get(curState - 1)).addClass('checked');
	}

	function executeStateAction()
	{
		$('#message').remove();

		switch (curState)
		{

			case PageStates.FORUM:
				currentDiscussionPage = 1;
				$('#forum').on('scroll', () =>
				{
					if (processing)
						return;

					processing = true;

					infiniteScroll(getDiscussions, currentDiscussionPage, userId, retrieveDiscussions);
				});
				getDiscussions(currentDiscussionPage, userId, retrieveDiscussions);
				break;
			case PageStates.MY_DISCUSSIONS:
				$('#forum').off('scroll');
				getUserDiscussions(userId, retrieveDiscussions);
				break;
			case PageStates.BOOKMARKED_DISCUSSIONS:
				$('#forum').off('scroll');
				getAllUserBookmarks(userId, data =>
				{
					if (data.length === 0)
					{
						showMessage('Você ainda não salvou nenhuma discussão...|Não se esqueça de salvar as discussões que forem úteis para você!');

						return;
					}

					data.forEach(bookmark =>
					{
						getSpecificDiscussion(bookmark.discussionId, retrieveDiscussions);
					});
				});
				break;
			case PageStates.SEARCH:
				$('#forum').off('scroll');
				searchDiscussions($('.search input').val(), userId, data =>
				{
					if (data === null)
					{
						curState = PageStates.FORUM;
						executeStateAction();
						return;
					}

					retrieveDiscussions(data);
				});
				break;
		}
	}

	function retrieveDiscussions(discussions)
	{
		if (discussions.length === 0)
		{
			if (currentDiscussionPage === 1 || curState === PageStates.SEARCH)
				showMessage('Ainda não há discussões...|Seja o primeiro a iniciar uma discussão!');
			else if (curState === PageStates.MY_DISCUSSIONS)
				showMessage('Você ainda não iniciou uma discussão...|Crie uma agora!');
			else
			{
				$('#forum').off('scroll');
				currentDiscussionPage = -1;
			}

			processing = false;

			return;
		}

		if (curState === PageStates.FORUM)
			currentDiscussionPage++;

		discussions.forEach(discussionData =>
		{
			getUserByIdSecure(discussionData.authorId, data =>
			{
				if (data.length > 0)
				{
					const user = data[0];

					discussionData.authorName = user.name;
					discussionData.picturePath = user.picturePath;
				}

				if (curState !== PageStates.MY_DISCUSSIONS)
				{
					getBookmark(discussionData.id, userId, bookmarkData =>
					{
						createDiscussionElement(discussionData, bookmarkData).insertBefore($('.loader-container'));
					});
				}
				else
					createDiscussionElement(discussionData, null).insertBefore($('.loader-container'));
			});
		});

		processing = false;
	}

	function createDiscussionElement(discussionData, bookmarkData)
	{
		const discussion = $('<a>', { class: 'discussion', href: `discussao.html?id=${discussionData.id}` });

		discussion.append(createDiscussionBoundaries(discussionData, bookmarkData, discussion));

		return discussion;
	}

	function createDiscussionBoundaries(discussionData, bookmarkData, discussion)
	{
		const discussionBoundaries = $('<div>', { class: 'discussion-boundaries' });

		discussionBoundaries.append(createDiscussionContainer(discussionData, bookmarkData, discussion));

		return discussionBoundaries;
	}

	function createDiscussionContainer(discussionData, bookmarkData, discussion)
	{
		const discussionContainer = $('<div>', { class: 'discussion-container' });

		const userName = curState === PageStates.MY_DISCUSSIONS ? 'Você' : discussionData.authorName;
		const userContainer = createUserContainer(userName, discussionData.authorId, discussionData.picturePath);
		discussionContainer.append(userContainer);

		const contentContainer = createContentContainer(discussionData.title, discussionData.text);
		discussionContainer.append(contentContainer);

		const optionsContainer = createOptionsContainer(discussionData.commentCount, discussionData.id, bookmarkData, discussion);
		discussionContainer.append(optionsContainer);

		return discussionContainer;
	}

	function createUserContainer(userName, userId, picturePath)
	{
		const userContainer = $('<div>', { class: 'user' });
		if (picturePath)
		{
			userContainer.append($('<img>', { class: 'discussion-user-image', src: `http://localhost:3001/uploads/${picturePath}` }));
		}
		else
			userContainer.append($('<i>', { class: 'fa-solid fa-user' }));

		userContainer.append($('<a>', { text: userName, href: `perfil.html?user=${userId}` }));
		return userContainer;
	}

	function createContentContainer(title, text)
	{
		const contentContainer = $('<div>', { class: 'content' });
		contentContainer.append($('<h2>', { text: title }));
		contentContainer.append($('<p>', { text: text }));
		return contentContainer;
	}

	function createOptionsContainer(commentCount, discussionId, bookmarkData, discussion)
	{
		const optionsContainer = $('<div>', { class: 'options' });

		const editMode = curState === PageStates.MY_DISCUSSIONS;

		const options = [
			{
				iconClass: `fa-solid ${editMode ? 'fa-pen-to-square' : 'fa-bookmark'}`,
				text: editMode ? 'Editar' : bookmarkData.length > 0 ? 'Salvo' : 'Salvar',
				executeFunction: self =>
				{
					if (!editMode)
					{
						getBookmark(discussionId, userId, bookmarkData => { handleBookmark(bookmarkData, discussionId, self); });
						return;
					}

					window.location.href = `editor-de-discussao.html?id=${discussionId}`;
				}
			},
			{
				iconClass: 'fa-solid fa-comment',
				text: commentCount,
				executeFunction: () => window.location.href = `discussao.html?id=${discussionId}#my-comment`
			},
			{
				iconClass: 'fa-solid fa-share-from-square',
				text: 'Compartilhar',
				executeFunction: () => 
				{
					if (timerId)
						clearTimeout(timerId);

					navigator.clipboard.writeText(`${window.location.origin}/discussao.html?id=${discussionId}`);

					const modalEl = $('#modal-forum');

					modalEl.removeClass('hide');
					modalEl.removeClass('hidden');
					modalEl.addClass('show');

					timerId = setTimeout(() =>
					{
						modalEl.removeClass('show');
						modalEl.addClass('hide');
					}, 2000);
				}
			}
		];

		if (curState === PageStates.MY_DISCUSSIONS)
			options.push({
				iconClass: 'fa-solid fa-trash',
				text: 'Excluir',
				executeFunction: () =>
				{
					deleteDiscussion(discussionId, () =>
					{
						discussion.remove();

						if ($('.discussion').length === 0)
							showMessage('Você ainda não iniciou uma discussão...|Crie uma agora!');
					})
				}
			});

		options.forEach((option, index) =>
		{
			const optionContainer = $('<div>', { class: 'option' });
			optionContainer.append($('<i>', { class: option.iconClass }));
			optionContainer.append($('<span>', { text: option.text }));
			optionsContainer.append(optionContainer);

			if (index === 0 && !editMode && bookmarkData.length !== 0)
				optionContainer.addClass('checked');

			optionContainer.on('click', e =>
			{
				e.preventDefault();
				e.stopPropagation();

				option.executeFunction(optionContainer);
			});
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

			return
		}

		removeBookmark(bookmarkData[0].id, () =>
		{
			optionEl.removeClass('checked');
			spanEl.text('Salvar');
		});
	}

	function doSearch()
	{

	}

	function showMessage(message) 
	{
		$('#message').remove();

		const messageContainer = $('<div>', { id: 'message' });

		const messageLines = message.split('|');

		messageLines.forEach(line =>
		{
			const paragraph = $('<p>', { text: line });

			messageContainer.append(paragraph);
		});

		$('#forum-container').append(messageContainer);
	}

	function clearDiscussions()
	{
		$('.discussion').each((index, element) =>
		{
			$(element).remove();
		})
	}
});


