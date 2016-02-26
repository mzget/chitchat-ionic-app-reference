(function () {
    'use strict';

    angular
        .module('spartan.controllers')
        .controller('viewProfileController', viewProfileController);

//    viewProfileController.$inject = ['$location']; 

    function viewProfileController($location, $scope, $jrCrop, $stateParams, $rootScope, $state, $ionicHistory, $cordovaProgress,$ionicLoading,$ionicTabsDelegate,
     roomSelected, FileService, sharedObjectService)
    {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'viewProfileController';
        $ionicTabsDelegate.showBar(false);

        // ON ENTER 
        $scope.$on('$ionicView.enter', function () {
            console.log("view enter: ", vm.title);
        });

        var room = roomSelected.getRoom();

        if ($stateParams.chatId == main.getDataManager().myProfile._id) {
            $scope.chat = main.getDataManager().myProfile;
            $scope.model = {
                displayname: $scope.chat.displayname,
                status: $scope.chat.status
            };
            $scope.title = "My Profile";
            $scope.sourceImage = "";
            $('#viewprofile-input-display').removeAttr('disabled');
            $('#viewprofile-input-status').removeAttr('disabled');
            $scope.edit = 'true';
            //<!-- edit profile image.
            $scope.$on('fileUrl', function (event, url) {
                if (url != null) {
                    server.ProfileImageChanged($stateParams.chatId, url[0], function (err, res) {
                        main.getDataManager().myProfile.image = url[0];
                        saveProfile();
                    });
                } 
            });
            $scope.$on('fileUri', function(event, args) {
                document.getElementById("avatar").src = sharedObjectService.getWebServer() + main.getDataManager().myProfile.image;
                var imageData = cordova.file.documentsDirectory + FileService.getImages();
                $jrCrop.crop({
                    url: imageData,
                    width: 200,
                    height: 200
                }).then(function(canvas) {
                    // success!
                    var image = canvas.toDataURL('image/jpeg',1);
                    document.getElementById("avatar").src = image;
                    $scope.sourceImage = image;
                }, function() {
                    // User canceled or couldn't load image.
                });
            });
            
            $scope.save = function(){
                if($scope.sourceImage!='' || (main.getDataManager().myProfile.displayname != $scope.model.displayname || main.getDataManager().myProfile.status != $scope.model.status)){
                    $ionicLoading.show({
                        template: 'Loading..'
                    });
                    if($scope.sourceImage!='') {
                         $scope.$broadcast('uploadImgCrop', $scope.sourceImage ); 
                    }
                    else {
                         saveProfile();
                    }
                }
            }
        }
        else {
            var member = main.getDataManager().orgMembers[$stateParams.chatId];
            if (!!member) {
                if (member.firstname == null || member.firstname == "" &&
                    member.lastname == null || member.lastname == "" &&
                    member.mail == null || member.mail == "" &&
                    member.role == null || member.role == "" &&
                    member.tel == null || member.tel == "") {
                    server.getMemberProfile($stateParams.chatId, function (err, res) {
                        if (!err) {
                            //console.log(JSON.stringify(res));
                            //console.log(res["data"]);
                            member.firstname = res["data"].firstname;
                            member.lastname = res["data"].lastname;
                            member.mail = res["data"].mail;
                            member.role = res["data"].role;
                            member.tel = res["data"].tel;
                            $state.go($state.current, {}, { reload: true });
                        }
                        else {
                            console.warn(err, res);
                        }
                    });
                }

                $scope.chat = main.getDataManager().orgMembers[$stateParams.chatId];
                $scope.model = {
                    displayname: $scope.chat.displayname,
                    status: $scope.chat.status
                };
                $scope.title = $scope.chat.displayname + "'s Profile";
                $('#viewprofile-input-display').attr('disabled', 'disabled');
                $('#viewprofile-input-status').attr('disabled', 'disabled');
                $scope.edit = 'false';
            }
            else {
                console.warn("A member is no longer in team.");
            }
        }

        function saveProfile() {
            if (main.getDataManager().myProfile.displayname != $scope.model.displayname ||
                        main.getDataManager().myProfile.status != $scope.model.status) {

                server.UpdateUserProfile($stateParams.chatId, $scope.model, function (err, res) {
                    console.log(JSON.stringify(res));
                    main.getDataManager().myProfile.displayname = $scope.model.displayname;
                    main.getDataManager().myProfile.status = $scope.model.status;
                    saveSuccess();
                });
            } else if ($scope.sourceImage != "") {
                $scope.sourceImage = "";
                saveSuccess();
            }
        }
        function saveSuccess() {
            $ionicLoading.hide();
            $cordovaProgress.showSuccess(false, "Success!");
            setTimeout(function () { $cordovaProgress.hide(); }, 1500);
        }

        $rootScope.$ionicGoBack = function () {
            if(typeof($ionicHistory.backView().stateParams) != 'undefined')
            {
                roomSelected.setRoom(room);
                $ionicHistory.goBack(-1); 
            }else{
                $ionicHistory.goBack(-1);
            }
        
        };
    }
})();
