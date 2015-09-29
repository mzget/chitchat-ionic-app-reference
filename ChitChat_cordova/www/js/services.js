angular.module('starter.services', [])

.factory('Chats', function() {
    // Might use a resource here that returns a JSON array

	// Some fake testing data
    var chats = chatRoomControl.chatMessages;

	return {
		all: function() {
			return chats;
		},
		remove: function(chat) {
			chats.splice(chats.indexOf(chat), 1);
		},
		get: function(chatId) {
			for (var i = 0; i < chats.length; i++) {
				if (chats[i].id === parseInt(chatId)) {
					return chats[i];
				}
			}
			return null;
		},
		set: function(json) {
			chats = json;
		}
	};
})

.factory('Messages', function() {
    // Might use a resource here that returns a JSON array

	// Some fake testing data
    var Messages;

	return {
		all: function() {
			return Messages;
		},
		remove: function(chat) {
			Messages.splice(Messages.indexOf(chat), 1);
		},
		get: function(chatId) {
			for (var i = 0; i < Messages.length; i++) {
				if (Messages[i].id === parseInt(chatId)) {
					return Messages[i];
				}
			}
			return null;
		},
		set: function(json) {
			Messages = json;
		}
	};
});