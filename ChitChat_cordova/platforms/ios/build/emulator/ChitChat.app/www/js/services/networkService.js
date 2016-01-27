(function () {
    'use strict';

    angular
        .module('spartan.services')
        .factory('networkService', networkService);

    networkService.$inject = ['$http', '$state', "localNotifyService"];

    function networkService($http, $state, localNotifyService) {
        var service = {
            regisSocketListener: regisSocketListener
        };

        return service;

        function regisSocketListener() {
            console.log("regis socket event.");
            var socket = new SocketComponent();
            server.setSocketComponent(socket);
            socket.onDisconnect =  function onDisconnect(reason) {
                localNotifyService.makeToast("disconnected.");
                $state.go("tab.login");
            }
        }
    }
})();