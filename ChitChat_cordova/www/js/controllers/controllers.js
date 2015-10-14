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
.controller('GroupCtrl', function($rootScope, $scope, $timeout) 
{	
	$scope.$on('$ionicView.enter', function(){ 
		$rootScope.hideTabs = false;
	});
	console.debug("GroupCtrl");
	var refreshView = function () {
		var dataManager = main.getDataManager();
        
        $scope.myProfile = dataManager.myProfile;
        $scope.orgGroups = dataManager.orgGroups;
        $scope.pjbGroups = dataManager.projectBaseGroups;
        $scope.pvGroups = dataManager.privateGroups;
        $scope.chats = dataManager.orgMembers;
	};

    refreshView();

    setInterval(function() { refreshView(); }, 1000);

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
})

// GROUP - Profile
.controller('GroupMyprofileCtrl', function($scope) {
	$scope.chat = main.getDataManager().myProfile;
})

// Group - View Profile
.controller('GroupViewprofileCtrl', function($scope, $stateParams, $state, $cordovaProgress) {
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

// GROUP - Type

.controller('GroupOrggroupsCtrl', function ($scope, $stateParams, roomSelected) {
    var group = main.getDataManager().orgGroups[$stateParams.chatId];
    roomSelected.setRoom(group);
    $scope.chat = group;

    var members = group.members;
    $scope.members_length = members.length;
    groupMembers(members, null, function done(members) {
        $scope.members = members;
    });

    //<!-- Join chat room.
    $scope.toggle = function (chatId) {
        location.href = '#/tab/group/chat/' + chatId;
    };
})
.controller('GroupProjectbaseCtrl', function($scope, $stateParams, roomSelected) {
	var group = main.getDataManager().projectBaseGroups[$stateParams.chatId];
	roomSelected.setRoom(group);
	$scope.chat = group;
	
	var members = group.members;
	$scope.members_length = members.length;
	groupMembers(members, null, function done(members) {
	    $scope.members = members;
	});
			
	$scope.toggle = function (chatId) {
	    location.href = '#/tab/group/chat/' + chatId;
	};
})
.controller('GroupPrivateCtrl', function ($scope, $stateParams, roomSelected) {
    var group = main.getDataManager().privateGroups[$stateParams.chatId];
    roomSelected.setRoom(group);
    $scope.chat = group;
	
    var members = group.members;
    $scope.members_length = members.length;
	groupMembers(members, null, function done(members) {
	    $scope.members = members;
	});
			
	$scope.toggle = function (chatId) {
	    location.href = '#/tab/group/chat/' + chatId;
	};
})
.controller('MemberDetailCtrl', function ($scope, $stateParams, roomSelected) {
    var contact = main.getDataManager().orgMembers[$stateParams.chatId];
    $scope.chat = contact;

    server.getPrivateChatRoomId(dataManager.myProfile._id, $stateParams.chatId, function result(err, res) {
        console.log(JSON.stringify(res));
        var room = JSON.parse(JSON.stringify(res.data));

        $scope.toggle = function () {
            roomSelected.setRoom(room);
            location.href = '#/tab/group/chat/' + room._id;
        };
    });
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
