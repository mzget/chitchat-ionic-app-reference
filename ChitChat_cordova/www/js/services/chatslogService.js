(function () {
    'use strict';

    angular
        .module('spartan.services')
        .factory('chatslogService', chatslogService);

    chatslogService.$inject = ['$http'];

    function chatslogService($http) {
        var service = {
            getData: getData,
            init: init,
            getChatsLogCount: getChatsLogCount
        };

        return service;

        var chatsLogComponent = null;
        var dataListener = null;
        var chatlog_count = 0;

        function init() {
            dataListener = main.getDataListener();
            chatlog_count = 0;
            chatsLogComponent = new ChatsLogComponent(main, server);
            chatsLogComponent.onReady = function () {
                getUnreadMessages();

                chatsLogComponent.onReady = null;
            }
            dataListener.addRoomAccessListenerImp(chatsLogComponent);

            chatsLogComponent.onNewMessage = function (newmsg) {
                chatlog_count++;
                console.log('onNewMessage: ' + newmsg.rid);

                for (var i = 0; i < accessLength; i++) {
                    //console.log( myRoomAccess[i]['_id'] + ' / ' + newmsg.rid );
                    if (myRoomAccess[i]['_id'] == newmsg.rid) {
                        myRoomAccess[i]['body']['count']++;
                    }
                }
            }

            chatsLogComponent.onEditedGroupMember = function (newgroup) {
                console.log('onEditedGroupMember :::::::	');
                console.log(newgroup);
            }
        }

        function getUnreadMessages() {
            chatsLogComponent.getUnreadMessage(main.getDataManager().myProfile.roomAccess, function done(err, logsData) {
                if (!!logsData) {
                    logsData.map(function element(v) {
                        console.log(v);

                        var count = Number(v.count);
                        chatlog_count += count;
                    });
                }
            });
        }

        function getChatsLogCount() {
            return chatlog_count;
        }

        function getData() { }
    }
})();