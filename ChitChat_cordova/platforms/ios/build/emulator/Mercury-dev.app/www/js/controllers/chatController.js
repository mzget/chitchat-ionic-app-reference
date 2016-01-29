/// <reference path="../bootstrap.js" />
angular.module('spartan.chat', [])

.controller('chatController', 
function ($scope, $timeout, $stateParams, $rootScope, $state, $ionicScrollDelegate, $ionicPopup, $ionicPopover, $ionicLoading, $ionicModal,
	$sce, $cordovaGeolocation, $cordovaDialogs,
    chatRoomService, roomSelected, Favorite, blockNotifications, localNotifyService, sharedObjectService, networkService)
{    		
	// Hide nav-tab # in chat detail
	$('#chatMessage').animate({'bottom':'0'}, 350);

	var self = this;
	self.title = 'chatController';
    
	var myprofile = main.getDataManager().myProfile;
	var allMembers = main.getDataManager().orgMembers;
	var chatRoomApi = main.getChatRoomApi();

	$scope.allMembers = allMembers;
	$scope.myprofile = myprofile;

	function activate() {
	    console.log(self.title + " is activate");

		self.currentRoom = roomSelected.getRoom();

		//<!-- Set up roomname for display title of chatroom.
		var roomName = self.currentRoom.name;
		if (!roomName || roomName === "") {
			if (self.currentRoom.type === RoomType.privateChat) {
				self.currentRoom.members.some(function iterator(member) {
					if (member.id !== myprofile._id) {
						self.currentRoom.name = allMembers[member.id].displayname;
						return true;
					}
				});
			}
		}

		$scope.currentRoom = self.currentRoom;
		if($scope.currentRoom.type == RoomType.privateChat){
			$.each($scope.currentRoom.members, function(index, value){
				if(value.id != main.getDataManager().myProfile._id) { $scope.otherId = value.id; }
			});
		}

		$scope.$on('onNewMessage', function (event, data) {
		    setTimeout(function () {
		        $ionicScrollDelegate.$getByHandle('mainScroll').scrollBottom(true);
		    }, 1000);
		});
		$scope.$on('onMessagesReady', function (event, data) {
		    $scope.chat = chatRoomService.all();

		    setTimeout(function () {
		        $ionicLoading.hide();
		        $ionicScrollDelegate.$getByHandle('mainScroll').scrollBottom(true);
		    }, 1000);
		});
		$scope.$on('onJoinRoomReady', function (event, data) {
		    chatRoomService.getChatRoomComponent().joinRoom(function cb(err, result) {
		        console.log("JoinRoom res:", JSON.stringify(result));

		        if (result.code !== HttpStatusCode.success) {
		            //<!-- Block user interface for this chat room.
		            blockUI(true);
		        } else {
		            blockUI(false);
		        }
		    });
		});
		
		chatRoomService.init();
		chatRoomService.getPersistendMessage(); 
	}

	function blockUI(boo) {
		$scope.inactive = boo;
	}

	function setupMenuItem() {
	    if (self.currentRoom.type != RoomType.privateChat) {
	        $ionicPopover.fromTemplateUrl('templates/popover-group.html', {
	            scope: $scope,
	        }).then(function (popover) {
	            $scope.popover = popover;
	        });
	    } else {
	        $ionicPopover.fromTemplateUrl('templates/popover-contact.html', {
	            scope: $scope,
	        }).then(function (popover) {
	            $scope.popover = popover;
	        });
	    }
	}

	$scope.viewProfile = function(){
	    $scope.popover.hide();
	    console.log(JSON.stringify($state.current));
	    if ($state.current.views.hasOwnProperty('tab-chats')) {
	        $state.go('tab.chats-chat-viewprofile', { chatId: $scope.otherId });
	    } else {
	        $state.go('tab.group-viewprofile', { chatId: $scope.otherId });
	    }
	}

	$scope.groupDetail = function(state){
		$scope.popover.hide();
		$rootScope.selectTab = state;
		if($state.current.views.hasOwnProperty('tab-chats')){
			$state.go('tab.chats-chat-members', { chatId: self.currentRoom._id });
		}else{
			$state.go('tab.group-members', { chatId: self.currentRoom._id });
		}
	}

	$scope.openPopover = function ($event) {
	    console.log("open popover:", JSON.stringify($event));

	    $scope.popover.show($event);
	};
	
	function sendMessageResponse(err, res) {
		if (!!err) {
			console.warn("send message fail.", err);
		}
		else if(res.code !== HttpStatusCode.success) {
			console.warn("send message fail:", JSON.stringify(res));
			blockUI(true);
		}
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
		chatRoomApi.chat(self.currentRoom._id, "*", myprofile._id, sticker, ContentType[ContentType.Sticker], sendMessageResponse);
		
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
		
	$("#modal-webview-iframe").on('load', function () {
	    alert($(this).contentDocument.title);
	});
	 
	var countUp = function () {		
		if( self.currentRoom != null )
		{
			// localStorage.removeItem(myprofile._id+'_'+currentRoom);
			// localStorage.setItem(myprofile._id+'_'+currentRoom, JSON.stringify(chatRoomControl.chatMessages));
			console.info('chatController: refresh view');
			$scope.chat = chatRoomService.all();
			
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
//	$timeout(countUp, 1000);
	
	//$('#send_message').css({ 'display': 'inline-block' });
	//$('#chatroom_back').css({ 'display': 'inline-block' });
	
	// Send Message btn
	$('#sendMsg').click(function()
	{
		var content = $('#send_message').val();
		if( content != '' )
		{
			// Clear Message
			$('#send_message').val('')
			
			if (server.appConfig.encryption == true) {
			    main.encodeService(content, function (err, result) {
			        if (err) {
			            console.error(err);
			        }
			        else {
			            chatRoomApi.chat(self.currentRoom._id, "*", myprofile._id, result, ContentType[ContentType.Text], sendMessageResponse);
			        }
			    });
			}
			else {
			    chatRoomApi.chat(self.currentRoom._id, "*", myprofile._id, content, ContentType[ContentType.Text], sendMessageResponse);
			}
		}
	});

	function sendLocation(locationObj) {
		chatRoomApi.chat(self.currentRoom._id, "*", myprofile._id, JSON.stringify(locationObj), ContentType[ContentType.Location], sendMessageResponse);
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
			$scope.chat.push( {"rid":self.currentRoom._id,"type":ContentType[ContentType.Image],"body":cordova.file.documentsDirectory + args[0],"sender":myprofile._id,"_id":args[0][0],"createTime": new Date(),"temp":"true"});
		}else if(args[1] == ContentType[ContentType.Voice] ){
			$scope.chat.push( {"rid":self.currentRoom._id,"type":ContentType[ContentType.Voice],"body":cordova.file.documentsDirectory + args[0],"sender":myprofile._id,"_id":args[0],"createTime": new Date(),"temp":"true"});
		}else if(args[1] == ContentType[ContentType.Video] ){
			$scope.chat.push( {"rid":self.currentRoom._id,"type":ContentType[ContentType.Video],"body":cordova.file.documentsDirectory + args[0],"sender":myprofile._id,"_id":args[0],"createTime": new Date(),"temp":"true"});
		}
	});
	// Send Image and remove temp Image
	$scope.$on('fileUrl', function(event,args){
		if(args[2]==ContentType[ContentType.Image]){
			chatRoomApi.chat(self.currentRoom._id, "*", myprofile._id, args[0], ContentType[ContentType.Image], sendMessageResponse);
		}else if(args[2]==ContentType[ContentType.Voice]){
			chatRoomApi.chat(self.currentRoom._id, "*", myprofile._id, args[0], ContentType[ContentType.Voice], sendMessageResponse);
		}else if(args[2]==ContentType[ContentType.Video]){
			chatRoomApi.chat(self.currentRoom._id, "*", myprofile._id, args[0], ContentType[ContentType.Video], sendMessageResponse);
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
	$scope.parseJSON= function(json){
		return JSON.parse(json);
	}
	$scope.viewLocation = function (messageId) {
		console.info('viewLocation');
		var message = chatRoomService.get(messageId);
		
		console.log(message);
		console.log(JSON.parse(message.body));
		
		viewLocation($scope, JSON.parse(message.body));
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
	
	function setupModals() {
	    // Reload Modal - Chat menu
	    $ionicModal.fromTemplateUrl('templates/modal-chatmenu.html', {
	        scope: $scope,
	        animation: 'slide-in-up'
	    }).then(function (modal) {
	        $scope.chatMenuModal = modal;
	    })

	    // Reload Modal - Sticker
	    $ionicModal.fromTemplateUrl('templates/modal-sticker.html', {
	        scope: $scope,
	        animation: 'slide-in-up'
	    }).then(function (modal) {
	        $scope.modalSticker = modal;
	    })

	    $ionicModal.fromTemplateUrl('templates/modal-audio-recorder.html', {
	        scope: $scope,
	        animation: 'slide-in-up'
	    }).then(function (modal) {
	        $scope.modalAudio = modal;
	    })

	    // Reload Modal - WebView
	    $ionicModal.fromTemplateUrl('templates/modal-webview.html', {
	        scope: $scope,
	        animation: 'slide-in-up'
	    }).then(function (modal) {
	        $scope.modalWebview = modal;
	    })

	    // Reader view modal.
	    $ionicModal.fromTemplateUrl('templates/reader-view.html', {
	        scope: $scope,
	        animation: 'slide-in-up'
	    }).then(function (modal) {
	        $scope.readerViewModal = modal;
	    });

	    // Map modal view modal.
	    $ionicModal.fromTemplateUrl('templates/map.html', {
	        scope: $scope,
	        animation: 'slide-in-up'
	    }).then(function (modal) {
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
	}

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

    // ON ENTER 
	$scope.$on('$ionicView.enter', function () { //This is fired twice in a row
	    console.log("App view (menu) entered.");

	    $ionicLoading.show({
	        template: 'Loading...'
	    });

	    activate();
	    setupMenuItem();
	    setupModals();
	});

    // ON LEAVE
	$scope.$on('$ionicView.beforeLeave', function () { //This just one when leaving, which happens when I logout
	    console.log(self.title + " beforeLeave.");

	    //$('#send_message').css({ 'display': 'none' });

	    chatRoomService.leaveRoom();
	});
});

var viewLocation = function ($scope, message, $ionicLoading) {
	$scope.viewOnly = true;
	$scope.place = message.name;
	$scope.$broadcast('onInitMap', { lat: message.latitude, long: message.longitude });
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
		console.warn(err);
        
		$ionicLoading.hide();

		$cordovaDialogs.alert(err.message, 'Location Fail.', 'OK')
		.then(function () {
			$scope.closeMapModal();
		      $ionicLoading.hide();
		});
	});
}