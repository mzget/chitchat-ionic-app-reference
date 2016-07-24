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
            getChatsLog: getChatsLog
        };

        var chatsLogComponent = null;
        var listenerImp;
        var dataListener = null;
        var dataManager = null;
        var chatlog_count = 0;
        var unreadMessageMap = {};
        var isInit = false;
        
        return service;

        function init() {
            if (!isInit) {
                isInit = true;
                
                dataListener = main.getDataListener();
                dataManager = main.getDataManager();
                chatlog_count = 0;
                listenerImp = function (newMsg) {
                    if (!main.getDataManager().isMySelf(newMsg.sender)) {
                        chatlog_count++;
                        if (ionic.Platform.platform() === "ios") {
                            try {
                                cordova.plugins.notification.badge.increase();
                            }
                            catch (ex) {
                                console.warn(ex);
                            }
                        }
                        var unread = {};
                        unread.message = newMsg;
                        unread.rid = newMsg.rid;
                        console.warn("room to add: ", JSON.stringify(unreadMessageMap[newMsg.rid]));
                        var count = (!!unreadMessageMap[newMsg.rid]) ? Number(unreadMessageMap[newMsg.rid].count): 0;
                        count++;
                        unread.count = count;
                        unreadMessageMap[unread.rid] = unread;

                        onUnreadMessageMapChanged(unread);
                        //             chatLogDAL.savePersistedUnreadMsgMap(unread);
                    }
                }
                chatsLogComponent = new ChatsLogComponent(main, server, ConvertDateTime);
                chatsLogComponent.onReady = function () {
                    getUnreadMessages();

                    chatsLogComponent.onReady = null;
                }
                dataListener.addRoomAccessListenerImp(chatsLogComponent);
                chatsLogComponent.addOnChatListener(listenerImp);
                chatsLogComponent.updatedLastAccessTimeEvent = function (newRoomAccess) {
                    chatsLogComponent.getUnreadMessage(newRoomAccess.roomAccess[0], function (err, unread) {
                        if (!!unread) {
                            unreadMessageMap[unread.rid] = unread;

                            calculateUnreadCount();

                            onUnreadMessageMapChanged(unread);
                            //chatLogDAL.savePersistedUnreadMsgMap(unread);
                        }
                    });
                }
                chatsLogComponent.addNewRoomAccessEvent = function (data) {
                    getUnreadMessages();
                }

                chatsLogComponent.onEditedGroupMember = function (newgroup) {
                    console.log('onEditedGroupMember: ', JSON.stringify(newgroup));
                    $rootScope.$broadcast('onEditedGroupMember',[]);
                }

                server.getLastAccessRoomsInfo("", function (err, res) {
                    console.log("getLastAccessRoomsInfo:", JSON.stringify(res));
                });
            }
        }

        function getUnreadMessages() {
            unreadMessageMap = {};
            chatsLogComponent.getUnreadMessages(dataManager.myProfile.roomAccess, function done(err, unreadLogs) {
                if (!!unreadLogs) {
                    unreadLogs.map(function element(unread) {
                        unreadMessageMap[unread.rid] = unread;

                      //  console.log("unread:", JSON.stringify(unread));
                    });

                    calculateUnreadCount();
                }

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
            return chatsLogComponent.getChatsLog();
        }

        function onUnreadMessageMapChanged(unread) {
            console.log('UnreadMessageMapChanged: ', JSON.stringify(unread));
            let promise = chatsLogComponent.checkRoomInfo(unread);
            promise.then(function() {
                $rootScope.$broadcast('onUnreadMessageMapChanged', { data: unread });
            }).catch(function() {
                console.error("Cannot get roomInfo of ", unread.rid);
            });
        }

        function getunreadmessagecomplete() {
            $rootScope.$broadcast('getunreadmessagecomplete', {});
            chatsLogComponent.getRoomsInfo(unreadMessageMap);
        }
    }
})();