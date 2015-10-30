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
            if(chatMessageImp.type === ContentType[ContentType.Text]) {
                var contact = dataManager.getContactProfile(chatMessageImp.sender);
                var secure = new SecureService();
                secure.decryptWithSecureRandom(chatMessageImp.body,  function done(err, res) {
                     if (!err) {
                        chatMessageImp.body = res;
                        makeToastOnCenter(chatMessageImp.body);
                        scheduleSingleNotification(contact.displayname, chatMessageImp.body);
                    }
                    else {
                        console.warn(err, res);
                    }
                });
            }
        }
        
        var service = {
            getData: getData,
            scheduleSingleNotification: scheduleSingleNotification,
            updateSingleNotification: updateSingleNotification,
            cancelSingleNotification:cancelSingleNotification
        };

        return service;

        function getData() { }
        
        function makeToastOnCenter(message) {
            console.debug('makeToastOnTop');
             $cordovaToast.showLongCenter(message).then(function(success) {
                // success
                console.debug('success', success);
            }, function (error) {
                // error
                console.error('error', error);
            });
        }

        function scheduleSingleNotification(title, text) {
            // ========== Scheduling
            $cordovaLocalNotification.schedule({
                id: 1,
                title: title,
                text: text,
                sound: "/layerbell.caf",
                data: {
                    customProperty: 'custom value'
                }
            }).then(function (result) {
                console.info('scheduleSingleNotification', result);
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