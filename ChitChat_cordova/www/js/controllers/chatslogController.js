(function () {
    'use strict';

    angular
        .module('spartan.chatslog', [])
        .controller('chatslogController', chatslogController);

    // chatslogController.$inject = ['$location', '$scope', '$timeout', 'roomSelected'];
			
	var roomAccess = [];
	var accessLength = 0;
	var roomAccessLength = 0;
	var myRoomAccess = [];
	var myRoomAccessCount = 0;
	var chatsLogComponent = null;
	
    function chatslogController($location, $scope, $timeout, roomSelected, chatslogService) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'chatslogController';

        var dataManager = main.getDataManager();
        var dataListener = main.getDataListener();
		var chatlog_count = 0;
        $scope.myProfile = dataManager.myProfile;
        $scope.orgMembers = dataManager.orgMembers;
        $scope.roomAccess = [];

        activate();

        function activate() { 
			console.warn("chatslogController.activate");
			
			chatsLogComponent = chatslogService.getChatsLogComponent();
			chatslogService.setChatsLogCount(0);
			chatlog_count = chatslogService.getChatsLogCount();
			chatsLogComponent.onNewMessage = function(newmsg)
			{
				chatlog_count++;
				console.log( 'onNewMessage: ' + newmsg.rid);
				
				for(var i=0; i<accessLength; i++)
				{
					//console.log( myRoomAccess[i]['_id'] + ' / ' + newmsg.rid );
					if( myRoomAccess[i]['_id'] == newmsg.rid )
					{
						myRoomAccess[i]['body']['count']++;
					}
				}
				
			}
			
			chatsLogComponent.onEditedGroupMember = function(newgroup)
			{
				console.log( 'onEditedGroupMember :::::::	' );
				console.log( newgroup );					
			}
        }


        getRoomAccess();
		var refresh = function () 
		{		
			$scope.roomAccess = myRoomAccess;
			console.log('reload chatlog');
		
			//console.log(roomAccess);
			//console.log(myRoomAccess);
			
			$('#chatlog_count').text(chatlog_count);
			
			$timeout(refresh, 1000);
		} 
		$timeout(refresh, 1000);
		
		$scope.gotoChat = function (accessId, chatlog) 
		{		
			chatlog_count -= chatlog;
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

    function getUnreadMessages() {
	 	chatsLogComponent.getUnreadMessage(main.getDataManager().myProfile.roomAccess, function done(err, logsData) {
			 if(!!logsData) {
				 logsData.map(function element(v) {
					 console.log(v);
				 });
			 }
		 });
    }

	
	function getRoomAccess()
	{
		console.log('getRoomAccess: ');
		
		roomAccess = dataManager.myProfile.roomAccess.reverse();
		roomAccessLength = roomAccess.length;
		
		getRoomInfo();
	}
	
	function getRoomInfo()
	{
		if( myRoomAccessCount < roomAccessLength )
		{
			console.log( 'wait: ' + myRoomAccessCount + '/' + roomAccessLength );	
			//console.log( roomAccess[myRoomAccessCount] );
			server.getRoomInfo(roomAccess[myRoomAccessCount]['roomId'], function(err, res){				
				if( res['code'] == 200 )
				{
					console.log( res['data']['_id'] );
					//console.log( res );
					var data = res;
					data['data']['accessTime'] = roomAccess[myRoomAccessCount]['accessTime'];
					console.log( data );
					//myRoomAccess.push(data['data']);			
					
					if(data.data.type == RoomType.privateChat){
						try{
							if( data.data.members[0].id == main.getDataManager().myProfile._id ){
								data.data.name = main.getDataManager().orgMembers[data.data.members[1].id].displayname;
								data.data.image = main.getDataManager().orgMembers[data.data.members[1].id].image;
							}else{
								data.data.name = main.getDataManager().orgMembers[data.data.members[0].id].displayname;
								data.data.image = main.getDataManager().orgMembers[data.data.members[0].id].image;
							}
						}catch(err){
							console.log(err);
						}
					}			
				}
				
				server.getUnreadMsgOfRoom(roomAccess[myRoomAccessCount]['roomId'], roomAccess[myRoomAccessCount]['accessTime'], function(err, res){		
					if( res['code'] == 200 )
					{
						data['data']['body'] = res['data'];
						chatlog_count += res['data']['count'];
						console.log( data );
						myRoomAccess.push(data['data']);	
						accessLength = myRoomAccess.length;
					}
								
					if( myRoomAccessCount+1 == roomAccessLength )
					{
						console.log( 'last' );
					}else{
						myRoomAccessCount++;
						getRoomInfo(myRoomAccessCount);
					}
					
				});
				
			});
			
		}
	}	
	
})();