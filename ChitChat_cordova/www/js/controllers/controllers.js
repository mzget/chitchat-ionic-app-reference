var date = new Date();
var now;
var newchatmessage;

angular.module('spartan.controllers', [])

.controller("LoginCtrl", function ($scope) {
    console.warn('LoginCtrl');

    $scope.confirmDialog = function () {
        navigator.notification.confirm("Checkout this confirmation dialog", function (buttonIndex) {
            switch (buttonIndex) {
                case 1:
                    console.log("Decline Pressed");
                    break;
                case 2:
                    console.log("Dont Care Pressed");
                    break;
                case 3:
                    console.log("Accept Pressed");
                    break;
            }
        }, "Our Title", ["Decline", "Dont Care", "Accept"]);
    }
})

// GROUP
.controller('homeController', function ($rootScope, $scope, $timeout, $ionicModal, roomSelected)
{	
	$scope.$on('$ionicView.enter', function(){ 
		$rootScope.hideTabs = false;
	
		$scope.refreshView = function () {
			console.debug("GroupCtrl : refreshView");
		
			var dataManager = main.getDataManager();
			$scope.myProfile = dataManager.myProfile;
			$scope.orgGroups = dataManager.orgGroups;
			$scope.pjbGroups = dataManager.projectBaseGroups;
			$scope.pvGroups = dataManager.privateGroups;
			$scope.chats = dataManager.orgMembers;
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
	
	$scope.$on('$ionicView.leave', function() {
	    clearInterval($scope.interval);

	    $rootScope.hideTabs = true;
	});

	//$scope.chats = Chats.all();
	$scope.remove = function(chat) {
		Chats.remove(chat);
	};		
	
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
	
	$scope.hideTab = function(){		
		$rootScope.hideTabs = true;
	}
	//<!-- My profile modal. -->
	$scope.openProfileModal = function (groupId) {
		initMyProfileModal($scope, function done(){
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
})

// Group - View Profile
.controller('GroupViewprofileCtrl', function($scope, $stateParams, $state, $cordovaProgress) {
	console.debug($stateParams)
	
	if($stateParams.chatId==main.getDataManager().myProfile._id){
		$scope.chat = main.getDataManager().myProfile;
		$scope.model = {
		    displayname: $scope.chat.displayname,
		    status: $scope.chat.status
		};
		$scope.title = "My Profile";
		$('#viewprofile-input-display').removeAttr('disabled');
		$('#viewprofile-input-status').removeAttr('disabled');
		$scope.edit = 'true';

		$scope.$on('fileUrl', function(event, url) { 
			if(url!=null){
				server.ProfileImageChanged($stateParams.chatId,url[0],function(err,res){
					main.getDataManager().myProfile.image = url[0];
					if(main.getDataManager().myProfile.displayname != $scope.model.displayname ||
						main.getDataManager().myProfile.status != $scope.model.status){
						saveProfile();
					}else saveSuccess();
				});
			}else{
				if(main.getDataManager().myProfile.displayname != $scope.model.displayname ||
						main.getDataManager().myProfile.status != $scope.model.status){
					saveProfile();
				}
			}
		});

		function saveProfile(){
			server.UpdateUserProfile($stateParams.chatId,$scope.model,function(err,res){
				console.log(JSON.stringify(res));
				main.getDataManager().myProfile.displayname = $scope.model.displayname;
				main.getDataManager().myProfile.status = $scope.model.status;
				saveSuccess();
			});
		}

		function saveSuccess(){
			$cordovaProgress.showSuccess(false, "Success!");
	    	setTimeout(function(){ $cordovaProgress.hide(); }, 1500);
		}

	}else{
    	var member = main.getDataManager().orgMembers[$stateParams.chatId];
		if(	member.firstname == null || member.firstname == "" &&
			member.lastname == null || member.lastname == "" &&
			member.mail == null || member.mail == "" && 
			member.role == null || member.role == "" &&
			member.tel == null || member.tel == ""){
			server.getMemberProfile($stateParams.chatId, function(err, res) {
				if (!err) {
					console.log(JSON.stringify(res));
					console.log(res["data"]);
					member.firstname = res["data"].firstname;
					member.lastname = res["data"].lastname;
					member.mail = res["data"].mail;
					member.role = res["data"].role;
					member.tel = res["data"].tel;
					$state.go($state.current, {}, {reload: true});
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
		$scope.title = $scope.chat.displayname+"'s Profile";
		$('#viewprofile-input-display').attr('disabled','disabled');
		$('#viewprofile-input-status').attr('disabled','disabled');
		$scope.edit = 'false';
	}
})

.factory('getProfileMember',function(){
	var result;
	function _all(){

	}
})
.controller('GroupMembersCtrl', function ($scope, $stateParams, roomSelected) {
    var room = roomSelected.getRoom();
    var group = null;
    switch (room.type) {
        case 0:
            group = main.getDataManager().orgGroups[$stateParams.chatId];
            break;
        case 1:
            group = main.getDataManager().projectBaseGroups[$stateParams.chatId];
            break;
        case 2:
            group = main.getDataManager().privateGroups[$stateParams.chatId];
            break;
        default:
            break;
    }

    var gMembers = group.members;

    $scope.chat = group;
    groupMembers(gMembers, gMembers.length, function done(members) {
        $scope.members = members;
    });
    $scope.members_length = gMembers.length;
})

.controller('ChatsCtrl', function($scope) {
	// With the new view caching in Ionic, Controllers are only called
	// when they are recreated or on app start, instead of every page change.
	// To listen for when this page is active (for example, to refresh data),
	// listen for the $ionicView.enter event:
	//
	//$scope.$on('$ionicView.enter', function(e) {
	//});

	$scope.roomAccess = myprofile.roomAccess;
})

.controller('MapCtrl', function ($scope, $stateParams) {
	
})

.controller('FreecallCtrl', function($scope, $stateParams) {
	
})

.controller('AccountCtrl', function($scope) {
	$scope.settings = {
		logOut: true,
	};
})

.controller('AccountCreate',function($scope) {
    $scope.images = "http://placehold.it/50x50";
}); // <-- LAST CONTROLLER

function groupMembers(members, size, callback)
{
	var max = members.length;
	if( max > 5 )
		max = 5;
		
	if( size )
		max = size;
    var counter = 0;
	var gmember = [];
	var getGroupMembers = function() {
		for(var i = 0; i <= members.length; i++) {
			if(!!members[i]) {
				var mem_id = members[i].id;
				var member = main.getDataManager().orgMembers[mem_id];
				if(!!member) {
					gmember.push(member);
					counter += 1;
	
					if(counter >= max) { break; }
				}
			}
		}
		
		if(gmember.length === 0 && !dataManager.isOrgMemberReady) {
			waitForOrgMembers();
		}
		else {
			callback(gmember);
		}
	}
	var waitForOrgMembers = function() {
		setTimeout(function() {
			getGroupMembers();
		}, 500);
	}
	
	if(dataManager.isOrgMemberReady) {
		getGroupMembers();
	}
	else {
		waitForOrgMembers();
	}
}

function back()
{
	//$('#send_message').css({'display':'none'});
	//$('#chatroom_back').css({'display':'none'});
}


function testfunc()
{
	return 'tabs-item-hide';
}


var initOrgModal = function ($scope, groupId, roomSelected, done) {
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
        location.href = '#/tab/group/chat/' + chatId;
    };

    done();
}

var initPjbModal = function ($scope, groupId, roomSelected, done) {
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

    done();
}

var initPvgModal = function ($scope, groupId, roomSelected, done) {
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
		
		$scope.openViewContactProfile = function(id) {
        	location.href = '#/tab/group/member/' + id;
		}
		
		$scope.$apply();
    });
	
	done();
}

var initMyProfileModal = function($scope, done) {
	$scope.chat = main.getDataManager().myProfile;
	
	done();
}