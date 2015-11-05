(function () {
    'use strict';

    angular
        .module('spartan.home', [])
        .controller('homeController', homeController);

    //homeController.$inject = ['$location'];

    function homeController($location, $state, $scope, $timeout, $ionicModal, $ionicLoading, roomSelected, localNotifyService, Favorite) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'homeController';

		$('.tab-nav.tabs').css({'display':'flex'});
		$('[name="tab-group"] .has-tabs').css({'bottom':'44px'})
        activate();

        function activate() {
            console.warn('homeController activate');
 
            localNotifyService.registerPermission();
        }

        $scope.pullRefresh = function() {
            $scope.$broadcast('scroll.refreshComplete');
        }

        function getFavorite(){
            var favoriteArray = Favorite.getAllFavorite();
            var favorite = [];
            for(var x=0; x<favoriteArray.length; x++){
                try {
                    if(main.getDataManager().orgGroups[favoriteArray[x]] !== undefined) favorite.push(main.getDataManager().orgGroups[favoriteArray[x]]); 
                    else if(main.getDataManager().projectBaseGroups[favoriteArray[x]] !== undefined) favorite.push(main.getDataManager().projectBaseGroups[favoriteArray[x]]); 
                    else if(main.getDataManager().privateGroups[favoriteArray[x]] !== undefined) favorite.push(main.getDataManager().privateGroups[favoriteArray[x]]); 
                    else if(main.getDataManager().orgMembers[favoriteArray[x]] !== undefined) { 
                        main.getDataManager().orgMembers[favoriteArray[x]].name = main.getDataManager().orgMembers[favoriteArray[x]].displayname;
                        favorite.push(main.getDataManager().orgMembers[favoriteArray[x]]); 
                    }
                }
                catch(err) {
                    //console.log(err);
                }
            }
            return favorite;
        }
        $scope.editFavorite = function(editType,id,type){
            $ionicLoading.show({
                  template: 'Loading..'
            });
            if(type==undefined){
                server.updateFavoriteMember(editType,id,function (err, res) {
                    if (!err) {
                        console.log(JSON.stringify(res));
                        Favorite.updateFavorite(editType,id,type);
                        $ionicLoading.hide();
                    }
                    else {
                        console.warn(err, res);
                    }
                });
            }else{
                server.updateFavoriteGroups(editType,id,function (err, res) {
                    if (!err) {
                        console.log(JSON.stringify(res));
                        Favorite.updateFavorite(editType,id,type);
                        $ionicLoading.hide();
                    }
                    else {
                        console.warn(err, res);
                    }
                });
            }
        }
   
        $scope.isFavorite = function(id){
            return Favorite.isFavorite(id);
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
                $scope.favorites = getFavorite();
                
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
        $scope.openModal = function(id,type){
            if(type==RoomType.organizationGroup){
                $scope.openOrgModal(id);
            }else if(type==RoomType.projectBaseGroup){
                $scope.openPjbModal(id);
            }else if(type==RoomType.privateGroup){
                $scope.openPvgModal(id);
            }else{
                $scope.openContactModal(id);
            }
        }
        $scope.openOrgModal = function (groupId) {
            initOrgModal($state, $scope, groupId, roomSelected, function () {
                $scope.orgModal.show();
            });
        };
        $scope.closeOrgModal = function () {
            $scope.orgModal.hide();
        };
        //<!-- Project base group modal /////////////////////////////////////////
        $scope.openPjbModal = function (groupId) {
            initPjbModal($state, $scope, groupId, roomSelected, function () {
                $scope.pjbModal.show();
            });
        };
        $scope.closePjbModal = function () {
            $scope.pjbModal.hide();
        }
        //<!-- Private group modal ////////////////////////////////////////////
        $scope.openPvgModal = function (groupId) {
            initPvgModal($state, $scope, groupId, roomSelected, function () {
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

    var initOrgModal = function ($state, $scope, groupId, roomSelected, done) {
        var group = main.getDataManager().orgGroups[groupId];
        roomSelected.setRoom(group);
        $scope.chat = group;

        var members = group.members;
        $scope.members_length = members.length;
        groupMembers(members, null, function done(members) {
            $scope.members = members;
            $scope.$apply();
        });

        //<!-- Join chat room.
        $scope.toggle = function (chatId) {
            $scope.closeOrgModal();
            //       $state.go('', { chatId: chatId });
            location.href = '#/tab/group/chat/' + chatId;
        };

        $scope.viewGroupDetail = function (id) {
            $state.go('tab.group-members', { chatId: id });
        };

        done();
    }

    var initPjbModal = function ($state, $scope, groupId, roomSelected, done) {
        var group = main.getDataManager().projectBaseGroups[groupId];
        roomSelected.setRoom(group);
        $scope.chat = group;

        var members = group.members;
        $scope.members_length = members.length;
        groupMembers(members, null, function done(members) {
            $scope.members = members;
            $scope.$apply();
        });

        $scope.toggle = function (chatId) {
            $scope.closePjbModal();
            location.href = '#/tab/group/chat/' + chatId;
        };

        $scope.viewGroupDetail = function (id) {
            $state.go('tab.group-members', { chatId: id });
        };

        done();
    }

    var initPvgModal = function ($state, $scope, groupId, roomSelected, done) {
        var group = main.getDataManager().privateGroups[groupId];
        roomSelected.setRoom(group);
        $scope.group = group;

        var members = group.members;
        $scope.members_length = members.length;
        groupMembers(members, null, function done(members) {
            $scope.members = members;
            $scope.$apply();
        });

        $scope.chat = function (chatId) {
            $scope.closePvgModal();
            location.href = '#/tab/group/chat/' + chatId;
        };

        $scope.viewGroupDetail = function (id) {
            $state.go('tab.group-members', { chatId: id });
        };

        done();
    }

    var initContactModal = function ($scope, contactId, roomSelected, done) {
        var contact = main.getDataManager().orgMembers[contactId];
        console.debug(contact);
        $scope.contact = contact;

        server.getPrivateChatRoomId(dataManager.myProfile._id, contactId, function result(err, res) {
            console.log(JSON.stringify(res));
            var room = JSON.parse(JSON.stringify(res.data));

            $scope.chat = function () {
                roomSelected.setRoom(room);
                location.href = '#/tab/group/chat/' + room._id;
            };

            $scope.openViewContactProfile = function (id) {
                location.href = '#/tab/group/member/' + id;
                //$state.go("tab.group-members", { chatId: id}, { inherit: false });
            }

            $scope.$apply();
        });

        done();
    }

    var initMyProfileModal = function ($state, $scope, done) {
        $scope.chat = main.getDataManager().myProfile;

        $scope.editProfile = function (chatId) {
            $state.go('tab.group-viewprofile', { chatId: chatId });
        };

        done();
    }
})();