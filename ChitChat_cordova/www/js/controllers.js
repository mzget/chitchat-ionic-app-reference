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

// View - Profile
.controller('GroupViewprofileCtrl', function($scope, $stateParams) {
	if($stateParams.chatId==main.getDataManager().myProfile._id){
		$scope.chat = main.getDataManager().myProfile;
		$scope.title = "My Profile";
		$('#viewprofile-input-display').removeAttr('disabled');
		$('#viewprofile-input-status').removeAttr('disabled');
		//document.getElementById("viewprofile-save").style.display = "none";
		$scope.edit = 'true';
	}else{
		$scope.chat = main.getDataManager().orgMembers[$stateParams.chatId];
		$scope.title = $scope.chat.displayname+"'s Profile";
		$('#viewprofile-input-display').attr('disabled','disabled');
		$('#viewprofile-input-status').attr('disabled','disabled');
		//document.getElementById("viewprofile-save").style.display = "none"
		$scope.edit = 'false';
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

	//chatRoomControl = new ChatRoomController();
	//main.dataListener.addListenerImp(chatRoomControl);
			
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

.controller('ChatMessageCtrl', function($scope, $stateParams, Messages) 
{
	Messages.set = [];
	console.warn(localStorage.getItem(myprofile['_id']+'_'+$stateParams.chatId));
	Messages.set(localStorage.getItem(myprofile['_id']+'_'+$stateParams.chatId));
	histories = Messages.all();
	console.log(histories);
	$scope.chat = histories;
		
	
	// SHOW BUTTON
    $('#send_message').css({ 'display': 'inline-block' });
    $('#chatroom_back').css({ 'display': 'inline-block' });
	
	// GET ACCESS TIME
	access = date.toISOString();
	allRoomAccess = myprofile.roomAccess.length;
	for (i = 0; i < allRoomAccess; i++) {
		if (myprofile.roomAccess[i].roomId == $stateParams.chatId)
			access = myprofile.roomAccess[i].accessTime;
	}
	//access = '2015-09-24T08:00:00.000Z';
		
	// GET HISTORY
	chatRoomApi.getChatHistory($stateParams.chatId, access, function (err, result) {
		if (result.code === 200) {
			histories = result.data;
			
			if (histories.length > 0) {
				async.eachSeries(histories, function (item, cb) {
					var chatMessageImp = JSON.parse(JSON.stringify(item));
					if (chatMessageImp.type === ContentType[ContentType.Text]) {
						main.decodeService(chatMessageImp.body, function(err, res) {
							if (!err) {
								chatMessageImp.body = res;
								//hatRoomControl.chatMessages.push(chatMessageImp);
								histories.push(chatMessageImp);
								cb();
							}
						});
					}
					else {
						//chatRoomControl.chatMessages.push(item);
						histories.push(item);
						cb();
					}
				}, function (err) {
					console.log('histories length : '+histories.length)
					//console.log(JSON.stringify(histories));
					//Messages.set = histories;
					
					console.log(myprofile['_id']+'_'+$stateParams.chatId);
					localStorage.setItem(myprofile['_id']+'_'+$stateParams.chatId, JSON.stringify(histories));
				});
			}
		} else {
			console.warn("WTF god only know.", result.message);
		}		
	});
		
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
	
	//localStorage.setItem($stateParams.chatId, '');
	
    //chat = chatMessages;
	//for(i=0; i<chat.length; i++)
	//{
	//	chat[i]['sender_displayname'] = members[chat[i]['sender']]['displayname'];
	//	chat[i]['sender_image'] = members[chat[i]['sender']]['image'];
		
	//	if( chat[i]['sender'] == myprofile['_id'] )
	//		chat[i]['msgowner'] = 'owner';
	//	else
	//		chat[i]['msgowner'] = 'other';
	//}
	
    chatRoomControl.serviceListener = function () {
        Chats.set(chatRoomControl.chatMessages);
    }
    getMessage(currentRoom, Chats, function () {

    });
        
    var chats = Chats.all();

    $scope.chat = Chats.all();
    $('#send_message').css({ 'display': 'inline-block' });
    $('#chatroom_back').css({ 'display': 'inline-block' });
	
	$('#send_message button').click(function(){
	    var content = $('#send_message input').val();
	    main.encodeService(content, function(err, result) {
	        if (err) {
	            console.error(err);
	        }
	        else {
	            var myId = main.getDataManager().myProfile._id;
	            chatRoomApi.chat(currentRoom, "*", myId, result, ContentType[ContentType.Text], function(err, res) {
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
	/*
    server.LeaveChatRoomRequest(currentRoom, function (err, res) {
        console.log("leave room", JSON.stringify(res));
        localStorage.removeItem(currentRoom);
        localStorage.setItem(myprofile['_id']+'_'+currentRoom, JSON.stringify(chatRoomControl.chatMessages));
        console.warn("save", myprofile['_id']+'_'+currentRoom, JSON.stringify(chatRoomControl.chatMessages));

        currentRoom = "";
        chatRoomControl.chatMessages = [];
    });
	*/
	
    javascript: history.back();
	$('#send_message').css({'display':'none'});
	$('#chatroom_back').css({'display':'none'});
}


function getMessage(chatId, Chats, callback) {
	//console.log(chatRoomControl.chatMessages.length)
//	chatRoomControl.loadAllMessage(currentRoom);
	var chatLog = localStorage.getItem(myprofile['_id']+'_'+chatId);
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

				allRoomAccess = myprofileroomAccess.length;
				for (i = 0; i < allRoomAccess; i++) {
					if (myprofileroomAccess[i].roomId == chatId)
						access = myprofileroomAccess[i].accessTime;
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

							localStorage.removeItem(myprofile['_id']+'_'+chatId);
							localStorage.setItem(myprofile['_id']+'_'+chatId, JSON.stringify(chatRoomControl.chatMessages));

//							location.href = '#/tab/message/' + chatId;
							callback();
						});
					}
					else {
					    //						location.href = '#/tab/message/' + chatId;
					    Chats.set(chatRoomControl.chatMessages);
					    callback();
					}
				});
			}
		});
	});
}
