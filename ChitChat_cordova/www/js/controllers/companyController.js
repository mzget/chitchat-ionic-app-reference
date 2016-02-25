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

        $scope.showMyProfile = function(ev) {
            //var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
            $mdDialog.show({
              controller: ProfileController,
              templateUrl: 'templates_web/modal-myprofile.html',
              parent: angular.element(document.body),
              targetEvent: ev,
              clickOutsideToClose:true,
              onRemoving: closeDialog
              //fullscreen: useFullScreen
            });
            // .then(function(answer) {
            //   $scope.status = 'You said the information was "' + answer + '".';
            // }, function() {
            //   $scope.status = 'You cancelled the dialog.';
            // });
            // $scope.$watch(function() {
            //   return $mdMedia('xs') || $mdMedia('sm');
            // }, function(wantsFullScreen) {
            //   $scope.customFullscreen = (wantsFullScreen === true);
            // });
        };
        function closeDialog(){
            document.getElementById("UploadAvatar").reset();
        }
    }
})();
