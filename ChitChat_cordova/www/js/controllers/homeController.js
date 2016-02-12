(function () {
	'use strict';

	angular
		.module('spartan.home', [])
		.controller('homeController', homeController);

	//homeController.$inject = ['$location'];

	function homeController($location, $state, $scope, $timeout, $ionicModal, $ionicLoading, $rootScope, $ionicPlatform, $cordovaSpinnerDialog,
		roomSelected, localNotifyService, Favorite, sharedObjectService, chatslogService, dbAccessService, modalFactory, webRTCFactory) {

		/* jshint validthis:true */
		var vm = this;
		vm.title = 'homeController';

		$scope.$on('roomName', function(event, args) { $scope.roomName = args; });

		function activate() {
		    if (ionic.Platform.platform() === 'ios') {
		        $cordovaSpinnerDialog.hide();
		    }
		    if ($ionicLoading) {
		        $ionicLoading.hide();
		    }

		    dbAccessService.setMessageDAL(messageDAL);
			localNotifyService.registerPermission();
			sharedObjectService.createNotifyManager(main);
			chatslogService.init();

			vm.dataListener = sharedObjectService.getDataListener();
			sharedObjectService.regisNotifyNewMessageEvent();

			webRTCFactory.init();
		}

		function setupScope() {
		    $scope.myProfile = main.getDataManager().myProfile;

		    if (!!main.getDataManager().orgGroups) {
		        $scope.orgGroups = main.getDataManager().orgGroups;
		    }
		    else {
		        main.getDataManager().onOrgGroupDataReady = function () {
		            $scope.orgGroups = main.getDataManager().orgGroups;
		        };
		    }

		    if (!!main.getDataManager().projectBaseGroups) {
		        $scope.pjbGroups = main.getDataManager().projectBaseGroups;
		    }
		    else {
		        main.getDataManager().onProjectBaseGroupsDataReady = function () {
		            $scope.pjbGroups = main.getDataManager().projectBaseGroups;
		        }
		    }

		    if (!!main.getDataManager().privateGroups) {
		        $scope.pvGroups = main.getDataManager().privateGroups;
		    }
		    else {
		        main.getDataManager().onPrivateGroupsDataReady = function () {
		            $scope.pvGroups = main.getDataManager().privateGroups;
		        }
		    }

		    if (!!main.getDataManager().orgMembers) {
		        $scope.chats = main.getDataManager().orgMembers;
		    }
		    else {
		        main.getDataManager().onContactsDataReady = function () {
		            $scope.chats = main.getDataManager().orgMembers;
		        }
		    }

		    $scope.favorites = getFavorite();
		    tryGetFavorite();
		}

		function getChatWeb(){
			var chatheight = $(window).height() - 43;
			$('ion-content').find('#webgroup').css({'height':chatheight+'px'});
			$('ion-content').find('#webchatdetail').css({'height':chatheight-44+'px'});
			$rootScope.$broadcast('enterChat','');
		}

		function tryGetFavorite(){
			if(!jQuery.isEmptyObject(main.getDataManager().orgGroups) &&
				!jQuery.isEmptyObject(main.getDataManager().projectBaseGroups) &&
				!jQuery.isEmptyObject(main.getDataManager().privateGroups) &&
				!jQuery.isEmptyObject(main.getDataManager().orgMembers)){
					setTimeout(function () {
			        	$scope.favorites = getFavorite();
			        	getChatWeb();
			    }, 500);
			}else{
				setTimeout(function () {
			        tryGetFavorite();
			    }, 1000);
			}
		}

		function onLeave() {
		
		}

		$scope.pullRefresh = function() {
			$scope.$broadcast('scroll.refreshComplete');
		}

		function getFavorite(){
			var favoriteArray = Favorite.getAllFavorite();
			var favorite = [];
			for (var x = 0; x < favoriteArray.length; x++) {
				try {
					if (main.getDataManager().orgGroups[favoriteArray[x]] !== undefined) favorite.push(main.getDataManager().orgGroups[favoriteArray[x]]);
					else if (main.getDataManager().projectBaseGroups[favoriteArray[x]] !== undefined) favorite.push(main.getDataManager().projectBaseGroups[favoriteArray[x]]);
					else if (main.getDataManager().privateGroups[favoriteArray[x]] !== undefined) favorite.push(main.getDataManager().privateGroups[favoriteArray[x]]);
					else if (main.getDataManager().orgMembers[favoriteArray[x]] !== undefined) {
						main.getDataManager().orgMembers[favoriteArray[x]].name = main.getDataManager().orgMembers[favoriteArray[x]].displayname;
						favorite.push(main.getDataManager().orgMembers[favoriteArray[x]]);
					}
				}
				catch (err) {
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
					if (!err && res.code==200) {
						console.log(JSON.stringify(res));
						Favorite.updateFavorite(editType,id,type);
						$scope.favorites = getFavorite();
						$ionicLoading.hide();
					}
					else {
						console.warn(err, res);
						$ionicLoading.hide();
					}
				});
			}else{
				server.updateFavoriteGroups(editType,id,function (err, res) {
					if (!err && res.code==200) {
						console.log(JSON.stringify(res));
						Favorite.updateFavorite(editType,id,type);
						$scope.favorites = getFavorite();
						$ionicLoading.hide();
					}
					else {
						console.warn(err, res);
						$ionicLoading.hide();
					}
				});
			}
		}
   
		$scope.isFavorite = function(id){
			return Favorite.isFavorite(id);
		}
		
		
			console.log("$ionicView.enter: ", vm.title);

			activate();
			setupScope();

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
		
	
		$scope.$on('$ionicView.beforeLeave', function () {
			console.log("beforeLeave: homeController");
		});

		$scope.$on('$ionicView.leave', function () {
			console.log("$ionicView.leave:", vm.title);
		});

		$scope.$on('$ionicView.unloaded', function () {
			console.log("$ionicView.unloaded:", vm.title);

			clearInterval($scope.interval);
			onLeave();
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
            modalFactory.initMyProfileModal($scope, function done(){
			    $scope.myProfileModal.show();
			});
		};
		$scope.closeProfileModal = function () {
			$scope.myProfileModal.hide();
		};
		//<!-- Org group modal ////////////////////////////////////////
		$scope.openOrgModal = function (groupId) {
			initOrgModal($state, $scope, groupId, roomSelected, function () {
				$scope.orgModal.show();
			}, $rootScope);
		};
		$scope.closeOrgModal = function () {
			$scope.orgModal.hide();
		};
		//<!-- Project base group modal /////////////////////////////////////////
		$scope.openPjbModal = function (groupId) {
			initPjbModal($state, $scope, groupId, roomSelected, function () {
				$scope.pjbModal.show();
			}, $rootScope);
		};
		$scope.closePjbModal = function () {
			$scope.pjbModal.hide();
		}
		//<!-- Private group modal ////////////////////////////////////////////
		$scope.openPvgModal = function (groupId) {
			initPvgModal($state, $scope, groupId, roomSelected, function () {
				$scope.pvgModal.show();
			}, $rootScope);
		};
		$scope.closePvgModal = function () {
			$scope.pvgModal.hide();
		}
		//<!-- Contact modal -------------------------->
		$scope.openContactModal = function (contactId) {
            modalFactory.initContactModal($scope, $rootScope, contactId, roomSelected, function done() {
				$scope.contactModal.show();
			});
		};
		$scope.closeContactModal = function() {
			$scope.contactModal.hide();	
		};
        //@ Call all group modal.
		$scope.openModal = function (id, type) {
		    if (type == RoomType.organizationGroup) {
		        $scope.openOrgModal(id);
		    } else if (type == RoomType.projectBaseGroup) {
		        $scope.openPjbModal(id);
		    } else if (type == RoomType.privateGroup) {
		        $scope.openPvgModal(id);
		    } else {
		        $scope.openContactModal(id);
		    }
		}
	}

	var initOrgModal = function ($state, $scope, groupId, roomSelected, done, $rootScope) {
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
            if(ionic.Platform.platform() !== 'ios' && ionic.Platform.platform() !== 'android') {
			    //       $state.go('', { chatId: chatId });
			    //location.href = '#/tab/group/chat/' + chatId;
			    $scope.$broadcast('changeChat', group);
            }
            else {
			    $state.go(NGStateUtil.tab_group_chat);
            }
		};

		$scope.viewGroupDetail = function (id) {
			$rootScope.selectTab = 'members';
			$state.go('tab.group-members', { chatId: id });
		};

		done();
	}

	var initPjbModal = function ($state, $scope, groupId, roomSelected, done, $rootScope) {
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
			if(ionic.Platform.platform() !== 'ios' && ionic.Platform.platform() !== 'android') {
			    //location.href = '#/tab/group/chat/' + chatId;
			    $scope.$broadcast('changeChat', group);
			}
            else {
			    $state.go(NGStateUtil.tab_group_chat);
            }
		};

		$scope.viewGroupDetail = function (id) {
			$rootScope.selectTab = 'members';
			$state.go('tab.group-members', { chatId: id });
		};

		done();
	}

	var initPvgModal = function ($state, $scope, groupId, roomSelected, done, $rootScope) {
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
			if (ionic.Platform.platform() !== 'ios' && ionic.Platform.platform() !== 'android') {
			    //location.href = '#/tab/group/chat/' + chatId;
			    $scope.$broadcast('changeChat', group);
			}
			else {		    //location.href = '#/tab/group/chat/' + chatId;
			    $state.go(NGStateUtil.tab_group_chat);
			}
		};

		$scope.viewGroupDetail = function (id) {
			$rootScope.selectTab = 'members';
			$state.go('tab.group-members', { chatId: id });
		};

		done();
	}
})();