(function () {
    'use strict';

    angular
        .module('spartan.bot', [])
        .controller('botController', botController);

    botController.$inject = ['$location', '$scope', 'botFactory'];

    function botController($location, $scope, botFactory) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'botController';
        vm.bot = botFactory.getData();

        activate();

        function activate() {
            $scope.bot = botFactory.getBot();
            vm.bot.fireChatInRoom(dataManager.myProfile._id);
        }
    }
})();
