(function () {
    'use strict';

    angular
        .module('spartan.chatslog', [])
        .controller('chatslogController', chatslogController);

    // chatslogController.$inject = ['$location', '$scope', '$timeout', 'roomSelected'];
			
	function chatslogController($location, $scope, $timeout, roomSelected, chatslogService, localNotifyService, sharedObjectService) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'chatslogController';

        var dataManager = main.getDataManager();
		var chatslogComponent;
		var listenerImp;
        var roomAccess = [];
        var myRoomAccess = [];
        $scope.myProfile = dataManager.myProfile;
        $scope.orgMembers = dataManager.orgMembers;
        $scope.roomAccess = [];

        activate();

        function activate() { 
			console.warn(vm.title, "activate");
			
			listenerImp = function (newmsg) {
			    console.log(vm.title, 'onNewMessage: ' + newmsg.rid);
                
                myRoomAccess.some(function(value, id, arr) {
                   if(value._id === newmsg.rid) {
                       value.body.count++;
                       if(newmsg.type === ContentType[ContentType.Text]) {
                        main.decodeService(newmsg.body, function(err, res) {
                            if (!err) {
                                value.body.body = res;
                            }
                            else {
                                console.log(err, res);
                            }
                        });                   
                       }
                       return true;
                   } 
                });
			}
			chatslogComponent = chatslogService.getChatsLogComponent();
			chatslogComponent.addNewMsgListener(listenerImp);
        }

        getRoomInfo();
        
        function getRoomInfo() {
            roomAccess = dataManager.myProfile.roomAccess;
            
            console.log("myRoomAccess.length", roomAccess.length);
            
            var data = {};
            var unreadMessageMap = chatslogService.getLastMessageMap();
            roomAccess.map(function iterator(value, id, arr) {
                var room = dataManager.getGroup(value.roomId);
                if(!!room) {
                    data.data = room;
                    data.data.accessTime = value.accessTime;
                    if(!!unreadMessageMap && !!unreadMessageMap[value.roomId]) {
                        data.data.body = unreadMessageMap[value.roomId];
                    }
                    myRoomAccess.push(data['data']);
                }
                else {
                    // console.warn("room: ", value.roomId + "is a private chat type..");
                    if (!!unreadMessageMap[value.roomId]) {
                        server.getRoomInfo(value.roomId, function (err, res) {
                            if (res['code'] == 200) {
                                data.data = res.data;
                                data.data.accessTime = value.accessTime;
                                if(!!unreadMessageMap && !!unreadMessageMap[value.roomId]) {
                                    data.data.body = unreadMessageMap[value.roomId];
                                }

                                if (data.data.type == RoomType.privateChat) {
                                    try {
                                        if (data.data.members[0].id == main.getDataManager().myProfile._id) {
                                            data.data.name = main.getDataManager().orgMembers[data.data.members[1].id].displayname;
                                            data.data.image = main.getDataManager().orgMembers[data.data.members[1].id].image;
                                        } else {
                                            data.data.name = main.getDataManager().orgMembers[data.data.members[0].id].displayname;
                                            data.data.image = main.getDataManager().orgMembers[data.data.members[0].id].image;
                                        }
                                    } catch (err) {
                                        console.error(err);
                                    }
                                }

                                myRoomAccess.push(data['data']);
                            }

                            // server.getUnreadMsgOfRoom(roomAccess[myRoomAccessCount]['roomId'], roomAccess[myRoomAccessCount]['accessTime'], function (err, res) {
                            //     if (res['code'] == 200) {
                            //         data['data']['body'] = res['data'];
                            //         chatslogService.increaseLogsCount(res['data']['count']);
                            //         console.log(data);
                            //         myRoomAccess.push(data['data']);
                            //         accessLength = myRoomAccess.length;
                            //     }

                            //     if (myRoomAccessCount + 1 == roomAccessLength) {
                            //         console.log('last');
                            //     }
                            //     else {
                            //         myRoomAccessCount++;
                            //         getRoomInfo(myRoomAccessCount);
                            //     }
                            // });
                        });
                    }
                }
            });
            
            // for (var key in unreadMessageMap) {
            //     if (unreadMessageMap.hasOwnProperty(key)) {
            //         var unread = unreadMessageMap[key];
            //         console.log(unread);
            //         if(!!unread.body) {
                        
            //         }
            //     }
            // }
        }

        function updateUnreadMessageCount() {
            var lastMessageMap = chatslogService.getLastMessageMap();
            for (var i = 0; i < myRoomAccess.length; i++) {
                myRoomAccess[i].body = lastMessageMap[myRoomAccess[i]._id];
            }
        }
        
		var refresh = function () 
		{		
			$scope.roomAccess = myRoomAccess;
			
			$timeout(refresh, 1000);
		} 
		$timeout(refresh, 1000);
		
		$scope.gotoChat = function (accessId, chatlog) 
		{		
            var accessLength = myRoomAccess.length; 
            
			for(var i=0; i< accessLength; i++)
			{
				if( myRoomAccess[i]['_id'] == accessId )
				{
					switch( myRoomAccess[i]['type'] )
					{
						case 0:
							var group = main.getDataManager().orgGroups[accessId];
							roomSelected.setRoom(group);
							location.href = '#/tab/chats/chat/' + accessId;
							break;
						case 1:
							var group = main.getDataManager().projectBaseGroups[accessId];
							roomSelected.setRoom(group);
							location.href = '#/tab/chats/chat/' + accessId;
							break;
						case 2:
							var group = main.getDataManager().privateGroups[accessId];
							roomSelected.setRoom(group);
							location.href = '#/tab/chats/chat/' + accessId;
							break;
						case 3:
							if( myRoomAccess[i]['members'][0]['id'] != dataManager.myProfile._id )
								var contactId = myRoomAccess[i]['members'][0]['id']
							else
								var contactId = myRoomAccess[i]['members'][1]['id']
						
							server.getPrivateChatRoomId(dataManager.myProfile._id, contactId, function result(err, res) {
								console.log(JSON.stringify(res));
								var room = JSON.parse(JSON.stringify(res.data));
								roomSelected.setRoom(room);
								location.href = '#/tab/chats/chat/' + room._id;
							});
							break;
					}
					i = accessLength;
				}
			}	
		};

        $scope.$on('$ionicView.enter', function() { 
            console.log("$ionicView.enter: ", vm.title);
            
		    updateUnreadMessageCount();
        });
    }
})();