(function () {
    'use strict';

    angular
        .module('spartan.services')
        .factory('chatslogService', chatslogService);

    function chatslogService($http, $rootScope, ConvertDateTime) {
        var service = {
            getChatsLogComponent: getChatsLogComponent,
            init: init,
            getChatsLogCount: getChatsLogCount,
            decreaseLogsCount: decreaseLogsCount,
            increaseLogsCount: increaseLogsCount,
            getUnreadMessageMap: getUnreadMessageMap,
            getChatsLog : getChatsLog,
            organizeChatLogMap: organizeChatLogMap
        };

        return service;

        var chatsLogComponent = null;
        var listenerImp;
        var dataListener = null;
        var dataManager = null;
        var chatlog_count = 0;
        var unreadMessageMap = {};
        var chatslog = {};
        var isInit = false;

        function init() {
            if(!isInit) {
                isInit = true;
                
                chatslog = {};
                dataListener = main.getDataListener();
                dataManager = main.getDataManager();
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
                        console.warn("room to add: ", JSON.stringify(unreadMessageMap[newMsg.rid]));
                        var count = Number(unreadMessageMap[newMsg.rid].count);
                        count++;
                        unread.count = count;
                        unreadMessageMap[unread.rid] = unread;

                        //$rootScope.$broadcast('onUnreadMessageMapChanged', { data: unread });
                        onUnreadMessageMapChanged(unread);
           //             chatLogDAL.savePersistedUnreadMsgMap(unread);
                    }
                }
                chatsLogComponent = new ChatsLogComponent(main, server);
                chatsLogComponent.onReady = function () {
                    getUnreadMessages();
    
                    chatsLogComponent.onReady = null;
                }
                dataListener.addRoomAccessListenerImp(chatsLogComponent);
                chatsLogComponent.addOnChatListener(listenerImp);
                chatsLogComponent.updatedLastAccessTimeEvent = function (newRoomAccess) {
                    chatsLogComponent.getUnreadMessage(newRoomAccess.roomAccess[0], function(err, unread) {
                        if (!!unread) {
                            unreadMessageMap[unread.rid] = unread;

                            calculateUnreadCount();

                            //$rootScope.$broadcast('onUnreadMessageMapChanged', { data: unread });
                            onUnreadMessageMapChanged(unread);
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
                
                //$rootScope.$broadcast('getunreadmessagecomplete', {});
                getunreadmessagecomplete();
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

         function getChatsLog() {
             return chatslog;
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

                                 setLogProp(log, displayMsg, function(log) {
                                     addChatLog(log, done);
                                 });
                             });
                             break;
                         case ContentType[ContentType.Sticker]:
                             displayMsg = sender + " sent a sticker.";
                                 setLogProp(log, displayMsg, function(log) {
                                     addChatLog(log, done);
                                 });
                             break;
                         case ContentType[ContentType.Voice]:
                             displayMsg = sender + " sent a voice message.";
                                 setLogProp(log, displayMsg, function(log) {
                                     addChatLog(log, done);
                                 });
                             break;
                         case ContentType[ContentType.Image]:
                             displayMsg = sender + " sent a image.";
                                 setLogProp(log, displayMsg, function(log) {
                                     addChatLog(log, done);
                                 });
                             break;
                         case ContentType[ContentType.Video]:
                             displayMsg = sender + " sent a video.";
                                 setLogProp(log, displayMsg, function(log) {
                                     addChatLog(log, done);
                                 });
                             break;
                         case ContentType[ContentType.Location]:
                             displayMsg = sender + " sent a location.";
                                 setLogProp(log, displayMsg, function(log) {
                                     addChatLog(log, done);
                                 });
                             break;
                         default:
                             break;
                     }
                 }
             }
             else {
                log.setLastMessage("Start Chatting Now!");

                setLogProp(log, displayMsg, function(log) {
                    addChatLog(log, done);
                });
             }
         }

         function setLogProp(log, displayMessage, callback) {
             log.setLastMessage(displayMessage);

             callback(log);
         }
               
        function addChatLog(chatLog, done) {
            chatLog.time = ConvertDateTime.getTimeChatlog(chatLog.lastMessageTime);
            chatslog[chatLog.id] = chatLog;
            done();
            console.debug("addChatLog", chatLog);
        }

        function getRoomInfo() {
            console.log("my roomAccess.length", dataManager.getRoomAccess().length);

            async.mapSeries(unreadMessageMap, function iterator(item, resultCB) {
                var roomInfo = dataManager.getGroup(item.rid);
                if (!!roomInfo) {
                    organizeChatLogMap(item, roomInfo, function done() {
                        resultCB(null, {});
                    });
                }
                else {
                    console.warn("Can't find roomInfo from persisted data: ", item.rid);

                    server.getRoomInfo(item.rid, function (err, res) {
                        if (res['code'] === HttpStatusCode.success) {
                            var roomInfo = JSON.parse(JSON.stringify(res.data));
                            if (roomInfo.type === RoomType.privateChat) {
                                var targetMemberId = "";
                                roomInfo.members.some(function itorator(item) {
                                    if (item.id !== dataManager.myProfile._id) {
                                        targetMemberId = item.id;
                                        return item.id;
                                    }
                                });

                                var contactProfile = dataManager.getContactProfile(targetMemberId);
                                if (contactProfile == null) {
                                    roomInfo.name = "EMPTY ROOM";
                                }
                                else {
                                    roomInfo.name = contactProfile.displayname;
                                    roomInfo.image = contactProfile.image;
                                }
                            }
                            else {
                                console.warn("OMG: the god only know. May be group status is not active.");
                            }

                            dataManager.addGroup(roomInfo);

                            organizeChatLogMap(item, roomInfo, function done() {
                                resultCB(null, {});
                            });
                        }
                        else {
                            console.warn("Fail to get room info of room %s", item.rid, res.message);
                            resultCB(null, {});
                        }
                    });
                }
            }, function done(err, results) {
                console.debug("getRoomInfo Completed.");
            });
        }

        function onUnreadMessageMapChanged(unread) {
            var roomInfo = dataManager.getGroup(unread.rid);
            organizeChatLogMap(unread, roomInfo, function () { });
        }

        function getunreadmessagecomplete() {
            getRoomInfo();
        }
    }
})();