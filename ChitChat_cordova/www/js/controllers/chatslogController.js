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
	var accessLength = 0;
	var roomAccessLength = 0;
	var myRoomAccess = [];
        $scope.myProfile = dataManager.myProfile;
        $scope.orgMembers = dataManager.orgMembers;
        $scope.roomAccess = [];

        activate();

        function activate() { 
			console.warn(vm.title, "activate");
			
			listenerImp = function (newmsg) {
			    console.log(vm.title, 'onNewMessage: ' + newmsg.rid);

			    for (var i = 0; i < accessLength; i++) {
			        //console.log( myRoomAccess[i]['_id'] + ' / ' + newmsg.rid );
			        if (myRoomAccess[i]['_id'] == newmsg.rid) {
			            myRoomAccess[i]['body']['count']++;
			        }
			    }
			}
			chatslogComponent = chatslogService.getChatsLogComponent();
			chatslogComponent.addNewMsgListener(listenerImp);
        }

       getRoomAccess();
        
        function getRoomAccess() {
            console.log('getRoomAccess: ');

            roomAccess = dataManager.myProfile.roomAccess.reverse();
            roomAccessLength = roomAccess.length;

            getRoomInfo();
        }
        
        function getRoomInfo() {
            console.log("myRoomAccess.length", roomAccess.length);
            
            var data = {};
            var lastMessageMap = chatslogService.getLastMessageMap();
            roomAccess.map(function iterator(value, id, arr) {
                var unReadData = lastMessageMap[value.roomId];
                var room = dataManager.getGroup(value.roomId);
                if(!!room) {
                    console.log("room", room._id, room.name, room.type);
                    data.data = room;
                    data.data.body = unReadData;
                    data.data.accessTime = value.accessTime;
                    myRoomAccess.push(data['data']);
                }
                else {
                    // console.warn("room: ", value.roomId + "is a private chat type..");
                    
                    if(!!unReadData) {
                        server.getRoomInfo(value.roomId, function (err, res) {
                            console.log("getRoomInfo", JSON.stringify(res));
                            if (res['code'] == 200) {
                                data = res;
                                data.data.accessTime = value.accessTime;
                                data.data.body = unReadData;
                                console.log(data);
                                myRoomAccess.push(data['data']);			
        
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
        }
        
		var refresh = function () 
		{		
			$scope.roomAccess = myRoomAccess;
			
			$timeout(refresh, 1000);
		} 
		$timeout(refresh, 1000);
		
		$scope.gotoChat = function (accessId, chatlog) 
		{		
		    chatslogService.decreaseLogsCount(chatlog);
			for(var i=0; i<accessLength; i++)
			{
				if( myRoomAccess[i]['_id'] == accessId )
				{
					myRoomAccess[i]['body']['count'] = 0;
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
    }
})();