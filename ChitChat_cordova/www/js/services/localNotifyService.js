(function () {
    'use strict';

    angular
        .module('spartan.notify', [])
        .factory('localNotifyService', localNotifyService);

    localNotifyService.$inject = ['$http', '$cordovaLocalNotification'];

    function localNotifyService($http, $cordovaLocalNotification) {
        var dataListener = main.getDataListener();
        var dataManager = main.getDataManager();
        var onChatListenerImp = new HomeComponent();
        dataListener.addListenerImp(onChatListenerImp);
        onChatListenerImp.onChat = function(chatMessageImp) {
            if(chatMessageImp.type === ContentType[ContentType.Text]) {
                var contact = dataManager.getContactProfile(chatMessageImp.sender);
                scheduleSingleNotification(contact.displayname, chatMessageImp.body);
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

        function scheduleSingleNotification(title, text) {
            // ========== Scheduling
            $cordovaLocalNotification.schedule({
                id: 1,
                title: title,
                text: text,
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