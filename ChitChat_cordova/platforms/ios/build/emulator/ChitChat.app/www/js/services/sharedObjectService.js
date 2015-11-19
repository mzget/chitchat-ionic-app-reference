(function () {
    'use strict';

    angular
        .module('spartan.services')
        .factory('sharedObjectService', sharedObjectService);

    sharedObjectService.$inject = ['$http'];

    function sharedObjectService($http) {
        var notifyManager = null;
        var dataListener = main.getDataListener();

        var service = {
            getDataListener: getDataListener,
            regisNotifyNewMessageEvent: regisNotifyNewMessageEvent,
            createNotifyManager: createNotifyManager,
            getNotifyManager: getNotifyManager
        };

        return service;

        function getDataListener() {
            return dataListener;
        }

        function regisNotifyNewMessageEvent(localNotifyService) {
            dataListener.notifyNewMessageEvent = function (chatMessageImp) {
                var appBackground = cordova.plugins.backgroundMode.isActive();
                notifyManager.notify(chatMessageImp, appBackground, localNotifyService);
            }
        }

        function createNotifyManager(main) {
            if (notifyManager === null || notifyManager === undefined) {
                notifyManager = new NotifyManager(main);
            }
        }

        function getNotifyManager() {
            return notifyManager;
        }
    }
})();