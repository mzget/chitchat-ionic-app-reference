var myprofile;
angular.module('starter.controllers', [])

// GROUP
.controller('GroupCtrl', function($scope, Chats) {
	
	myprofile = main.getDataManager().myProfile;
	$scope.myProfile = myprofile;
	$scope.orgGroups = main.getDataManager().orgGroups;
	$scope.pjbGroups = main.getDataManager().projectBaseGroups;
	$scope.pvGroups = main.getDataManager().privateGroups;

	//$scope.chats = Chats.all();
	$scope.chats = main.getDataManager().orgMembers;
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
})

// GROUP - Profile
.controller('GroupMyprofileCtrl', function($scope) {
	$scope.chat = main.getDataManager().myProfile;
})

// GROUP - Type
.controller('GroupProjectbaseCtrl', function($scope, $stateParams) {
	$scope.chat = main.getDataManager().projectBaseGroups[$stateParams.chatId];
	
	members = main.getDataManager().projectBaseGroups[$stateParams.chatId].members;
	console.log('ALL GROUP MEMBERS : '+members.length);
	$scope.members = groupMembers(members);
	$scope.members_length = members.length;
})
.controller('GroupPrivateCtrl', function($scope, $stateParams) {
	$scope.chat = main.getDataManager().privateGroups[$stateParams.chatId];
	
	members = main.getDataManager().privateGroups[$stateParams.chatId].members;
	console.log('ALL GROUP MEMBERS : '+members.length);
	$scope.members = groupMembers(members);
	$scope.members_length = members.length;
})
.controller('GroupOrggroupsCtrl', function($scope, $stateParams) {	
	$scope.chat = main.getDataManager().orgGroups[$stateParams.chatId];
	
	members = main.getDataManager().orgGroups[$stateParams.chatId].members;
	console.log('ALL GROUP MEMBERS : '+members.length);
	$scope.members = groupMembers(members);
	$scope.members_length = members.length;
})
.controller('GroupDetailCtrl', function($scope, $stateParams) {
	$scope.chat = main.getDataManager().orgMembers[$stateParams.chatId];
})

// GROUP - Type
.controller('GroupMembersCtrl', function($scope, $stateParams) {	
	$scope.chat = main.getDataManager().orgGroups[$stateParams.chatId];
	
	members = main.getDataManager().orgGroups[$stateParams.chatId].members;
	console.log('ALL GROUP MEMBERS : '+members.length);
	$scope.members = groupMembers(members, members.length);
	$scope.members_length = members.length;
	
	
})







.controller('ChatsCtrl', function($scope, Chats) {
	// With the new view caching in Ionic, Controllers are only called
	// when they are recreated or on app start, instead of every page change.
	// To listen for when this page is active (for example, to refresh data),
	// listen for the $ionicView.enter event:
	//
	//$scope.$on('$ionicView.enter', function(e) {
	//});

	$scope.chats = Chats.all();
	$scope.remove = function(chat) {
		Chats.remove(chat);
	};
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
	members = main.getDataManager().orgMembers;
	chat = [{
		_id: 0,	// mongo id user id
		rid: '55dc2d2ed202128e36c6d2b7', // room id
		type: 'Text', // text, voice, image
		body: 'FPvwdfzUhPCCDi+Hv+Af0w4RVL2kME8kc1tTHaD/+M16+mS9X6DbWy4UZ+AErOFI5BoY7Oz+q3N3XttCPmKDEqaHi7htU4QpTDNuRtOFRP8=', // enclip
		sender: '55f25185d20212f9688b4567',
		createTime: 'ISODate("2015-06-15T07:33:47.026Z")',
	}, {
		_id: 1,	// mongo id user id
		rid: '55dc2d2ed202128e36c6d2b7', // room id
		type: 'Text', // text, voice, image
		body: 'FPvwdfzUhPCCDi+Hv+Af0w4RVL2kME8kc1tTHaD/+M16+mS9X6DbWy4UZ+AErOFI5BoY7Oz+q3N3XttCPmKDEqaHi7htU4QpTDNuRtOFRP8=', // enclip
		sender: '55f25185d20212f9688b4567',
		createTime: 'ISODate("2015-06-15T07:33:47.026Z")',
	}, {
		_id: 2,	// mongo id user id
		rid: '55dc2d2ed202128e36c6d2b7', // room id
		type: 'Text', // text, voice, image
		body: 'FPvwdfzUhPCCDi+Hv+Af0w4RVL2kME8kc1tTHaD/+M16+mS9X6DbWy4UZ+AErOFI5BoY7Oz+q3N3XttCPmKDEqaHi7htU4QpTDNuRtOFRP8=', // enclip
		sender: '55f25185d20212f9688b4567',
		createTime: 'ISODate("2015-06-15T07:33:47.026Z")',
	}, {
		_id: 3,	// mongo id user id
		rid: '55dc2d2ed202128e36c6d2b7', // room id
		type: 'Text', // text, voice, image
		body: 'FPvwdfzUhPCCDi+Hv+Af0w4RVL2kME8kc1tTHaD/+M16+mS9X6DbWy4UZ+AErOFI5BoY7Oz+q3N3XttCPmKDEqaHi7htU4QpTDNuRtOFRP8=', // enclip
		sender: '55dc2d2ed202128e36c6d2b7',
		createTime: 'ISODate("2015-06-15T07:33:47.026Z")',
	}];
	
	//console.log('Message Length : '+chat.length);
	for(i=0; i<chat.length; i++)
	{
		chat[i]['sender_displayname'] = members[chat[i]['sender']]['displayname'];
		chat[i]['sender_image'] = members[chat[i]['sender']]['image'];
		
		if( chat[i]['sender'] == myprofile['_id'] )
			chat[i]['msgowner'] = 'owner';
		else
			chat[i]['msgowner'] = 'other';
	}
	
	$scope.chat = chat;
})

.controller('AccountCtrl', function($scope) {
	$scope.settings = {
		logOut: true,
	};
});



function groupMembers(members, size)
{
	var max = members.length;
	if( max > 5 )
		max = 5;
		
	if( size )
		max = size;

	gmember = [];
	console.log('ALL GROUP MEMBERS : '+members.length);	
	for(i=0; i<max; i++)
	{
		gmember[i] = main.getDataManager().orgMembers[members[i]['id']];
		console.log('GROUP MEMBERS : '+main.getDataManager().orgMembers[members[i]['id']]['displayname']);
	}
	
	return gmember;
}














