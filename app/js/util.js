'use strict';
const path = require('path');
const shell = require('shell');

/*
TODO add returning of multiple names, not just the first match
 */
function autocomplete(str, names, callback) {
	let users = Object.keys(names);

	for (let key in users) {
		let user = users[key];
		user = user.split(':')[0];

		//Check if str is the start of user
		if (user.indexOf(str) === 0) {
			callback(user);
		}
	}
}

function fillUsermenu(usersObj) {
	$('usermenu users').empty();

	let users = Object.keys(usersObj[0]);

	for (let key in users) {
		let user = users[key];
		user = user.split(':')[0];

		$('usermenu users').append('<user>' + user + '</user>');
	}

	$('usermenu').attr('data-before', users.length);
}

/**
 * Use native notification-system libnotify. Works on most Mac and
 * most Linux-Systems, no support for windows
 */
function doNotify(title, body) {
	let options = {
		title: title,
		body: body,
		icon: path.join(__dirname, '../images/icon.png')
	};

	new Notification(options.title, options);
}

/**
 * Escapes all potentially dangerous characters, so that the
 * resulting string can be safely inserted into attribute or
 * element text.
 * @param value
 * @returns {string} escaped text
 */
function encodeEntities(value) {
	let surrogate_pair_regexp = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
	// Match everything outside of normal chars and " (quote character)
	let non_alphanumeric_regexp = /([^\#-~| |!])/g;

	return value.
	replace(/&/g, '&amp;').
	replace(surrogate_pair_regexp, function (value) {
		let hi = value.charCodeAt(0);
		let low = value.charCodeAt(1);
		return '&#' + (((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000) + ';';
	}).
	replace(non_alphanumeric_regexp, function (value) {
		return '&#' + value.charCodeAt(0) + ';';
	}).
	replace(/</g, '&lt;').
	replace(/>/g, '&gt;');
}

function stringToColour(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var colour = '#';

    for (let i = 0; i < 3; i++) {
        let value = (hash >> (i * 8)) & 0xFF;
        colour += ('00' + value.toString(16)).substr(-2);
    }
    return colour;
}

/*
Updates the scroll state to the last appended line
 */
function updateScrollState() {
	//Scroll to last appended message
	$("#messageArea").animate({
		scrollTop: $("#messageArea")[0].scrollHeight
	}, 0);
}

/*
This uses a permissive regex to find urls in a string
 */
function findLinks(str) {
	let pattern = /\b(?:[a-z]{2,}?:\/\/)?[^\s/]+\.\w{2,}(?::\d{1,5})?(?:\/[^\s]*\b|\b)(?![:.?#]\S)/gi;

	return str.match(pattern);
}

/**
 * Returns true if the last nicks up until the last different nick
 * are unique. This is used to remove the nickname when possible, for example
 * when one user sends multiple messages
 */
function lastNicksUnique(nextNick, $channel) {
	let unique = true;
	let iteratedNicks = [];

	//Get last nicks of provided channel
	let lastNicks = $channel.find('line nick');

	//Iterate over nicks in reverse, break if nextNick is not empty,
	//add all nicks to a list
	$(lastNicks).reverse().each(function () {
		iteratedNicks.push($(this).text());
		if ($(this).text() !== '') {
			return false;
		}
	})

	//Iterate over all nicks, return true when nick is not nextNick,
	//return false, when nick is empty or nextNick
	for (let key in iteratedNicks) {
		let nick = iteratedNicks[key];
		if (nick != nextNick) {
			unique = true;
		} else if (nick === '' || nick == nextNick) {
			unique = false;

			//Break loop since nick can't be unique anymore
			break;
		}
	}

	return unique;
}

function openLink(string) {
	//Check if "http://" is there and add it if necessary
	if (string.match(/^[^/]+:\/\//)) {
		shell.openExternal(string);
	} else {
		shell.openExternal('http://' + string);
	}
}

module.exports = {
    autocomplete: autocomplete,
    fillUsermenu: fillUsermenu,
	doNotify: doNotify,
	encodeEntities: encodeEntities,
	stringToColour: stringToColour,
	lastNicksUnique: lastNicksUnique,
	findLinks: findLinks,
	updateScrollState: updateScrollState,
	openLink: openLink
}
