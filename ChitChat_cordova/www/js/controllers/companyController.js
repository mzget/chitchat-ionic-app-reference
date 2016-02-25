(function () {
    'use strict';

    angular
        .module('spartan.controllers')
        .controller('companyController', companyController);

//    companyController.$inject = ['$location']; 

    function companyController($location, $scope, $state, $ionicModal, $timeout, CreateGroup, $localStorage, $rootScope, $ionicPopover, dbAccessService) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'companyController';

        activate();

        function activate() {
            $scope.teamInfo = main.getDataManager().getCompanyInfo();
        }

        $ionicPopover.fromTemplateUrl('templates_web/popover-account.html', {
            scope: $scope,
        }).then(function (popover) {
            $scope.popover = popover;
        });

        $ionicModal.fromTemplateUrl('templates_web/modal-myprofile.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.myProfileModal = modal;
        });

        $scope.openProfileModal = function () {
            $scope.myProfileModal.show();
        };

        $scope.myProfile = main.getDataManager().myProfile;

        $scope.logOut = function () {
            console.warn("logOut...");
            server.logout();
            server.dispose();

            dbAccessService.clearMessageDAL();
            localStorage.clear();
            //$state.go('tab.login');
            location.href = '';
        }
    }
})();
