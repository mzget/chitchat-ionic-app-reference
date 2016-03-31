(function () {
    'use strict';

    angular
        .module('app')
        .controller('voiceCallController', voiceCallController);

    voiceCallController.$inject = ['$location']; 

    function voiceCallController($location) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'voiceCallController';

        activate();

        function activate() { }
    }
})();
