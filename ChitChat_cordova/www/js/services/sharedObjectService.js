(function () {
    'use strict';

    angular
        .module('spartan.services')
        .factory('sharedObjectService', sharedObjectService);

    sharedObjectService.$inject = ['$http', 'localNotifyService'];

    function sharedObjectService($http, localNotifyService) {
        var notifyManager = null;
        var dataListener = main.getDataListener();

        var service = {
            getDataListener: getDataListener,
            regisNotifyNewMessageEvent: regisNotifyNewMessageEvent,
            unsubscribeGlobalNotifyMessageEvent: unsubscribeGlobalNotifyMessageEvent,
            createNotifyManager: createNotifyManager,
            getNotifyManager: getNotifyManager
        };

        return service;

        function getDataListener() {
            return dataListener;
        }

        function regisNotifyNewMessageEvent() {
            console.log("subscribe global notify message event");
            
            dataListener.addNoticeNewMessageEvent(noticeNewMessage);
        }
        
        function unsubscribeGlobalNotifyMessageEvent() {
            dataListener.removeNoticeNewMessageEvent(noticeNewMessage);
        }

        function createNotifyManager(main) {
            if (notifyManager === null || notifyManager === undefined) {
                notifyManager = new NotifyManager(main);
            }
        }

        function getNotifyManager() {
            return notifyManager;
        }
        
        function noticeNewMessage(chatMessageImp) {
            console.log("noticeNewMessage", chatMessageImp.type);

            if (cordova.platformId === "ios") {
                var appBackground = cordova.plugins.backgroundMode.isActive();
                notifyManager.notify(chatMessageImp, appBackground, localNotifyService);
            }
        };
    }
})();