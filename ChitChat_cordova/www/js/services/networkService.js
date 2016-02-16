(function () {
    'use strict';

    angular
        .module('spartan.services')
        .factory('networkService', networkService);

    networkService.$inject = ['$http', '$state', '$rootScope', '$cordovaNetwork', 'localNotifyService'];

    function networkService($http, $state, $rootScope, $cordovaNetwork, localNotifyService) {
        var service = {
            init: init,
            regisSocketListener: regisSocketListener
        };
        var reconnectingEvent;

        return service;

        function init() {
            if (ionic.Platform.platform() === 'ios' || ionic.Platform.platform() === 'android') {
                try {
                    var networkState = navigator.connection.type;
                    console.log("get network state", networkState);
                }
                catch(ex) {
                    console.warn(ex);
                }
            }

            // listen for Online event
            $rootScope.$on('$cordovaNetwork:online', function (event, networkState) {
                var onlineState = networkState;
                console.warn('network state', networkState);

                if (!!reconnectingEvent) {
                    reconnectingEvent();
                }
            })

            // listen for Offline event
            $rootScope.$on('$cordovaNetwork:offline', function (event, networkState) {
                var offlineState = networkState;

                console.warn('network state', networkState);
            })
        }

        function regisSocketListener() {
            console.log("regis socket event.");
            var socket = new SocketComponent();
            server.setSocketComponent(socket);
            socket.onDisconnect = function onDisconnect(reason) {
                socket.onDisconnect = null;

                localNotifyService.makeToast("disconnected.");

                setTimeout(function () {
                    console.log('Try to re connecting...', $cordovaNetwork.getNetwork());
                    //@-- Todo..
                    if ($cordovaNetwork.isOnline()) {
                        $state.go("tab.login");
                    }
                    else {
                        //@ Stay working offline.
                        reconnectingEvent = function () {
                            console.log('reconnectingEvent')
                            $state.go("tab.login");
                        };
                    }
                }, 1000);
            }
        }
    }
})();