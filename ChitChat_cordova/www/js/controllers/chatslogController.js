(function () {
    'use strict';

    angular
        .module('spartan.chatslog', [])
        .controller('chatslogController', chatslogController);

    chatslogController.$inject = ['$location', '$scope'];

    function chatslogController($location, $scope) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'chatslogController';

        activate();

        function activate() { }

        var dataManager = main.getDataManager();
        $scope.roomAccess = dataManager.myProfile.roomAccess;

        console.log('you have access %s rooms', dataManager.myProfile.roomAccess.length);
    }
})();