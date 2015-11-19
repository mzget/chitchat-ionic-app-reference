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
            getLastMessageMap: getLastMessageMap
        };

        return service;

        var chatsLogComponent = null;
        var listenerImp;
        var dataListener = null;
        var chatlog_count = 0;
        var newMessageMap = {};
        var isInit = false;

        function init() {
            if(!isInit) {
                isInit = true;
                
                dataListener = main.getDataListener();
                chatlog_count = 0;
                listenerImp = function(newMsg) {
                    chatlog_count++;
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
                        if(!!unread) {
                            newMessageMap[unread.rid] = unread;
                            
                            calculateUnreadCount();
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
            newMessageMap = {};
            chatlog_count = 0;
            chatsLogComponent.getUnreadMessages(main.getDataManager().myProfile.roomAccess, function done(err, logsData) {
                if (!!logsData) {
                    logsData.map(function element(v) {
                        newMessageMap[v.rid] = v;

                        var count = Number(v.count);
                        chatlog_count += count;

                        console.log(v);
                    });
                }
            });
        }
        
        function calculateUnreadCount() {
            chatlog_count = 0;
            for (var key in newMessageMap) {
                if (newMessageMap.hasOwnProperty(key)) {
                    var count = newMessageMap[key].count;
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
         
         function getLastMessageMap() {
             return newMessageMap;
         }
    }
})();