(function () {
    'use strict';

    angular
        .module('spartan.services')
        .factory('networkService', networkService);

    networkService.$inject = ['$http'];

    function networkService($http) {
        var service = {
            getData: getData,
            regisSocketListener: regisSocketListener
        };

        return service;

        function getData() { }

        function regisSocketListener() {
            var socket = new SocketComponent();
            server.setSocketComponent(socket);
            socket.onDisconnect =  function onDisconnect(reason) {
                console.warn("onDisconnect", reason);
            }
        }
    }
})();