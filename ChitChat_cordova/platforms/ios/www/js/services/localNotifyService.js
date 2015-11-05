(function () {
    'use strict';

    angular
        .module('spartan.notify', [])
        .factory('localNotifyService', localNotifyService);

    // localNotifyService.$inject = ['$http', '$cordovaLocalNotification'];

    function localNotifyService($http, $cordovaLocalNotification, $cordovaToast) {
        var dataListener = main.getDataListener();
        var dataManager = main.getDataManager();
        var onChatListenerImp = new HomeComponent();
        dataListener.addListenerImp(onChatListenerImp);
        onChatListenerImp.onChat = function(chatMessageImp) {
            console.warn(chatMessageImp.type);
            var appBackground = cordova.plugins.backgroundMode.isActive();
            if(chatMessageImp.type === ContentType[ContentType.Text]) {
                var contact = dataManager.getContactProfile(chatMessageImp.sender);
                var secure = new SecureService();
                secure.decryptWithSecureRandom(chatMessageImp.body,  function done(err, res) {
                     if (!err) {
                        chatMessageImp.body = res;
                        if (!appBackground) {
                            makeToastOnCenter(chatMessageImp.body);
                        }
                        else {
                            scheduleSingleNotification(contact.displayname, chatMessageImp.body);
                        }
                    }
                    else {
                        console.warn(err, res);
                    }
                });
            }
            else if(chatMessageImp.type === ContentType[ContentType.Sticker]) {
                var contact = dataManager.getContactProfile(chatMessageImp.sender);
                var message = contact.displayname + " sent a sticker."
                if (!appBackground) {
                    makeToastOnCenter(message);
                }
                else {
                    scheduleSingleNotification(contact.displayname, message);
                }
            }
            else if (chatMessageImp.type === ContentType[ContentType.Voice]) {
                var contact = dataManager.getContactProfile(chatMessageImp.sender);
                var message = contact.displayname + " sent a voice message."
                if (!appBackground) {
                    makeToastOnCenter(message);
                }
                else {
                    scheduleSingleNotification(contact.displayname, message);
                }
            }
            else if (chatMessageImp.type === ContentType[ContentType.Image]) {
                var contact = dataManager.getContactProfile(chatMessageImp.sender);
                var message = contact.displayname + " sent a image."
                if (!appBackground) {
                    makeToastOnCenter(message);
                }
                else {
                    scheduleSingleNotification(contact.displayname, message);
                }
            }
            else if (chatMessageImp.type === ContentType[ContentType.Video]) {
                var contact = dataManager.getContactProfile(chatMessageImp.sender);
                var message = contact.displayname + " sent a video."
                if (!appBackground) {
                    makeToastOnCenter(message);
                }
                else {
                    scheduleSingleNotification(contact.displayname, message);
                }
            }
            else if (chatMessageImp.type === ContentType[ContentType.Location]) {
                var contact = dataManager.getContactProfile(chatMessageImp.sender);
                var message = contact.displayname + " sent a location."
                if (!appBackground) {
                    makeToastOnCenter(message);
                }
                else {
                    scheduleSingleNotification(contact.displayname, message);
                }
            }
        }
        
        var service = {
            getData: getData,
            scheduleSingleNotification: scheduleSingleNotification,
            updateSingleNotification: updateSingleNotification,
            cancelSingleNotification: cancelSingleNotification,
            registerPermission: registerPermission
        };

        return service;

        function getData() { }

        function registerPermission() {
            cordova.plugins.notification.local.registerPermission(function (granted) {
                console.warn('Permission has been granted: ' + granted);
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