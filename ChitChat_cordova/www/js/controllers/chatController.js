angular.module('spartan.chat', [])

.controller('readers', function($scope, $ionicModal) {
  
})


.controller('chatController', function($rootScope, $scope, $timeout, $stateParams, $ionicScrollDelegate, $ionicModal, $sce, Chats, roomSelected) 
{    		
    var currentRoom = roomSelected.getRoom();
    var myprofile = main.getDataManager().myProfile;
    var allMembers = main.getDataManager().orgMembers;
    
    $scope.chat = [];
    //<!-- Set up roomname for display title of chatroom.
    var roomName = currentRoom.name;
    if (!roomName || roomName === "") {
        if (currentRoom.type === RoomType.privateChat) {
            currentRoom.members.some(function iterator(member) {
                if (member.id !== myprofile._id) {
                    currentRoom.name = allMembers[member.id].displayname;
                    return true;
                }
            });
        }
    }
	$scope.title = currentRoom.name;	
    //console.log(main.dataManager.getMyProfile())
	//console.debug("chatController", currentRoom.name, currentRoom._id);
	
	modalcount = 0;	
	// Modal - Chat menu 
	$scope.openModal = function() {
		modalcount++;
		$scope.modal.show();
		$('#chatMessage').animate({'bottom':'272px'}, 350);
		$('#chatDetail').animate({'top':'-272px'}, 350);
	};
	
	// Modal - Sticker
	$scope.openModalSticker = function() {
		modalcount++;
		$scope.modalSticker.show();
	};
	$scope.sendSticker = function(sticker) {
		chatRoomApi.chat(currentRoom._id, "*", myprofile._id, sticker, "Sticker", function(err, res) {
			if (err || res === null) {
				console.warn("send message fail.");
			}
			else {
				console.log("send message:", res);
			}
		});
		
		$scope.modalSticker.hide();
		$scope.modal.hide();
	}
	
	// Modal - Webview 
	$scope.openModalWebview = function() {
		modalcount++;
		$scope.modalWebview.show();
	};
	$scope.closeModalWebview = function() {
		$scope.modalWebview.hide();
	};
	
	// Modal Hidden		 
	$scope.$on('modal.hidden', function() {
		modalcount--;
		
		if( modalcount == 1 )
		{
			$scope.modal.hide();			
		}
		$('#chatMessage').animate({'bottom':'0'}, 350);
		$('#chatDetail').animate({'top':'0'}, 350);		
	});
	$scope.openReaderModal = function() {
		$scope.readerViewModal.show();
	};
	$scope.closeReaderModal = function() {
		$scope.readerViewModal.hide();
	};
	
	// WebView
	$scope.webview = function(uri){
		http = '';
		if( uri.substr(0, 3) == 'www' || uri.substr(0, 3) == 'ftp' )
			http = 'http://';
		http += uri;
		//window.open(http, '_blank');
		
		//window.open(encodeURI(http), '_blank', 'location=yes');
		
		//$scope.webviewUrl = 'http://www.google.com';
		$scope.webviewUrl = $sce.trustAsResourceUrl(http);
		$scope.webviewTitle = uri;
		$scope.openModalWebview();
	};
		
		$("#modal-webview-iframe").on('load',function() {
			alert( $(this).contentDocument.title );
		});
	

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
		if( currentRoom != null )
		{
			// localStorage.removeItem(myprofile._id+'_'+currentRoom);
			// localStorage.setItem(myprofile._id+'_'+currentRoom, JSON.stringify(chatRoomControl.chatMessages));
			console.info('update with timeout fired');
			$scope.chat = Chats.all();
			
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
    $scope.video = function(){
        $scope.$broadcast('captureVideo', 'captureVideo');
    }

	// Recivce ImageUri from Gallery then send to other people
	$scope.$on('fileUri', function(event, args) {
		if(args[1] == "Image"){
			$scope.chat.push( {"rid":currentRoom._id,"type":"Image","body":cordova.file.dataDirectory + args[0],"sender":myprofile._id,"_id":args[0],"temp":"true"});
		}else if(args[1] == "Voice"){
			$scope.chat.push( {"rid":currentRoom._id,"type":"Voice","body":cordova.file.documentsDirectory + args[0],"sender":myprofile._id,"_id":args[0],"temp":"true"});
		}else if(args[1] == "Video"){
			$scope.chat.push( {"rid":currentRoom._id,"type":"Video","body":cordova.file.tempDirectory + args[0],"sender":myprofile._id,"_id":args[0],"temp":"true"});
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
		}else if(args[2]=="Video"){
			chatRoomApi.chat(currentRoom._id, "*", myprofile._id, args[0], ContentType[ContentType.Video], function(err, res) {
				if (err || res === null) {
					console.warn("send message fail.");
				}
				else {
					console.log("send message:", JSON.stringify(res));
				}
			});
		}
		$.each($scope.chat, function(index, value){
			//console.log(value._id,args[1]);
			if(value._id == args[1]) { $scope.chat[index] = new Object; }
		});
	});

	$scope.viewReader = function (readers) {
		var members = [];
		async.eachSeries(readers, function iterator(item, cb) {
			var member = dataManager.orgMembers[item];
			members.push(member);
			cb();
		}, function done(err) {
			$scope.readers = members;
			$scope.openReaderModal();
		});
	}
    
    $scope.openMap = function() {
        console.log("map");
		location.href='#/tab/group/chat/'+currentRoom._id+'/map';
    }
	
	$scope.isValidURI = function(uri) {
		if( uri.substr(0, 3) == 'www' || uri.substr(0, 4) == 'http' || uri.substr(0, 3) == 'ftp' )
			if( uri.split(".").length > 2 && uri.split(".")[1] != '' && uri.split(".")[2] != '' )
				return true;
		
		return false;
	};
	
	// ON ENTER 
    $scope.$on('$ionicView.enter', function(){ //This is fired twice in a row
        console.log("App view (menu) entered.");
		
		$ionicScrollDelegate.$getByHandle('mainScroll').scrollBottom();
			
		// Reload Modal - Chat menu
		$ionicModal.fromTemplateUrl('templates/modal-chatmenu.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			$scope.modal = modal;
		})
		
		// Reload Modal - Sticker
		$ionicModal.fromTemplateUrl('templates/modal-sticker.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			$scope.modalSticker = modal;
		})
		
		// Reload Modal - WebView
		$ionicModal.fromTemplateUrl('templates/modal-webview.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			$scope.modalWebview = modal;
		})
		
		// Reader view modal.
		$ionicModal.fromTemplateUrl('templates/reader-view.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			$scope.readerViewModal = modal;
		});
    });

	// ON LEAVE
    $scope.$on('$ionicView.leave', function(){ //This just one when leaving, which happens when I logout
        console.log("App view (menu) leaved.");
				
		$('#send_message').css({ 'display': 'none' });
		chatRoomControl.leaveRoom(currentRoom._id, function callback(err, res) {
			localStorage.removeItem(myprofile._id + '_' + currentRoom._id);
			localStorage.setItem(myprofile._id + '_' + currentRoom._id, JSON.stringify(chatRoomControl.chatMessages));
			console.warn("save", currentRoom.name, JSON.stringify(chatRoomControl.chatMessages));

			currentRoom = null;
			roomSelected.setRoom(currentRoom);
			chatRoomControl.chatMessages = [];
			main.dataListener.removeListener(chatRoomControl);
		});
    });
});