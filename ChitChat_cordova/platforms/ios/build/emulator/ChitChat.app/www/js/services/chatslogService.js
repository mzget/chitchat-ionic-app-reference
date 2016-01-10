(function () {
    'use strict';

    angular
        .module('spartan.services')
        .factory('chatslogService', chatslogService);

    function chatslogService($http, $rootScope) {
        var service = {
            getChatsLogComponent: getChatsLogComponent,
            init: init,
            getChatsLogCount: getChatsLogCount,
            decreaseLogsCount: decreaseLogsCount,
            increaseLogsCount: increaseLogsCount,
            getUnreadMessageMap: getUnreadMessageMap,
            organizeChatLogMap: organizeChatLogMap
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
                listenerImp = function (newMsg) {
                    if (!main.getDataManager().isMySelf(newMsg.sender)) {
                        chatlog_count++;
                        if (ionic.Platform.platform() === "ios") {
                            cordova.plugins.notification.badge.increase();
                        }
                        var unread = {};
                        unread.message = newMsg;
                        unread.rid = newMsg.rid;
                        console.warn("room to add: ", unreadMessageMap[newMsg.rid]);
                        var count = Number(unreadMessageMap[newMsg.rid].count);
                        count++;
                        unread.count = count;
                        unreadMessageMap[unread.rid] = unread;

                        $rootScope.$broadcast('onUnreadMessageMapChanged', { data: unread });

           //             chatLogDAL.savePersistedUnreadMsgMap(unread);
                    }
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
                            unreadMessageMap[unread.rid] = unread;

                            calculateUnreadCount();

                            $rootScope.$broadcast('onUnreadMessageMapChanged', { data: unread });

                            //chatLogDAL.savePersistedUnreadMsgMap(unread);
                        }
                    });
                }
                chatsLogComponent.addNewRoomAccessEvent = function (data) {
                    getUnreadMessages();
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
            chatsLogComponent.getUnreadMessages(main.getDataManager().myProfile.roomAccess, function done(err, unreadLogs) {
                if (!!unreadLogs) {
                    unreadLogs.map(function element(unread) {
                        unreadMessageMap[unread.rid] = unread;
                       
                        console.log("unread:", JSON.stringify(unread));
                    });

                    calculateUnreadCount();
                }
                
                $rootScope.$broadcast('getunreadmessagecomplete', {});
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
         
         function organizeChatLogMap(unread, roomInfo, done) {
             var log = new ChatLog(roomInfo);
             log.setNotiCount(unread.count);

             if (!!unread.message) {
                 log.setLastMessageTime(unread.message.createTime);

                 var contact = main.getDataManager().getContactProfile(unread.message.sender);
                 var sender = (contact != null) ? contact.displayname : "";
                 if (unread.message.body != null) {
                     var displayMsg = unread.message.body;
                     switch (unread.message.type) {
                         case ContentType[ContentType.Text]:
                             main.decodeService(displayMsg, function (err, res) {
                                 if (!err) {
                                     displayMsg = res;
                                 } else { console.warn(err, res); }

                                 setLogProp(log, displayMsg, done);
                             });
                             break;
                         case ContentType[ContentType.Sticker]:
                             displayMsg = sender + " sent a sticker.";
                             setLogProp(log, displayMsg, done);
                             break;
                         case ContentType[ContentType.Voice]:
                             displayMsg = sender + " sent a voice message.";
                             setLogProp(log, displayMsg, done);
                             break;
                         case ContentType[ContentType.Image]:
                             displayMsg = sender + " sent a image.";
                             setLogProp(log, displayMsg, done);
                             break;
                         case ContentType[ContentType.Video]:
                             displayMsg = sender + " sent a video.";
                             setLogProp(log, displayMsg, done);
                             break;
                         case ContentType[ContentType.Location]:
                             displayMsg = sender + " sent a location.";
                             setLogProp(log, displayMsg, done);
                             break;
                         default:
                             break;
                     }
                 }
             }
             else {
                 log.setLastMessage("Start Chatting Now!");

                 done(log);
             }
         }

         function setLogProp(log, displayMessage, callback) {
             log.setLastMessage(displayMessage);

             callback(log);
         }
    }
})();