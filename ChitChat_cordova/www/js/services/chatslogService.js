(function () {
    'use strict';

    angular
        .module('spartan.services')
        .factory('chatslogService', chatslogService);

    chatslogService.$inject = ['$http'];

    function chatslogService($http) {
        var service = {
            getChatsLogComponent: getChatsLogComponent,
            init: init,
            getChatsLogCount: getChatsLogCount,
            decreaseLogsCount: decreaseLogsCount,
            increaseLogsCount: increaseLogsCount,
            getUnreadMessageMap: getUnreadMessageMap,
            organizeUnreadMessageMapForDisplayInfo: organizeUnreadMessageMapForDisplayInfo
        };

        return service;

        var chatsLogComponent = null;
        var listenerImp;
        var dataListener = null;
        var chatlog_count = 0;
        var unreadMessageMap = {};
        var isInit = false;

        function init() {
            if(!isInit) {
                isInit = true;
                
                dataListener = main.getDataListener();
                chatlog_count = 0;
                listenerImp = function(newMsg) {
                    chatlog_count++;
                    
                    console.warn("chatlogService: ", JSON.stringify(newMsg));
                }
                chatsLogComponent = new ChatsLogComponent(main, server);
                chatsLogComponent.onReady = function () {
                    getUnreadMessages();
    
                    chatsLogComponent.onReady = null;
                }
                dataListener.addRoomAccessListenerImp(chatsLogComponent);
                chatsLogComponent.addNewMsgListener(listenerImp);
                chatsLogComponent.updatedLastAccessTimeEvent = function (newRoomAccess) {
                    chatsLogComponent.getUnreadMessage(newRoomAccess.roomAccess[0], function(err, unread) {
                        if (!!unread) {
                            organizeUnreadMessageMapForDisplayInfo(unread, function done() {
                                calculateUnreadCount();
                            });
                        }
                    });
                }
    
                chatsLogComponent.onEditedGroupMember = function (newgroup) {
                    console.log('onEditedGroupMember :::::::	');
                    console.log(newgroup);
                }
                
                server.getLastAccessRoomsInfo(function (err, res) {
                    console.log("getLastAccessRoomsInfo:", JSON.stringify(res));
                });
            }
        }

        function getUnreadMessages() {
            unreadMessageMap = {};
            chatlog_count = 0;
            chatsLogComponent.getUnreadMessages(main.getDataManager().myProfile.roomAccess, function done(err, unreadLogs) {
                if (!!unreadLogs) {
                    unreadLogs.map(function element(unread) {
                        if(!!unread.message) {
                           organizeUnreadMessageMapForDisplayInfo(unread, null);
                        }

                        var count = Number(unread.count);
                        chatlog_count += count;

                        console.log(unread);
                    });
                }
            });
        }
        
        function calculateUnreadCount() {
            chatlog_count = 0;
            for (var key in unreadMessageMap) {
                if (unreadMessageMap.hasOwnProperty(key)) {
                    var count = unreadMessageMap[key].count;
                    chatlog_count += count;
                }
            }
        }

        function getChatsLogCount() {
            return chatlog_count;
        }
        
        function decreaseLogsCount(count) {
            chatlog_count -= count;
        }

        function increaseLogsCount(count) {
            chatlog_count += count;
        }
       
        function getChatsLogComponent() {
            return chatsLogComponent;
         }
         
         function getUnreadMessageMap() {
             return unreadMessageMap;
         }
         
         function organizeUnreadMessageMapForDisplayInfo(unread, done) { 
            var contact = main.getDataManager().getContactProfile(unread.message.sender);
            switch (unread.message.type) {
                case ContentType[ContentType.Text]:  
                    main.decodeService(unread.message.body, function (err, res) {
                        if (!err) {
                            unread.message.body = res;
                        }
                        else {
                            console.log(err, res);
                        }
                    });
                    break;
                case ContentType[ContentType.Sticker]:
                    var message = contact.displayname + " sent a sticker.";
                    unread.message.body = message;
                    break;
                case ContentType[ContentType.Voice]:
                    var message = contact.displayname + " sent a voice message.";
                    unread.message.body = message;
                    break;
                case ContentType[ContentType.Image]:
                    var message = contact.displayname + " sent a image.";
                    unread.message.body = message;
                    break;
                case ContentType[ContentType.Video]:
                    var message = contact.displayname + " sent a video."
                    unread.message.body = message;
                    break;
                case ContentType[ContentType.Location]:
                    var message = contact.displayname + " sent a location.";
                    unread.message.body = message;
                    break;
                default:
                    break;
            }
            
            unreadMessageMap[unread.rid] = unread;
            if(!!done) done();
         }
    }
})();