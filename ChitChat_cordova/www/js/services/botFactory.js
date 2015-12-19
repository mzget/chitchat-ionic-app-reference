(function () {
    'use strict';

    angular
        .module('spartan.services')
        .factory('botFactory', botFactory);

    botFactory.$inject = ['$http'];

    function botFactory($http) {
        var service = {
            getData: getData,
            getBot: getBot
        };

        return service;

        function getData() {
            return dummy;
        }

        function getBot() {
            return dummy.getBot();
        }
    }
})();