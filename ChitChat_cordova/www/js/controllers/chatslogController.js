(function () {
    'use strict';

    angular
        .module('spartan.chatslog', [])
        .controller('chatslogController', chatslogController);

    // chatslogController.$inject = ['$location', '$scope', '$timeout', 'roomSelected'];
			
	function chatslogController($location, $scope, $rootScope, $timeout, roomSelected, chatslogService, localNotifyService, sharedObjectService) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'chatslogController';

        var dataManager = main.getDataManager();
		var listenerImp;
        var roomAccess = [];
        var myRoomAccess = [];
        $scope.myProfile = dataManager.myProfile;
        $scope.orgMembers = dataManager.orgMembers;
        $scope.roomAccess = [];

        function activate() { 
			console.warn(vm.title, "activate");
        }
        
        function getRoomInfo() {
            myRoomAccess = [];
            roomAccess = dataManager.myProfile.roomAccess;
            
            console.log("myRoomAccess.length", roomAccess.length);
            
            var data = {};
            var unreadMessageMap = chatslogService.getUnreadMessageMap();
            roomAccess.map(function iterator(value, id, arr) {
                var room = dataManager.getGroup(value.roomId);
                if(!!room) {
                    data.data = room;

                    if (!!unreadMessageMap && !!unreadMessageMap[value.roomId]) {
                        data.data.body = unreadMessageMap[value.roomId];
                    
                        if (!!unreadMessageMap[value.roomId].message) {
                            data.data.lastTime = unreadMessageMap[value.roomId].message.createTime ?
                                unreadMessageMap[value.roomId].message.createTime : value.accessTime;
                        }
                        else {
                            data.data.lastTime = value.accessTime;
                        }
                    }
                    else {
                        data.data.lastTime = value.accessTime;
                    }

                    myRoomAccess.push(data['data']);
                }
                else {
                    // console.warn("room: ", value.roomId + "is a private chat type..");
                    if (!!unreadMessageMap[value.roomId]) {
                        server.getRoomInfo(value.roomId, function (err, res) {
                            if (res['code'] == 200) {
                                data.data = res.data;
                                if (!!unreadMessageMap && !!unreadMessageMap[value.roomId]) {
                                    data.data.body = unreadMessageMap[value.roomId];
                                }

                                if (!!unreadMessageMap && !!unreadMessageMap[value.roomId].message) {
                                    data.data.lastTime = unreadMessageMap[value.roomId].message.createTime ?
                                        unreadMessageMap[value.roomId].message.createTime : value.accessTime;
                                }
                                else {
                                    data.data.lastTime = value.accessTime;
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
        }

        function updateUnreadMessageCount() {
            var lastMessageMap = chatslogService.getUnreadMessageMap();
            // myRoomAccess = [];
            //  for (var key in lastMessageMap) {
            //     if (lastMessageMap.hasOwnProperty(key)) {
            //         var unread = lastMessageMap[key];
            //         var content = {};
            //         content.body = unread;
            //         if(!!unread && !!unread.message) {
            //             content.lastTime = unread.message.createTime;
            //             myRoomAccess.push(content);
            //         }
            //     }
            // }
            for (var i = 0; i < myRoomAccess.length; i++) {
                var rid = myRoomAccess[i]._id;
                myRoomAccess[i].body = lastMessageMap[rid];
                if(!!lastMessageMap[rid] && !!lastMessageMap[rid].message) {
                    myRoomAccess[i].lastTime = lastMessageMap[rid].message.createTime; 
                }
            }
        }
        
		var refresh = function () 
		{
		    updateUnreadMessageCount();

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
            
            activate();

            getRoomInfo();
        });
        
        $scope.$on('getunreadmessagecomplete', function(event, data){
            getRoomInfo();
        });
    }
})();