(function () {
    'use strict';

    angular
        .module('spartan.services')
        .factory('modalFactory', modalFactory);

    // modalFactory.$inject = ['$http', 'webRTCFactory'];

    function modalFactory($http, $state, webRTCFactory) {
        var service = {
            initContactModal: initContactModal
        };

        return service;

        function initContactModal($scope, contactId, roomSelected, done) {
            var contact = main.getDataManager().orgMembers[contactId];
            $scope.contact = contact;

            server.getPrivateChatRoomId(dataManager.myProfile._id, contactId, function result(err, res) {
                console.log('getPrivateChatRoomId', JSON.stringify(res))
                var room = JSON.parse(JSON.stringify(res.data));

                $scope.chat = function () {
                    roomSelected.setRoom(room);
                    if($state.current.name === NGStateUtil.tab_chats_chat_members) {
                        // location.href = '#/tab/group/chat/' + room._id;
                        $state.go(NGStateUtil.tab_chats_chat);
                    }
                    else if ($state.current.name === 'tab.group' || $state.current.name === 'tab.group-members') {
                        $state.go('tab.group-chat');
                    }
                };

                $scope.freecall = function () {
                    roomSelected.setRoom(room);

                    webRTCFactory.call(contactId);
                };

                $scope.openViewContactProfile = function (id) {
                    location.href = '#/tab/group/member/' + id;
                    //$state.go("tab.group-members", { chatId: id}, { inherit: false });
                }

                $scope.$apply();
            });

            done();
        }
    }
})();