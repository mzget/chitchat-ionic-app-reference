(function () {
    'use strict';

    angular
        .module('spartan.notify', [])
        .factory('localNotifyService', localNotifyService);

    // localNotifyService.$inject = ['$http', '$cordovaLocalNotification'];

    function localNotifyService($http, $cordovaLocalNotification, $cordovaToast) {
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
            cordova.plugins.notification.local.registerPermission(function (granted) {
                console.warn('Permission has been granted: ' + granted);
            });
        }
        
        function makeToast(message) {
             $cordovaToast.showLongCenter(message).then(function(success) {
                // success
                console.log('makeToastOnCenter success', success);
            }, function (error) {
                // error
                console.error('error', error);
            });
        }
        
        function makeToastOnCenter(message) {
             $cordovaToast.showLongCenter(message).then(function(success) {
                // success
                console.log('makeToastOnCenter success', success);
                navigator.notification.beep(1);
            }, function (error) {
                // error
                console.error('error', error);
            });
        }

        function scheduleSingleNotification(title, text) {
            // ========== Scheduling
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