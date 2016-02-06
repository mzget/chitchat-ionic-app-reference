(function () {
    'use strict';

    angular
        .module('spartan.services')
        .factory('sharedObjectService', sharedObjectService);

    sharedObjectService.$inject = ['$http', 'localNotifyService'];

    function sharedObjectService($http, localNotifyService) {
        var notifyManager = null;

        var service = {
            getDataListener: getDataListener,
            regisNotifyNewMessageEvent: regisNotifyNewMessageEvent,
            unsubscribeGlobalNotifyMessageEvent: unsubscribeGlobalNotifyMessageEvent,
            createNotifyManager: createNotifyManager,
            getNotifyManager: getNotifyManager,
            getWebServer: getWebServer,
            getAppVersion: getAppVersion,
            getThemename: getThemename
        };
        var webServer = null;
        var appVersion = null;
        var themename = null;

        return service;

        function getWebServer() {
            webServer = server.appConfig.webserver;

            return webServer;
        }
        
        function getAppVersion() {
            appVersion = server.appConfig.version;
            
            return appVersion;
        }
        
        function getThemename() {
            themename = server.appConfig.themename;
            
            return themename;
        }

        function getDataListener() {
            var dataListener = main.getDataListener();
            return dataListener;
        }

        function regisNotifyNewMessageEvent() {
            console.log("subscribe global notify message event");
            
            getDataListener().addNoticeNewMessageEvent(noticeNewMessage);
        }
        
        function unsubscribeGlobalNotifyMessageEvent() {
            getDataListener().removeNoticeNewMessageEvent(noticeNewMessage);
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

            if (ionic.Platform.platform() === "ios") {
                var appBackground = cordova.plugins.backgroundMode.isActive();
                notifyManager.notify(chatMessageImp, appBackground, localNotifyService);
            }
            else {
                notifyManager.notify(chatMessageImp, appBackground, localNotifyService);
            }
        };
    }
})();