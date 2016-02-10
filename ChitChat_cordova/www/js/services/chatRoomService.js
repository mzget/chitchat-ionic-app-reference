(function () {
    'use strict';

    angular
        .module('spartan.services')
        .factory('chatRoomService', chatRoomService);

    //    chatRoomService.$inject = ['$http'];

    function chatRoomService($http, $rootScope, $sce, $cordovaFile, 
    roomSelected, ConvertDateTime, sharedObjectService, localNotifyService, dbAccessService) {
        var service = {
            init: init,
            getPersistendMessage: getPersistendMessage,
            getNewerMessageFromNet: getNewerMessageFromNet,
            isPrivateChatRoom: isPrivateChatRoom,
            roomContactIsEmpty: roomContactIsEmpty,
            all: function () {
                return chats;
            },
            remove: function (chat) {
                chats.splice(chats.indexOf(chat), 1);
            },
            get: function (chatId) {
                for (var i = 0; i < chats.length; i++) {
                    if (chats[i]._id === chatId) {
                        return chats[i];
                    }
                }
                return null;
            },
            set: function (json) {
                chats = json;

                if (rid != roomSelected.getRoom()._id) {
                    rid = roomSelected.getRoom()._id;
                    date = [];
                }

                for (var i = 0; i < chats.length; i++) {
                    if (!chats[i].hasOwnProperty('_id')) { continue; }
                    chats[i].time = ConvertDateTime.getTime(chats[i].createTime);
                    var dateTime = chats[i].createTime.substr(0, chats[i].createTime.lastIndexOf('T'));
                    if (date.indexOf(dateTime) == -1) {
                        date.push(chats[i].createTime.substr(0, chats[i].createTime.lastIndexOf('T')));

                        var dateMsg = new Date(dateTime);
                        var dateNow = new Date();

                        if (dateMsg.getFullYear() == dateNow.getFullYear() &&
                         dateMsg.getMonth() == dateNow.getMonth() &&
                         dateMsg.getDate() == dateNow.getDate()) {
                            chats[i].firstMsg = "Today";
                        }
                        else if (dateMsg.getFullYear() == dateNow.getFullYear() &&
                         dateMsg.getMonth() == dateNow.getMonth() &&
                         dateMsg.getDate() == dateNow.getDate() - 1) {
                            chats[i].firstMsg = "Yesterday";
                        }
                        else {
                            chats[i].firstMsg = days[dateMsg.getDay()] + ', ' + (dateMsg.getMonth() + 1) + '/' + dateMsg.getFullYear();
                        }


                    }
                    if (chats[i].type == ContentType[ContentType.Video]) {
                        if (chats[i].temp == 'true') {
                            chats[i].body = cordova.file.documentsDirectory + chats[i]._id;
                        }
                        else {
                            chats[i].bodyUrl = $sce.trustAsResourceUrl($rootScope.webServer + chats[i].body);
                            var chatBody = chats[i].body;
                            var splitChat = chatBody.split(".");
                            var nameThumbnail = splitChat[0] + '.png';
                            chats[i].thumbnail = $sce.trustAsResourceUrl($rootScope.webServer + nameThumbnail);
                        }
                    }
                    else if (chats[i].type === ContentType[ContentType.Location]) {
                        var location = JSON.parse(chats[i].body);

                        chats[i].locationName = location.name;
                        chats[i].locationAddress = location.address;
                        chats[i].lat = location.latitude;
                        chats[i].long = location.longitude;
                    }
                }
            },
            getChatRoomComponent: getChatRoomComponent,
            leaveRoom: leaveRoom
        };

        var chats = [];
        var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        var date = [];
        var rid;
        var chatRoomComponent;

        return service;

        function init() {
            var curRoom = roomSelected.getRoom();
            var chatRoomApi = main.getChatRoomApi();
            chatRoomComponent = new ChatRoomComponent(main, curRoom._id, dbAccessService.getMessageDAL());

            sharedObjectService.getDataListener().addChatListenerImp(chatRoomComponent);
            sharedObjectService.unsubscribeGlobalNotifyMessageEvent();

            chatRoomComponent.serviceListener = function (event, newMsg) {
                if (event === "onChat") {
					service.set(chatRoomComponent.chatMessages);

                    if (newMsg.sender !== main.dataManager.myProfile._id) {
                        chatRoomApi.updateMessageReader(newMsg._id, curRoom._id);
                    }

                    $rootScope.$broadcast('onNewMessage', { data: null });
                }
                else if (event === "onMessageRead") {
					service.set(chatRoomComponent.chatMessages);
                }
            }
            chatRoomComponent.notifyEvent = function (event, data) {
                if (event === ChatServer.ServerEventListener.ON_CHAT) {
                    if (ionic.Platform.platform() === "ios") {
                        var appBackground = cordova.plugins.backgroundMode.isActive();
                        sharedObjectService.getNotifyManager().notify(data, appBackground, localNotifyService);
                    }
                    else {
                        sharedObjectService.getNotifyManager().notify(data, appBackground, localNotifyService);
                    }
                }
            };
        }

        function getPersistendMessage() {
            var curRoom = roomSelected.getRoom();
            chatRoomComponent.getPersistentMessage(curRoom._id, function (err, messages) {
                console.log("getPersistendMessage: completed.", chatRoomComponent.chatMessages.length);

				service.set(chatRoomComponent.chatMessages);

                $rootScope.$broadcast('onMessagesReady', { data: null });

                getNewerMessageFromNet();
            });
        }

        function getNewerMessageFromNet() {
            chatRoomComponent.getNewerMessageRecord(function done(err, result) {
                $rootScope.$broadcast('onJoinRoomReady', { data: null });
            });
        }

        function clear() {
            chats = [];
        }

        function leaveRoom() {
            var curRoom = roomSelected.getRoom();
            chatRoomComponent.leaveRoom(curRoom._id, function callback(err, res) {
            	roomSelected.setRoom(null);
            	chatRoomComponent.chatMessages = [];
            	clear();

            	sharedObjectService.getDataListener().removeChatListenerImp(chatRoomComponent);
            	sharedObjectService.regisNotifyNewMessageEvent();
            });
        }

        function getChatRoomComponent() {
            return chatRoomComponent;
        }

        function isPrivateChatRoom() {
            var curRoom = roomSelected.getRoomOrLastRoom();
            if (curRoom.type === RoomType.privateChat) {
                return true;
            }
            else {
                return false;
            }
        }

        function roomContactIsEmpty(callback) {
            var curRoom = roomSelected.getRoom();
            if (curRoom.type === RoomType.privateChat) {
                for (var i = 0; i < curRoom.members.length; i++) {
                    if (curRoom.members[i].id != dataManager.myProfile._id) {
                        chatRoomComponent.getMemberProfile(curRoom.members[i], function done(err, res) {
                            console.warn("getMemberProfile", err, res);
                            if (res.code === HttpStatusCode.fail) {
                                callback(true);
                                return;
                            }
                        });
                    }
                }

                callback(false);
                return;
            } 
            else {
                callback(false);
                return;
            }
        }
    }
})();