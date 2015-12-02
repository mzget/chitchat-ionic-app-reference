/// <reference path="../bootstrap.js" />
angular.module('spartan.chat', [])

.controller('chatController', function ($scope, $timeout, $stateParams, $ionicScrollDelegate, $ionicLoading, $ionicModal,
	$sce, $cordovaGeolocation, $cordovaDialogs,
	Chats, roomSelected, Favorite, blockNotifications, localNotifyService, sharedObjectService)
{    		
	// Hide nav-tab # in chat detail
	$('#chatMessage').animate({'bottom':'0'}, 350);

	var currentRoom = roomSelected.getRoom();
	var myprofile = main.getDataManager().myProfile;
	var allMembers = main.getDataManager().orgMembers;
	var chatRoomApi = main.getChatRoomApi();
	var chatRoomComponent = new ChatRoomComponent(main, currentRoom._id);

	activate();

	function activate() {
		console.log("chatController is activate");

		addComponent();
	}

	function addComponent() {
		main.dataListener.addChatListenerImp(chatRoomComponent);
		sharedObjectService.unsubscribeGlobalNotifyMessageEvent();
		chatRoomComponent.serviceListener = function (event, newMsg) {
			if (event === "onChat") {
				Chats.set(chatRoomComponent.chatMessages);

				if (newMsg.sender !== main.dataManager.myProfile._id) {
					chatRoomApi.updateMessageReader(newMsg._id, currentRoom._id);
				}
			}
			else if (event === "onMessageRead") {
				Chats.set(chatRoomComponent.chatMessages);
			}
		}
		chatRoomComponent.notifyEvent = function (event, data) {
			if (event === ChatServer.ServerEventListener.ON_CHAT) {
				var appBackground = cordova.plugins.backgroundMode.isActive();
				sharedObjectService.getNotifyManager().notify(data, appBackground, localNotifyService);
			}
		};
		chatRoomComponent.getMessage(currentRoom._id, Chats, function (joinRoomRes) {
			Chats.set(chatRoomComponent.chatMessages);
			
			setTimeout(function () {
				$ionicLoading.hide();
			}, 1000);
			
			console.log(joinRoomRes);

			if (joinRoomRes.code !== HttpStatusCode.success) {
			    //<!-- Block user interface for this chat room.
			    blockUI(true);
			} else {
			    blockUI(false);
			}
		});
	}

	function leaveRoom() {
		chatRoomComponent.leaveRoom(currentRoom._id, function callback(err, res) {
			localStorage.removeItem(myprofile._id + '_' + currentRoom._id);
			localStorage.setItem(myprofile._id + '_' + currentRoom._id, JSON.stringify(chatRoomComponent.chatMessages));
			console.warn("save chat history", currentRoom.name);

			currentRoom = null;
			roomSelected.setRoom(currentRoom);
			chatRoomComponent.chatMessages = [];
			Chats.clear();
			main.dataListener.removeChatListenerImp(chatRoomComponent);
			sharedObjectService.regisNotifyNewMessageEvent();
		});
	}
	
	function blockUI(boo) {
		$scope.inactive = boo;
	}
	
	function sendMessageResponse(err, res) {
		if (!!err) {
			console.warn("send message fail.", err);
		}
		else if(res.code !== HttpStatusCode.success) {
			console.warn("send message fail:", JSON.stringify(res));
			blockUI(true);
		}
	}
	
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
	$scope.currentRoom = currentRoom;
	if($scope.currentRoom.type == RoomType.privateChat){
		$.each($scope.currentRoom.members, function(index, value){
			if(value.id != main.getDataManager().myProfile._id) { $scope.otherId = value.id; }
		});
	}
	
	modalcount = 0;	
	// Modal - Chat menu 
	$scope.openModal = function() {
		modalcount++;
		$scope.chatMenuModal.show();
		$('#chatMessage').animate({'bottom':'272px'}, 350);
		$('#chatDetail').animate({'top':'-272px'}, 350);
	};
	
	// Modal - Sticker
	$scope.openModalSticker = function() {
		modalcount++;
		$scope.modalSticker.show();
	};
	$scope.sendSticker = function(sticker) {
		chatRoomApi.chat(currentRoom._id, "*", myprofile._id, sticker, ContentType[ContentType.Sticker], sendMessageResponse);
		
		$scope.modalSticker.hide();
		$scope.chatMenuModal.hide();
	}
	// Modal - Audio Recorder

	$scope.openModalRecorder = function(){
		modalcount++;
		$scope.modalAudio.show();
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
			$scope.chatMenuModal.hide();			
		}
		$('#chatMessage').animate({'bottom':'0'}, 350);
		$('#chatDetail').animate({'top':'0'}, 350);

		if($('.audio-recorder').is(".recording")){
			$('.audio-recorder').removeClass("recording");
			$('.audio-recorder').addClass("unrecording");
			$scope.$broadcast('cancelRecord', 'cancelRecord');
		}		
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
	 
	var countUp = function () {		
		if( currentRoom != null )
		{
			// localStorage.removeItem(myprofile._id+'_'+currentRoom);
			// localStorage.setItem(myprofile._id+'_'+currentRoom, JSON.stringify(chatRoomControl.chatMessages));
			console.info('chatController: refresh view');
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
					chatRoomApi.chat(currentRoom._id, "*", myprofile._id, result, ContentType[ContentType.Text], sendMessageResponse);
				}
			});
		}
	});

	function sendLocation(locationObj) {
		chatRoomApi.chat(currentRoom._id, "*", myprofile._id, JSON.stringify(locationObj), ContentType[ContentType.Location], sendMessageResponse);
	}

	$scope.image = function(){
		$scope.$broadcast('addImg', 'addImg');
	}
	$scope.video = function(){
		$scope.$broadcast('captureVideo', 'captureVideo');
	}
	$scope.voice = function(){
		if($('.audio-recorder').is(".recording")){
			$('.audio-recorder').removeClass("recording");
			$('.audio-recorder').addClass("unrecording");
			$scope.$broadcast('stopRecord', 'stopRecord');
		}else{
			$('.audio-recorder').removeClass("unrecording");
			$('.audio-recorder').addClass("recording");
			$scope.$broadcast('startRecord', 'startRecord');
		}
	}
	
	// Recivce ImageUri from Gallery then send to other people
	$scope.$on('fileUri', function(event, args) {
		if(args[1] == ContentType[ContentType.Image] ){
			$scope.chat.push( {"rid":currentRoom._id,"type":ContentType[ContentType.Image],"body":cordova.file.documentsDirectory + args[0],"sender":myprofile._id,"_id":args[0][0],"createTime": new Date(),"temp":"true"});
		}else if(args[1] == ContentType[ContentType.Voice] ){
			$scope.chat.push( {"rid":currentRoom._id,"type":ContentType[ContentType.Voice],"body":cordova.file.documentsDirectory + args[0],"sender":myprofile._id,"_id":args[0],"createTime": new Date(),"temp":"true"});
		}else if(args[1] == ContentType[ContentType.Video] ){
			$scope.chat.push( {"rid":currentRoom._id,"type":ContentType[ContentType.Video],"body":cordova.file.documentsDirectory + args[0],"sender":myprofile._id,"_id":args[0],"createTime": new Date(),"temp":"true"});
		}
		
	});
	// Send Image and remove temp Image
	$scope.$on('fileUrl', function(event,args){
		if(args[2]==ContentType[ContentType.Image]){
			chatRoomApi.chat(currentRoom._id, "*", myprofile._id, args[0], ContentType[ContentType.Image], sendMessageResponse);
		}else if(args[2]==ContentType[ContentType.Voice]){
			chatRoomApi.chat(currentRoom._id, "*", myprofile._id, args[0], ContentType[ContentType.Voice], sendMessageResponse);
		}else if(args[2]==ContentType[ContentType.Video]){
			chatRoomApi.chat(currentRoom._id, "*", myprofile._id, args[0], ContentType[ContentType.Video], sendMessageResponse);
		}
		$.each($scope.chat, function(index, value){
			if(value._id == args[1]) { 
				$scope.chat[index] = new Object; 
			}
		});
	});

	$scope.$on('delectTemp', function(event,args){
		$.each($scope.chat, function(index, value){
			if(value._id == args[0]) { 
				$scope.chat[index] = new Object; 
			}
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
	$scope.viewLocation = function (messageId) {
		console.info('viewLocation');
		var message = Chats.get(messageId);
		viewLocation($scope, message);
		$scope.mapViewModal.show();
	}
	$scope.openMap = function() {
		$scope.chatMenuModal.hide();
		$scope.openMapModal();
	}
	$scope.openMapModal = function() {
		callGeolocation($scope, $cordovaGeolocation, $ionicLoading, $cordovaDialogs, function (locationObj) {
			sendLocation(locationObj);
		});
		$scope.mapViewModal.show();
	};
	$scope.closeMapModal = function() {
		$scope.mapViewModal.hide();
	};
	
	$scope.isValidURI = function(uri) {
		if( uri.substr(0, 3) == 'www' || uri.substr(0, 4) == 'http' || uri.substr(0, 3) == 'ftp' )
			if( uri.split(".").length > 2 && uri.split(".")[1] != '' && uri.split(".")[2] != '' )
				return true;
		
		return false;
	};
	
	// ON ENTER 
	$scope.$on('$ionicView.enter', function(){ //This is fired twice in a row
		console.log("App view (menu) entered.");

		$ionicLoading.show({
			template: 'Loading..'
		});
		
		$ionicScrollDelegate.$getByHandle('mainScroll').scrollBottom();
			
		// Reload Modal - Chat menu
		$ionicModal.fromTemplateUrl('templates/modal-chatmenu.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			$scope.chatMenuModal = modal;
		})
		
		// Reload Modal - Sticker
		$ionicModal.fromTemplateUrl('templates/modal-sticker.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			$scope.modalSticker = modal;
		})

		$ionicModal.fromTemplateUrl('templates/modal-audio-recorder.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			$scope.modalAudio = modal;
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
		
		// Map modal view modal.
		$ionicModal.fromTemplateUrl('templates/map.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			$scope.mapViewModal = modal;
		});
		
		//Cleanup the modal when we're done with it!
		$scope.$on('$destroy', function () {
			$scope.chatMenuModal.remove();
			$scope.modalSticker.remove();
			$scope.modalAudio.remove();
			$scope.modalWebview.remove();
			$scope.readerViewModal.remove();
			$scope.mapViewModal.remove();
		});
		// Execute action on hide modal
		$scope.$on('modal.hidden', function () {
			// Execute action
		});
		// Execute action on remove modal
		$scope.$on('modal.removed', function () {
			// Execute action
		});
	});

	// ON LEAVE
	$scope.$on('$ionicView.beforeLeave', function(){ //This just one when leaving, which happens when I logout
		console.log("chatController beforeLeave.");
				
		$('#send_message').css({ 'display': 'none' });

		leaveRoom();
	});

	$scope.editFavorite = function(editType,id,type){
		$ionicLoading.show({
			  template: 'Loading..'
		});
		if(type==RoomType.privateChat){
			server.updateFavoriteMember(editType,id,function (err, res) {
				if (!err && res.code==200) {
					console.log(JSON.stringify(res));
					Favorite.updateFavorite(editType,id,type);
					$ionicLoading.hide();
				}
				else {
					console.warn(err, res);
					$ionicLoading.hide();
				}
			});
		}else{
			server.updateFavoriteGroups(editType,id,function (err, res) {
				if (!err && res.code==200) {
					console.log(JSON.stringify(res));
					Favorite.updateFavorite(editType,id,type);
					$ionicLoading.hide();
				}
				else {
					console.warn(err, res);
					$ionicLoading.hide();
				}
			});
		}
	}
	$scope.editBlockNoti = function(editType,id,type){
		$ionicLoading.show({
			  template: 'Loading..'
		});
		if(type==RoomType.privateChat){
			server.updateClosedNoticeMemberList(editType,id,function (err, res) {
				if (!err && res.code==200) {
					console.log(JSON.stringify(res));
					blockNotifications.updateBlockNoti(editType,id,type);
					$ionicLoading.hide();
				}
				else {
					console.warn(err, res);
					$ionicLoading.hide();
				}
			});
		}else{
			server.updateClosedNoticeGroupsList(editType,id,function (err, res) {
				if (!err && res.code==200) {
					console.log(JSON.stringify(res));
					blockNotifications.updateBlockNoti(editType,id,type);
					$ionicLoading.hide();
				}
				else {
					console.warn(err, res);
					$ionicLoading.hide();
				}
			});
		}
	}
	$scope.isFavorite = function(id){
		return Favorite.isFavorite(id);
	}
	$scope.isBlockNoti = function(id){
		return blockNotifications.isBlockNoti(id);
	}        
});

