(function () {
    'use strict';

    angular
        .module('spartan.services')
        .factory('sharedObjectService', sharedObjectService);

    sharedObjectService.$inject = ['$http', 'localNotifyService'];

    function sharedObjectService($http, localNotifyService) {
        var service = {
            getDataListener: getDataListener,
            getDataManager: getDataManager,
            regisNotifyNewMessageEvent: regisNotifyNewMessageEvent,
            unsubscribeGlobalNotifyMessageEvent: unsubscribeGlobalNotifyMessageEvent,
            createNotifyManager: createNotifyManager,
            getNotifyManager: getNotifyManager,
            getWebServer: getWebServer,
            getRestServer: getRestServer,
            getAppVersion: getAppVersion,
            getThemename: getThemename,
            loadLocalizationFile: loadLocalizationFile,
            getStringValue: getStringValue
        };
        var webServer = null;
        var appVersion = null;
        var themename = null;
        var restServer = null;
        var notifyManager = null;
        var stringValue = null;

        return service;

        function getWebServer() {
            webServer = server.appConfig.webserver;

            return webServer;
        }

        function getRestServer() {
            restServer = server.appConfig.restServer;

            return restServer;
        }
        
        function getAppVersion() {
            appVersion = server.appConfig.version;
            
            return appVersion;
        }
        
        function getThemename() {
            themename = server.appConfig.themename;
            
            return themename;
        }

        function getDataManager() {
            return main.getDataManager();
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

            if (ionic.Platform.platform() === "ios" || ionic.Platform.platform() === 'android') {
                try {
                    var appBackground = cordova.plugins.backgroundMode.isActive();
                    notifyManager.notify(chatMessageImp, appBackground, localNotifyService);
                }
                catch (ex) {
                    console.warn(ex);
                }
            }
            else {
                notifyManager.notify(chatMessageImp, appBackground, localNotifyService);
            }
        };
        
        function getStringValue() {
            return stringValue;
        }
        
        function loadLocalizationFile() {
            loadStringJSON(function result(data) {
                stringValue = JSON.parse(data);
            });
        }
        
        function loadStringJSON(callback) {   
            var xobj = new XMLHttpRequest();
                xobj.overrideMimeType("application/json");
            xobj.open('GET', 'configs/localization.json', true); // Replace 'my_data' with the path to your file
            xobj.onreadystatechange = function () {
                if (xobj.readyState == 4 && xobj.status == "200") {
                    // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
                    callback(xobj.responseText);
                }
            };
            xobj.send(null);  
        }
    }
})();