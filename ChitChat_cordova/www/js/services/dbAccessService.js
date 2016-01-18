(function () {
    'use strict';

    angular
        .module('spartan.db', [])
        .factory('dbAccessService', dbAccessService);

//    dbAccessService.$inject = ['$http'];

    function dbAccessService($http) {
        var service = {
            getData: getData,
            setMessageDAL: setMessageDAL,
            getMessageDAL: getMessageDAL,
            clearMessageDAL: clearMessageDAL
        };

        return service;

        var messagedal = null;

        function getData() { }

        function setMessageDAL(_messagedal) {
            messagedal = _messagedal;
        }

        function getMessageDAL() {
            return messagedal;
        }

        function clearMessageDAL() {
            messagedal.clearData();
        }
    }
})();