var viewLocation = function ($scope, message, $ionicLoading) {
	$scope.viewOnly = true;
	$scope.place = message.locationName;
	$scope.$broadcast('onInitMap', { lat: message.lat, long: message.long });
}

var callGeolocation = function ($scope, $cordovaGeolocation, $ionicLoading, $cordovaDialogs, done) {
	var locationObj = new MinLocation();
	$scope.viewOnly = false;
	$scope.place = "";
	$scope.selectedPlace = function (place) {
		console.debug('onSelectMarker', place)
		$scope.place = place.name;
		$scope.myLocation = place;
	};

	$scope.share = function () {
		if (!$scope.place) {
			$cordovaDialogs.alert('Missing place information', 'Share location', 'OK')
			   .then(function () {
				   // callback success
			   });

			return;
		}

		locationObj.name = $scope.myLocation.name;
		locationObj.address = $scope.myLocation.vicinity;
		done(locationObj);
		$scope.closeMapModal();
	}
	
	$ionicLoading.show({
	  template: 'Getting current location...'
	});

	var posOptions = { timeout: 10000, enableHighAccuracy: false };
	$cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
		locationObj.latitude = position.coords.latitude;
		locationObj.longitude = position.coords.longitude;
		
		$scope.$broadcast('onInitMap', { lat: position.coords.latitude, long: position.coords.longitude });
		
		$ionicLoading.hide();
	}, function (err) {
		// error
		console.error(err);
		
		$ionicLoading.hide();

		$cordovaDialogs.alert('Get your current position timeout.', 'Location Fail.', 'OK')
		.then(function () {
			$scope.closeMapModal();
		});
	});
}