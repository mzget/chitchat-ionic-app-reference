var myprofile;
var date = new Date();
var now;
var newchatmessage;
var chatRoomControl;
var currentRoom;
var allMembers;

angular.module('starter.controllers', [])

// GROUP
.controller('GroupCtrl', function($scope) {

    //console.log(localStorage['55d177c2d20212737c46c685']);
	
	$scope.myProfile = myprofile;
	$scope.orgGroups = main.getDataManager().orgGroups;
	$scope.pjbGroups = main.getDataManager().projectBaseGroups;
	$scope.pvGroups = main.getDataManager().privateGroups;

	//$scope.chats = Chats.all();
	allMembers = main.getDataManager().orgMembers;
	$scope.chats = allMembers;
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

// Group - View Profile
.controller('GroupViewprofileCtrl', function($scope, $stateParams, $state) {
	if($stateParams.chatId==main.getDataManager().myProfile._id){
		$scope.chat = main.getDataManager().myProfile;
		$scope.title = "My Profile";
		$('#viewprofile-input-display').removeAttr('disabled');
		$('#viewprofile-input-status').removeAttr('disabled');
		$scope.edit = 'true';
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

	chatRoomControl = new ChatRoomController();
	main.dataListener.addListenerImp(chatRoomControl);
			
	$scope.toggle = function (chatId) {
	    currentRoom = chatId;
	    location.href = '#/tab/message/' + chatId;
	};
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







.controller('ChatsCtrl', function($scope) {
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

.controller('ChatDetailCtrl', function($scope, $timeout, $stateParams, Chats) 
{    	
	$scope.chat = [];
	
    chatRoomControl.serviceListener = function () {
        Chats.set(chatRoomControl.chatMessages);
    }
    getMessage(currentRoom, Chats, function () {

    });
     
    var countUp = function () {		
		if( currentRoom != '' )
		{
			localStorage.removeItem(myprofile.displayname_id+'_'+currentRoom);
			localStorage.setItem(myprofile.displayname_id+'_'+currentRoom, JSON.stringify(chatRoomControl.chatMessages));
			console.log('update with timeout fired');
			$scope.chat = Chats.all();
			console.log( 'Refresh' );
			
			$timeout(countUp, 1000);
		}
    }
    $timeout(countUp, 1000);
	
    var chats = Chats.all();
    /*chats.forEach(chat => {
        console.log(chat);
    });*/


	$scope.allMembers = allMembers;
	$scope.myprofile = myprofile;
    $scope.chat = Chats.all();
    $('#send_message').css({ 'display': 'inline-block' });
    $('#chatroom_back').css({ 'display': 'inline-block' });
	
	$('#send_message button').click(function(){
	    var content = $('#send_message input').val();
		if( content != '' )
		{
			main.encodeService(content, function(err, result) {
				if (err) {
					console.error(err);
				}
				else {
					//var myId = myprofile._id;
					chatRoomApi.chat(currentRoom, "*", myprofile._id, result, ContentType[ContentType.Text], function(err, res) {
						if (err || res === null) {
							console.warn("send message fail.");
						}
						else {
							console.log("send message:", res);
						}
					});
				}
			});
			// Clear
			$('#send_message input').val('')
		}
	});	
})

.controller('FreecallCtrl', function($scope, $stateParams) {
	
})

.controller('AccountCtrl', function($scope) {
	$scope.settings = {
		logOut: true,
	};
}); // <-- LAST CONTROLLER



function groupMembers(members, size)
{
	var max = members.length;
	if( max > 5 )
		max = 5;
		
	if( size )
		max = size;

	gmember = [];
	//console.log('ALL GROUP MEMBERS : '+members.length);	
	for(i=0; i<max; i++)
	{
		gmember[i] = main.getDataManager().orgMembers[members[i]['id']];
		console.log('GROUP MEMBERS : '+main.getDataManager().orgMembers[members[i]['id']]['displayname']);
	}
	
	return gmember;
}

function back()
{
    server.LeaveChatRoomRequest(currentRoom, function (err, res) {
        console.log("leave room", JSON.stringify(res));
        localStorage.removeItem(myprofile.displayname_id+'_'+currentRoom);
        localStorage.setItem(myprofile.displayname_id+'_'+currentRoom, JSON.stringify(chatRoomControl.chatMessages));
        console.warn("save", currentRoom,JSON.stringify(chatRoomControl.chatMessages));

        currentRoom = "";
        chatRoomControl.chatMessages = [];
    });

    javascript: history.back();
	$('#send_message').css({'display':'none'});
	$('#chatroom_back').css({'display':'none'});
}


function getMessage(chatId, Chats, callback) {
	//console.log(chatRoomControl.chatMessages.length)
//	chatRoomControl.loadAllMessage(currentRoom);
	var chatLog = localStorage.getItem(myprofile.displayname_id+'_'+chatId);
	//console.log('local chatLog : ' + chatLog);
	async.waterfall([
		function (cb) {
			if (!!chatLog) {
				if (JSON.stringify(chatLog) === "") {
					chatRoomControl.chatMessages = [];
					cb(null, null);
				}
				else {
					var arr_fromLog = JSON.parse(chatLog);
					if (arr_fromLog === null || arr_fromLog instanceof Array === false) {
					    chatRoomControl.chatMessages = [];
						cb(null, null);
					}
					else {
						async.eachSeries(arr_fromLog, function (log, cb) {
							var messageImp = log;
							if (messageImp.type === ContentType[ContentType.Text]) {
								main.decodeService(messageImp.body, function(err, res) {
									if (!err) {
										messageImp.body = res;
										chatRoomControl.chatMessages.push(messageImp);
										cb();
									}
									else {
										//console.log(err, res);
									    chatRoomControl.chatMessages.push(messageImp);
										cb();
									}
								});
							}
							else {
							    chatRoomControl.chatMessages.push(log);
								cb();
							}
						}, function (err) {
							cb(null, null);
						});
					}
				}
			}
			else {
			    chatRoomControl.chatMessages = [];
				cb(null, null);
			}
		},
		function (arg1, cb) {
			//console.log("before join", JSON.stringify(chatMessages));
			cb(null, null);
		}
	], function (err, res) {
		server.JoinChatRoomRequest(chatId, function (err, res) {
			if (res.code == 200) {
				access = date.toISOString();

				allRoomAccess = myprofile.roomAccess.length;
				for (i = 0; i < allRoomAccess; i++) {
					if (myprofile.roomAccess[i].roomId == chatId)
						access = myprofile.roomAccess[i].accessTime;
				}

				//now = date.toISOString();
				//access = '2015-09-24T08:00:00.000Z';

				chatRoomApi.getChatHistory(chatId, access, function (err, result) {
					var histories = [];
					if (result.code === 200) {
						histories = result.data;
					} else {
						//console.warn("WTF god only know.", result.message);
					}

					members = main.getDataManager().orgMembers;

					var his_length = histories.length;
					//console.log("new chat log", histories.length);
					if (his_length > 0) {
						async.eachSeries(histories, function (item, cb) {
							var chatMessageImp = JSON.parse(JSON.stringify(item));
							if (chatMessageImp.type === ContentType[ContentType.Text]) {
								main.decodeService(chatMessageImp.body, function(err, res) {
									if (!err) {
										chatMessageImp.body = res;
										chatRoomControl.chatMessages.push(chatMessageImp);
										cb();
									}
									else {
										//console.warn(err, res);
										cb();
									}
								});
							}
							else {
								if(item.type == 'File')
								{
									console.log('file');
								}
								chatRoomControl.chatMessages.push(item);
								cb();
							}
						}, function (err) {
						    Chats.set(chatRoomControl.chatMessages);

							localStorage.removeItem(myprofile.displayname_id+'_'+chatId);
							localStorage.setItem(myprofile.displayname_id+'_'+chatId, JSON.stringify(chatRoomControl.chatMessages));

							// location.href = '#/tab/message/' + chatId;
							callback();
						});
					}
					else {
					    // location.href = '#/tab/message/' + chatId;
					    Chats.set(chatRoomControl.chatMessages);
					    callback();
					}
				});
			}
		});
	});
}
