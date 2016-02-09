(function () {
    'use strict';

    angular
        .module('spartan.services')
        .factory('modalFactory', modalFactory);

    modalFactory.$inject = ['$http', 'webRTCFactory'];

    function modalFactory($http, webRTCFactory) {
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
                    //roomSelected.setRoom(room);
                    //location.href = '#/tab/group/chat/' + room._id;
                    console.log("ROOM",room);
                    $scope.$broadcast('changeChat', room);
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