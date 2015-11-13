(function () {
    'use strict';

    angular
        .module('spartan.services')
        .factory('sharedObjectService', sharedObjectService);

    sharedObjectService.$inject = ['$http'];

    function sharedObjectService($http) {
        var notifyManager = null;

        var service = {
            getData: getData,
            createNotifyManager: createNotifyManager,
            getNotifyManager: getNotifyManager
        };

        return service;

        function getData() { }

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