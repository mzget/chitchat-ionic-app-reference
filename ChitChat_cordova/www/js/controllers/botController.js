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
        vm.isStarting = false;

        activate();

        function activate() {

        }

        $scope.chats = botFactory.getChats();

        $scope.startBot = function () {
            if (!vm.isStarting) {
                $scope.bot = botFactory.getBot();
                vm.bot.fireChatInRoom(dataManager.myProfile._id);

                vm.isStarting = true;
            }
        }

        $scope.stopBot = function () {
            if (vm.isStarting) {
                vm.bot.stopChat();
                vm.isStarting = false;
            }
        }
    }
})();
