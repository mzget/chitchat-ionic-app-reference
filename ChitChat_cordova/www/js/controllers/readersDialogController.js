(function () {
    'use strict';

    angular
        .module('spartan.controllers')
        .controller('readersDialogController', readersDialogController);

    function readersDialogController($location, $scope, $rootScope, $mdDialog) {
        /* jshint validthis:true */
        var self = this;
        self.title = 'readersDialogController';
        $scope.webServer = $rootScope.webServer;
        $scope.readers = $rootScope.readers;
        $scope.allMembers = main.getDataManager().orgMembers;
        $scope.closeReaderModal = closeReaderModal;

        activate();

        function activate() { }
        
        function closeReaderModal() {
            $mdDialog.hide();
        }
    }
})();