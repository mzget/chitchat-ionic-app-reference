(function () {
    'use strict';

    angular
        .module('app')
        .factory('webRTCFactory', webRTCFactory);

    webRTCFactory.$inject = ['$http'];

    function webRTCFactory($http) {
        var service = {
            initContactModal: initContactModal
        };

        return service;

        function initContactModal($scope, contactId, roomSelected, done) {
            var contact = main.getDataManager().orgMembers[contactId];
            console.debug(contact);
            $scope.contact = contact;

            server.getPrivateChatRoomId(dataManager.myProfile._id, contactId, function result(err, res) {
                console.log(JSON.stringify(res));
                var room = JSON.parse(JSON.stringify(res.data));

                $scope.chat = function () {
                    roomSelected.setRoom(room);
                    location.href = '#/tab/group/chat/' + room._id;
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