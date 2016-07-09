(function () {
    'use strict';

    angular
        .module('spartan.services')
        .factory('chatRoomService', chatRoomService);

    function chatRoomService($http, $rootScope, $sce, $cordovaFile, roomSelected, ConvertDateTime, sharedObjectService, localNotifyService, dbAccessService) {
        var service = {
            init: init,
            getPersistendMessage: getPersistendMessage,
            getNewerMessageFromNet: getNewerMessageFromNet,
            getOlderMessageChunk: getOlderMessageChunk,
            isPrivateChatRoom: isPrivateChatRoom,
            roomContactIsEmpty: roomContactIsEmpty,
            updateReadMessages: updateReadMessages,
            updateWhoReadMyMessages: updateWhoReadMyMessages,
            all: all,
            remove: remove,
            get: get,
            set: set,
            getChatRoomComponent: getChatRoomComponent,
            leaveRoom: leaveRoom,
            leaveRoomCB: leaveRoomCB,
            sendMessage: sendMessage,
            sendFile: sendFile
        };

        var chats = [];
        var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        var date = [];
        var rid;
        var chatRoomComponent;

        return service;

        function init() {
            console.log('chatRoomService.init()');

            var curRoom = roomSelected.getRoom();
            var chatRoomApi = main.getChatRoomApi();
            chatRoomComponent = new ChatRoomComponent(main, curRoom._id, dbAccessService.getMessageDAL());

            sharedObjectService.getDataListener().addChatListenerImp(chatRoomComponent);
            sharedObjectService.unsubscribeGlobalNotifyMessageEvent();

            chatRoomComponent.serviceListener = function (event, newMsg) {
                if (event === ChatServer.ServerEventListener.ON_CHAT) {
                    service.set(chatRoomComponent.chatMessages);

                    //@ Tell message doccument who read this message_id.
                    // - Message displaying in chat room.
                    // - Chatroom is not run in background.


                    //@ When message_sender is not me.
                    if (!main.getDataManager().isMySelf(newMsg.sender)) {
                        //@ Check app not run in background.
                        if ($rootScope.isMobile) {
                            try {
                                var appBackground = cordova.plugins.backgroundMode.isActive();
                                if (!appBackground) {
                                    chatRoomApi.updateMessageReader(newMsg._id, curRoom._id);
                                }
                                else {
                                    sharedObjectService.getNotifyManager().notify(newMsg, appBackground, localNotifyService);
                                }
                            }
                            catch (ex) {
                                console.warn(ex);
                            }
                        }
                        else {
                            if ($rootScope.isPageFocus) {
                                chatRoomApi.updateMessageReader(newMsg._id, curRoom._id);
                            } 
                            else {
                                sharedObjectService.getNotifyManager().notify(newMsg, appBackground, localNotifyService);
                            }
                        }
                    }

                    $rootScope.$broadcast('onNewMessage', { data: null });
                }
                else if (event === ChatServer.ServerEventListener.ON_MESSAGE_READ) {
                    service.set(chatRoomComponent.chatMessages);
                }
            }

            chatRoomComponent.notifyEvent = function (event, data) {
                if (event === ChatServer.ServerEventListener.ON_CHAT) {
                    if ($rootScope.isMobile) {
                        try {
                            var appBackground = cordova.plugins.backgroundMode.isActive();
                            sharedObjectService.getNotifyManager().notify(data, appBackground, localNotifyService);
                        }
                        catch (ex) {
                            console.warn(ex);
                        }
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
                console.log("getPersistendMessage of room %s: completed.", curRoom.name, chatRoomComponent.chatMessages.length);

                set(chatRoomComponent.chatMessages);

                $rootScope.$broadcast('onMessagesReady', { data: null });

                getNewerMessageFromNet();
                checkOlderMessages();
            });
        }

        function getNewerMessageFromNet() {
            chatRoomComponent.getNewerMessageRecord(function done(err, result) {
                set(chatRoomComponent.chatMessages);

                $rootScope.$broadcast('onJoinRoomReady', { data: null });
            });
        }

        function getOlderMessageChunk() {
            chatRoomComponent.getOlderMessageChunk(function done(err, res) {
                console.info('olderMessages %s => %s', res.length, chatRoomComponent.chatMessages.length);

                set(chatRoomComponent.chatMessages);
                $rootScope.$broadcast('onMessageChanged');


                //@ check older message again.
                checkOlderMessages();
            });
        }

        function checkOlderMessages() {
            chatRoomComponent.checkOlderMessages(function done(err, res) {
                if (!err) {
                    if (res.data > 0) {
                        console.info('has olderMessage => ', res.data);
                        $rootScope.$broadcast('onOlderMessageReady', true);

                        return;
                    }
                }

                setTimeout(function handler() {
                    $rootScope.$broadcast('onOlderMessageReady', false);
                }, 1000);
            });
        }

        function updateReadMessages() {
            chatRoomComponent.updateReadMessages();
        }

        function updateWhoReadMyMessages() {
            chatRoomComponent.updateWhoReadMyMessages();
        }

        function clear() {
            chats = [];
        }
        function all() {
            return chats;
        }
        function get(chatId) {
            for (var i = 0; i < chats.length; i++) {
                if (chats[i]._id === chatId) {
                    return chats[i];
                }
            }
            return null;
        }
        function set(json) {
            chats = json;

            if (rid != roomSelected.getRoom()._id) {
                rid = roomSelected.getRoom()._id;
                date = [];
            }

            for (var i = 0; i < chats.length; i++) {

                if (chats[i].hasOwnProperty('createTime')) {
                    var dateTime = chats[i].createTime.substr(0, chats[i].createTime.lastIndexOf('T'));
                    chats[i].time = ConvertDateTime.getTime(chats[i].createTime);
                }


                if (date.indexOf(dateTime) == -1 && chats[i].hasOwnProperty('createTime')) {
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

                else if (chats[i].type == ContentType[ContentType.File]) {
                    if (ionic.Platform.platform() !== "ios") {
                        var meta = jQuery.parseJSON(chats[i].meta);
                        chats[i].name = meta.name;
                        chats[i].url = $rootScope.webServer + chats[i].body;
                    }
                }
            }
        }
        function remove(chat) {
            chats.splice(chats.indexOf(chat), 1);
        }

        function leaveRoom() {
            var curRoom = roomSelected.getRoom();
            chatRoomComponent.leaveRoom(curRoom._id, function callback(err, res) {
                chatRoomComponent.chatMessages = [];
                clear();

                sharedObjectService.getDataListener().removeChatListenerImp(chatRoomComponent);
                sharedObjectService.regisNotifyNewMessageEvent();
            });
        }

        function leaveRoomCB(cb) {
            var curRoom = roomSelected.getRoom();
            chatRoomComponent.leaveRoom(curRoom._id, function callback(err, res) {
                roomSelected.setRoom(null);
                chatRoomComponent.chatMessages = [];
                clear();
                sharedObjectService.getDataListener().removeChatListenerImp(chatRoomComponent);
                sharedObjectService.regisNotifyNewMessageEvent();
                cb();
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
                            console.debug("getMemberProfile", err, res);
                            if (res.code === HttpStatusCode.fail) {
                                callback(true);
                                return;
                            }
                            else {
                                if (res.data.length == 0) {
                                    callback(true);
                                    return;
                                }
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

        function sendMessage(room_id, target, user_id, body, contentType, callback) {
            var chatRoomApi = main.getChatRoomApi();
            chatRoomApi.chat(room_id, target, user_id, body, contentType, callback);
        }
        function sendFile(room_id, target, user_id, fileUrl, contentType, meta, callback) {
            var chatRoomApi = main.getChatRoomApi();
            chatRoomApi.chatFile(room_id, target, user_id, fileUrl, contentType, meta);
        }
    }
})();