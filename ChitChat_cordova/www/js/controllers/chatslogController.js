(function () {
    'use strict';

    angular
        .module('spartan.chatslog', [])
        .controller('chatslogController', chatslogController);

    chatslogController.$inject = ['$location', '$scope', '$timeout', 'roomSelected'];
			
	var roomAccess = [];
	var roomAccessLength = 0;
	var myRoomAccess = [];
	var myRoomAccessCount = 0;
	
    function chatslogController($location, $scope, $timeout, roomSelected) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'chatslogController';

        activate();

        function activate() { }
				
        $scope.$on('$ionicView.enter', function(){ 
            navShow();
		});

        var dataManager = main.getDataManager();
				
		$scope.myProfile = dataManager.myProfile;
		$scope.orgMembers = dataManager.orgMembers;
		$scope.roomAccess = [];
		getRoomAccess();
		var refresh = function () 
		{		
			$scope.roomAccess = myRoomAccess;
			console.log('reload');
		
			console.log(roomAccess);
			console.log(myRoomAccess);
			
			$timeout(refresh, 1000);
		} 
		$timeout(refresh, 1000);
		
		
		$scope.gotoChat = function (accessId) 
		{		
			var accessLength = myRoomAccess.length;
			for(var i=0; i<accessLength; i++)
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
							server.getPrivateChatRoomId(dataManager.myProfile._id, accessId, function result(err, res) {
								console.log(JSON.stringify(res));
								var room = JSON.parse(JSON.stringify(res.data));

								$scope.chat = function () {
									roomSelected.setRoom(room);
									location.href = '#/tab/chats/chat/' + room._id;
								};
								
								$scope.openViewContactProfile = function(id) {
									location.href = '#/tab/chats/member/' + id;
								}
							});
							break;
					}
				}
			}	
		};
    }
	
	function getRoomAccess()
	{
		console.log('getRoomAccess: ');
		
		roomAccess = dataManager.myProfile.roomAccess;
		roomAccessLength = roomAccess.length;
		
		getRoomInfo();
	}
	
	function getRoomInfo()
	{
		if( myRoomAccessCount < roomAccessLength )
		{
			console.log( 'wait: ' + myRoomAccessCount + '/' + roomAccessLength );	
			server.getRoomInfo(roomAccess[myRoomAccessCount]['roomId'], function(err, res){				
				if( res['code'] == 200 )
				{
					console.log( res['data']['_id'] );
					var data = res;
					myRoomAccess.push(data['data']);
					/*
					myRoomAccess[ res['data']['_id'] ] = {};
					myRoomAccess[ res['data']['_id'] ]['roomId'] = 'I';
					myRoomAccess[ res['data']['_id'] ]['accessTime'] = 'J';		
					*/				
				}
				
				if( myRoomAccessCount+1 == roomAccessLength )
				{
					console.log( 'last' );
				}else{
					myRoomAccessCount++;
					getRoomInfo(myRoomAccessCount);
				}	
			});
		}
	}	
})();