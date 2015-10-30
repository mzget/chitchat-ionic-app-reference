(function () {
    'use strict';

    angular
        .module('spartan.home', [])
        .controller('homeController', homeController);

    //homeController.$inject = ['$location'];

    function homeController($location, $state, $scope, $timeout, $ionicModal, roomSelected, localNotifyService) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'homeController';

        activate();

        function activate() {
            console.info('homeController activate');
        }

        
        $scope.$on('$ionicView.enter', function(){ 
            navShow();
	
            $scope.refreshView = function () {
                console.debug("homeController : refreshView");

                var dataManager = main.getDataManager();

                $scope.myProfile = dataManager.myProfile;
                $scope.orgGroups = dataManager.orgGroups;
                $scope.pjbGroups = dataManager.projectBaseGroups;
                $scope.pvGroups = dataManager.privateGroups;
                $scope.chats = dataManager.orgMembers;

                $scope.$apply();
            };
	
            $scope.refreshView();
	
            $scope.interval = setInterval(function () { $scope.refreshView(); }, 1000);

            //<!-- My profile.
            $ionicModal.fromTemplateUrl('templates/modal-myprofile.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                $scope.myProfileModal = modal;
            });
            //<!-- Org modal.
            $ionicModal.fromTemplateUrl('templates/modal-orggroup.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                $scope.orgModal = modal;
            });
            //<!-- Projectbase modal.
            $ionicModal.fromTemplateUrl('templates/modal-projectbasegroup.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                $scope.pjbModal = modal;
            });
            //<!-- Private group modal.
            $ionicModal.fromTemplateUrl('templates/modal-privategroup.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                $scope.pvgModal = modal;
            });
            //<!-- Contact modal.
            $ionicModal.fromTemplateUrl('templates/modal-contact.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                $scope.contactModal = modal;
            });

            //Cleanup the modal when we're done with it!
            $scope.$on('$destroy', function () {
                $scope.myProfileModal.remove();
                $scope.orgModal.remove();
                $scope.pjbModal.remove();
                $scope.pvgModal.remove();
                $scope.contactModal.remove();
            });
            // Execute action on hide modal
            $scope.$on('modal.hidden', function () {
                // Execute action
            });
            // Execute action on remove modal
            $scope.$on('modal.removed', function () {
                // Execute action
            });
        });
	
        $scope.$on('$ionicView.leave', function () {
            console.debug('clear : refreshView');
            clearInterval($scope.interval);
        });		
	
        $scope.viewlist = function(list) {
            var listHeight = $('#list-'+list+' .list').height();		
            if( parseInt(listHeight) != 0 ){
                $('#nav-'+list+' .button i').attr('class','icon ion-chevron-down');
                $('#list-'+list+' .list').animate({'height':'0'});
            }else{
                $('#nav-'+list+' .button i').attr('class','icon ion-chevron-up');
                $('#list-'+list+' .list').css({'height':'auto'});
            }
        };
	
        //<!-- My profile modal. -->
        $scope.openProfileModal = function (groupId) {
            initMyProfileModal($state, $scope, function done(){
                $scope.myProfileModal.show();
            });
        };
        $scope.closeProfileModal = function () {
            $scope.myProfileModal.hide();
        };
        //<!-- Org group modal ////////////////////////////////////////
        $scope.openOrgModal = function (groupId) {
            initOrgModal($scope, groupId, roomSelected, function () {
                $scope.orgModal.show();
            });
        };
        $scope.closeOrgModal = function () {
            $scope.orgModal.hide();
        };
        //<!-- Project base group modal /////////////////////////////////////////
        $scope.openPjbModal = function (groupId) {
            initPjbModal($scope, groupId, roomSelected, function () {
                $scope.pjbModal.show();
            });
        };
        $scope.closePjbModal = function () {
            $scope.pjbModal.hide();
        }
        //<!-- Private group modal ////////////////////////////////////////////
        $scope.openPvgModal = function (groupId) {
            initPvgModal($scope, groupId, roomSelected, function () {
                $scope.pvgModal.show();
            });
        };
        $scope.closePvgModal = function () {
            $scope.pvgModal.hide();
        }
        //<!-- Contact modal -------------------------->
        $scope.openContactModal = function(contactId) {
            initContactModal($scope, contactId, roomSelected, function done() {
                $scope.contactModal.show();
            });
        };
        $scope.closeContactModal = function() {
            $scope.contactModal.hide();	
        };
    }
})();