(function () {
    'use strict';

    angular
        .module('spartan.controllers')
        .controller('optionsController', optionsController);

    function optionsController($location, $scope, $state, $ionicModal, $ionicTabsDelegate, $timeout, CreateGroup, $localStorage, $rootScope, $ionicPopover, dbAccessService) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'optionsController';

        $scope.$on('$ionicView.loaded', function () {
            console.log("$ionicView.loaded: ", vm.title);
        });
        $scope.$on('$ionicView.enter', function () {
            console.log("$ionicView.enter: ", vm.title);
            
            $ionicTabsDelegate.showBar(true);
        });
        $scope.$on('$ionicView.beforeLeave', function () {
            console.log("$ionicView.beforeLeave: ", vm.title);
        });
        $scope.$on('$ionicView.leave', function () {
            console.log("$ionicView.leave:", vm.title);
        });
        $scope.$on('$ionicView.unloaded', function () {
            console.log("$ionicView.unloaded:", vm.title);
        });

        $scope.settings = {
            logOut: true,
        };

        $scope.myProfile = main.getDataManager().myProfile;
        $scope.admin = UserRole.admin;

        $scope.createType = function (type) {
            CreateGroup.createType = type;
            location.href = '#/tab/account/create'
        }

        $ionicModal.fromTemplateUrl('templates/modal-theme.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.thememodal = modal
        })

        $scope.openThemeModal = function () {
            $scope.thememodal.show()
        }

        $scope.closeThemeModal = function () {
            $scope.thememodal.hide();
        };

        $scope.$on('$destroy', function () {
            $scope.thememodal.remove();
        });


        $scope.data = {
            'themedefault': 'css/themedefault.css',
            'themeblue': 'css/themeblue.css',
            'themebrown': 'css/themebrown.css',
            'themegreen': 'css/themegreen.css',
            'themered': 'css/themered.css',
            'themeviole': 'css/themeviole.css',
            'themeyellow': 'css/themeyellow.css'
        }

        $scope.save_settings = function (data) {
            $localStorage.themeData = data;
            $rootScope.theme = $localStorage.themeData;
            console.log($rootScope.themeblue)
        }

        $scope.logOut = function () {
            console.warn("logOut...");
            server.logout();
            server.dispose();

            localStorage.clear();
            dbAccessService.clearMessageDAL(function done() {
                //$state.go('tab.login');
                location.href = '';
            });
        }
    }
})();
