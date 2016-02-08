(function () {
    'use strict';

    angular
        .module('spartan.services')
        .factory('networkService', networkService);

    networkService.$inject = ['$http', '$state', '$rootScope', '$cordovaNetwork', "localNotifyService"];

    function networkService($http, $state, $rootScope, $cordovaNetwork, localNotifyService) {
        var service = {
            init: init,
            regisSocketListener: regisSocketListener
        };

        return service;

        function init() {
            // listen for Online event
            $rootScope.$on('$cordovaNetwork:online', function (event, networkState) {
                var onlineState = networkState;
                console.warn('network state', networkState);
            })

            // listen for Offline event
            $rootScope.$on('$cordovaNetwork:offline', function (event, networkState) {
                var offlineState = networkState;

                console.warn('network state', networkState);
                localNotifyService.makeToast("Network is unstable.");
            })
        }

        function regisSocketListener() {
            console.log("regis socket event.");
            var socket = new SocketComponent();
            server.setSocketComponent(socket);
            socket.onDisconnect =  function onDisconnect(reason) {
                localNotifyService.makeToast("disconnected.");

                //@-- Todo..
                if ($cordovaNetwork.isOnline()) {
                    $state.go("tab.login");
                }
                else {
                    //@ Stay working offline.
                }
            }
        }
    }
})();