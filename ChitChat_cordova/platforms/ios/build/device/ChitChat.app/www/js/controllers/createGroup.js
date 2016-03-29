(function () {
    'use strict';

    angular
        .module('spartan.controllers')
        .controller('createGroup', createGroup);

        
    function createGroup($scope, $rootScope, $state, $ionicHistory, $ionicTabsDelegate, $ionicLoading, $cordovaProgress, CreateGroup, FileService) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'createGroup';
        $ionicTabsDelegate.showBar(false);

        console.log('createGroup', CreateGroup.createType);

        $scope.$on('$ionicView.loaded', function () {
            console.log("$ionicView.loaded: ", vm.title);
        });
        $scope.$on('$ionicView.enter', function () {
            console.log("$ionicView.enter: ", vm.title);
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

        var myProfile = main.getDataManager().myProfile;
        $rootScope.members = CreateGroup.getSelectedMember();
        $scope.model = { groupname: "" };
        var roomId = "";
        $scope.submit = function () {
            createGroup();
        }
        function createGroup() {
            $ionicLoading.show({
                template: 'Loading..'
            });
            if (CreateGroup.createType == "PrivateGroup") {
                server.UserRequestCreateGroupChat($scope.model.groupname, CreateGroup.getSelectedIdWithMe(), function (err, res) {
                    if (!err) {
                        console.log(JSON.stringify(res));
                        roomId = res.data._id;
                        uploadImageGroup();
                    }
                    else {
                        console.warn(err, res);
                    }
                });
            } else {
                server.requestCreateProjectBaseGroup($scope.model.groupname, CreateGroup.getSelectedMemberProjectBaseWithMe(), function (err, res) {
                    if (!err) {
                        console.log(JSON.stringify(res));
                        roomId = res.data._id;
                        uploadImageGroup();
                    }
                    else {
                        console.warn(err, res);
                    }
                });
            }
        }
        function createSuccess() {
            $ionicLoading.hide();
            $cordovaProgress.showSuccess(false, "Success!");
            setTimeout(function () { $cordovaProgress.hide(); }, 1500);
        }
        function uploadImageGroup() {
            if (FileService.getImages() != '') {
                $scope.$broadcast('uploadImg', 'uploadImg');
            } else {
                //$state.go('tab.group');
                createSuccess();
                $rootScope.$ionicGoBack();
            }
        }
        $scope.$on('fileUrl', function (event, args) {
            server.UpdatedGroupImage(roomId, args[0], function (err, res) {
                if (!err) {
                    console.log(JSON.stringify(res));
                    createSuccess();
                    //$state.go('tab.group');
                    $rootScope.$ionicGoBack();
                } else {
                    console.warn(err, res);
                }
            });
        });
        $rootScope.$ionicGoBack = function () {
            if ($state.current.name == 'tab.account-create') {
                CreateGroup.clear();
            }
            $ionicHistory.goBack(-1);
        };
    }
})();