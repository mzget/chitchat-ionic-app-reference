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

        var messagedal = null;

        return service;

        function getData() { }

        function setMessageDAL(_messagedal) {
            messagedal = _messagedal;
        }

        function getMessageDAL() {
            return messagedal;
        }

        function clearMessageDAL(next) {
            messagedal.clearData(next);
        }
    }
})();