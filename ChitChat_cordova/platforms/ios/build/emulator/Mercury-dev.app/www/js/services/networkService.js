(function () {
    'use strict';

    angular
        .module('spartan.services')
        .factory('networkService', networkService);

    networkService.$inject = ['$http', '$state', "localNotifyService"];

    function networkService($http, $state, localNotifyService) {
        var service = {
            getWebServer: getWebServer,
            regisSocketListener: regisSocketListener
        };
        var webServer = null;

        return service;

        function getWebServer() {
            console.log("get app config.", JSON.stringify(server.appConfig));
            webServer = server.appConfig.webserver;

            return webServer;
        }

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