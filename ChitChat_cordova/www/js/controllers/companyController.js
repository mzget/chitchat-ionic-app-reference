(function () {
    'use strict';

    angular
        .module('spartan.controllers')
        .controller('companyController', companyController);

//    companyController.$inject = ['$location']; 

    function companyController($location, $scope, $state, $ionicModal, $timeout, CreateGroup, $localStorage, $rootScope, $ionicPopover, $mdDialog, dbAccessService) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'companyController';

        activate();

        function activate() {
            main.getDataManager().onCompanyInfoReady = function teamDataReady() {
                $scope.teamInfo = main.getDataManager().getCompanyInfo();
                //$scope.$apply();
            }
            $scope.teamInfo = main.getDataManager().getCompanyInfo();
            $scope.mySelf = main.getDataManager().getMyProfile();
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

        $scope.showMyProfile = function(ev) {
            $mdDialog.show({
              controller: ProfileController,
              templateUrl: 'templates_web/modal-myprofile.html',
              parent: angular.element(document.body),
              targetEvent: ev,
              clickOutsideToClose:true,
              onRemoving: closeDialogProfile
            });
        };
        function closeDialogProfile(){
            document.getElementById("UploadAvatar").reset();
        }
        $scope.createGroup = function(ev) {
            $mdDialog.show({
              controller: CreateController,
              templateUrl: 'templates_web/modal-creategroup.html',
              parent: angular.element(document.body),
              targetEvent: ev,
              clickOutsideToClose:true,
              onRemoving: closeDialogCreateGroup
            });
        }
        function closeDialogCreateGroup(){
            CreateGroup.clear();
            document.getElementById("UploadAvatar").reset();
        }
    }
})();
