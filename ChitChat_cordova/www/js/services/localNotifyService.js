(function () {
    'use strict';

    angular
        .module('spartan.notify', [])
        .factory('localNotifyService', localNotifyService);

    // localNotifyService.$inject = ['$http', '$cordovaLocalNotification'];

    function localNotifyService($http, $cordovaLocalNotification, $cordovaToast, blockNotifications) {
        var service = {
            getData: getData,
            scheduleSingleNotification: scheduleSingleNotification,
            updateSingleNotification: updateSingleNotification,
            cancelSingleNotification: cancelSingleNotification,
            registerPermission: registerPermission,
            
            makeToast: makeToast,
            makeToastOnCenter: makeToastOnCenter
        };

        return service;

        function getData() { }

        function registerPermission() {
            if (ionic.Platform.platform() === "ios") {
                $cordovaLocalNotification.registerPermission(function (granted) {
                    console.warn('Permission has been granted: ' + granted);
                });
            }
        }
        
        function makeToast(message) {
            if (cordova.platformId === "ios") {
                $cordovaToast.showLongCenter(message).then(function (success) {
                    // success
                    console.log('makeToastOnCenter success', success);
                }, function (error) {
                    // error
                    console.error('error', error);
                });
            }
        }
        
        function makeToastOnCenter(contactId,message) {
            if(!blockNotifications.isBlockNoti(contactId)) {
                $cordovaToast.showLongCenter(message).then(function(success) {
                    // success
                    console.log('makeToastOnCenter success', success);
                    navigator.notification.beep(1);
                }, function (error) {
                    // error
                    console.error('error', error);
                });
            }
        }

        function scheduleSingleNotification(contactId,title, text) {
            if(!blockNotifications.isBlockNoti(contactId)) {
                console.log("schedule: ", text);
                $cordovaLocalNotification.schedule({
                    id: 1,
                    title: title,
                    text: text,
                    data: {
                        customProperty: 'custom value'
                    }
                }).then(function (result) {
                    console.log('scheduleSingleNotification', result);
                });
            }
        }

        function updateSingleNotification() {
            // ========== Update
            $cordovaLocalNotification.update({
                id: 1,
                title: 'Title - UPDATED',
                text: 'Text - UPDATED'
            }).then(function (result) {
                // ...
            });
        }

        function cancelSingleNotification() {
            $cordovaLocalNotification.cancel(1).then(function (result) {
                // ...
            });
        }
    }
})();