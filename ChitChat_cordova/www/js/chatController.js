angular.module('spartan.chat', [])

.controller('readers', function($scope, $ionicModal) {
  
})


.controller('chatController', function($rootScope, $scope, $timeout, $stateParams, $ionicScrollDelegate, $ionicModal, Chats) 
{    
    $scope.openModal = function() {
      $scope.modal.show();
    }

    $scope.closeModal = function() {
      $scope.modal.hide();
    };

    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
	
	
	$ionicModal.fromTemplateUrl('templates/reader-view.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modal = modal;
	});
	$scope.openModal = function() {
		$scope.modal.show();
	};
	$scope.closeModal = function() {
		$scope.modal.hide();
	};
	//Cleanup the modal when we're done with it!
	$scope.$on('$destroy', function() {
		$scope.modal.remove();
	});
	// Execute action on hide modal
	$scope.$on('modal.hidden', function() {
		// Execute action
	});
	// Execute action on remove modal
	$scope.$on('modal.removed', function() {
		// Execute action
  });
	
	
	
	$scope.chat = [];
	$scope.title = currentRoom.name;
	
    //console.log(main.dataManager.getMyProfile())

	var chatRoomControl = new ChatRoomController(main, currentRoom._id);
	main.dataListener.addListenerImp(chatRoomControl);
	var chatRoomApi = main.getChatRoomApi();
	chatRoomControl.serviceListener = function (event, newMsg) {
	    if (event === "onChat") {
	        Chats.set(chatRoomControl.chatMessages);

	        if (newMsg.sender !== main.dataManager.myProfile._id) {
	            chatRoomApi.updateMessageReader(newMsg._id, currentRoom._id);
	        }
	    }
	    else if (event === "onMessageRead") {
	        Chats.set(chatRoomControl.chatMessages);
	    }
    }
    chatRoomControl.getMessage(currentRoom._id, Chats, function () {
        Chats.set(chatRoomControl.chatMessages);
    });
     
    var countUp = function () {		
		if( currentRoom != '' )
		{
			// localStorage.removeItem(myprofile._id+'_'+currentRoom);
			// localStorage.setItem(myprofile._id+'_'+currentRoom, JSON.stringify(chatRoomControl.chatMessages));
			// console.log('update with timeout fired');
			$scope.chat = Chats.all();
			console.log( 'Refresh! by timeout fired...', Chats.all().length);
			
			//$ionicScrollDelegate.$getByHandle('mainScroll').scrollBottom(); // Scroll to bottom
			//console.log( $ionicScrollDelegate.$getByHandle('mainScroll').getScrollPosition().top ); // get all scroll position
			//console.log( $('#main-chat .scroll').height() ); // Max scroll

			scrolling = $ionicScrollDelegate.$getByHandle('mainScroll').getScrollPosition().top;
			maxscroll = ($('#main-chat .scroll').height() - $('#main-chat').height());
			
			if( scrolling-5 <= maxscroll && scrolling+5 >= maxscroll )
				$ionicScrollDelegate.$getByHandle('mainScroll').scrollBottom()
				
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
    //$('#chatroom_back').css({ 'display': 'inline-block' });
	
	// Send Message btn
	$('#sendMsg').click(function()
	{
	    var content = $('#send_message').val();
		if( content != '' )
		{
			// Clear Message
			$('#send_message').val('')
			
			main.encodeService(content, function(err, result) {
				if (err) {
					console.error(err);
				}
				else {
					//var myId = myprofile._id;
					chatRoomApi.chat(currentRoom._id, "*", myprofile._id, result, ContentType[ContentType.Text], function(err, res) {
						if (err || res === null) {
							console.warn("send message fail.");
						}
						else {
							console.log("send message:", res);
						}
					});
				}
			});
		}
	});

	$scope.voice = function(){
		if($('.ion-android-microphone').is(".recording")){
			$('.ion-android-microphone').removeClass("recording");
            $scope.$broadcast('stopRecord', 'stopRecord');
		}else{
			$('.ion-android-microphone').addClass("recording");
			$scope.$broadcast('startRecord', 'startRecord');
		}
	}
    $scope.image = function(){
        $scope.$broadcast('addImg', 'addImg');
    }

	// Recivce ImageUri from Gallery then send to other people
	$scope.$on('fileUri', function(event, args) {
		if(args[1] == "Image"){
			$scope.chat.push( {"rid":currentRoom._id,"type":"Image","body":cordova.file.dataDirectory + args[0],"sender":myprofile._id,"_id":args[0],"temp":"true"});
		}else if(args[1] == "Voice"){
			$scope.chat.push( {"rid":currentRoom._id,"type":"Voice","body":cordova.file.documentsDirectory + args[0],"sender":myprofile._id,"_id":args[0],"temp":"true"});
		}
		
	});
	// Send Image and remove temp Image
	$scope.$on('fileUrl', function(event,args){
		if(args[2]=="Image"){
			chatRoomApi.chat(currentRoom._id, "*", myprofile._id, args[0], ContentType[ContentType.Image], function(err, res) {
				if (err || res === null) {
					console.warn("send message fail.");
				}
				else {
					console.log("send message:", JSON.stringify(res));
				}
			});
		}else if(args[2]=="Voice"){
			chatRoomApi.chat(currentRoom._id, "*", myprofile._id, args[0], ContentType[ContentType.Voice], function(err, res) {
				if (err || res === null) {
					console.warn("send message fail.");
				}
				else {
					console.log("send message:", JSON.stringify(res));
				}
			});
		}
		$.each($scope.chat, function(index, value){
			console.log(value._id,args[1]);
			if(value._id == args[1]) { $scope.chat[index] = new Object; }
		});
	});

	$scope.viewReader = function (readers) {
	    readers.forEach(function iterator(member) {
	        console.log(JSON.stringify(dataManager.orgMembers[member]));
	    });
	}
	
    $scope.$on('$ionicView.enter', function(){ //This is fired twice in a row
        console.log("App view (menu) entered.");
        console.log(arguments); 
		
		$ionicScrollDelegate.$getByHandle('mainScroll').scrollBottom();
			
		$ionicModal.fromTemplateUrl('templates/modal-chatmenu.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			$scope.modal = modal
		})
    });

    $scope.$on('$ionicView.leave', function(){ //This just one when leaving, which happens when I logout
        console.log("App view (menu) leaved.");
        console.log(arguments);
				
		$('#send_message').css({ 'display': 'none' });
		chatRoomControl.leaveRoom(currentRoom._id, function callback(err, res) {
			localStorage.removeItem(myprofile._id + '_' + currentRoom._id);
			localStorage.setItem(myprofile._id + '_' + currentRoom._id, JSON.stringify(chatRoomControl.chatMessages));
			console.warn("save", currentRoom.name, JSON.stringify(chatRoomControl.chatMessages));

			currentRoom = "";
			chatRoomControl.chatMessages = [];
			main.dataListener.removeListener(chatRoomControl);
		});
    });
	
});