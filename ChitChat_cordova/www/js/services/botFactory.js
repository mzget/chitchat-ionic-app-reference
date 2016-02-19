(function () {
    'use strict';

    angular
        .module('spartan.services')
        .factory('botFactory', botFactory);

    botFactory.$inject = ['$http'];

    function botFactory($http) {
        var service = {
            init: init,
            getData: getData,
            getBot: getBot,
            getChats : getChats
        };
        var dummy;

        return service;

        function init() {
            dummy = new Dummy(main);
        }

        function getData() {
            return dummy;
        }

        function getBot() {
            return dummy.getBot();
        }

        function getChats() {
            return dummy.getChats();
        }
    }
})();