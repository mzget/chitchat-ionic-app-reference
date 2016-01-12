/// <reference path="../bootstrap.js" />
angular.module('spartan.chat', [])

.controller('chatController', function ($scope, $timeout, $stateParams, $rootScope, $state, $ionicScrollDelegate, $ionicPopup, $ionicPopover, $ionicLoading, $ionicModal,
	$sce, $cordovaGeolocation, $cordovaDialogs, Chats, roomSelected, Favorite, blockNotifications, localNotifyService, sharedObjectService)
{    		
	var current = window.location.href.split('/');
	webChatId = current.pop();
	
	if( typeof(dataManager.myProfile) != 'object' )
	{
		location.href = '';
	}

	var vm = this;
	vm.title = 'homeController';

	function activate() {

		localNotifyService.registerPermission();
		sharedObjectService.createNotifyManager(main);
		chatslogService.init();

		vm.dataListener = sharedObjectService.getDataListener();
		sharedObjectService.regisNotifyNewMessageEvent();
	}

	function onLeave() {
	
	}

	$scope.pullRefresh = function() {
		$scope.$broadcast('scroll.refreshComplete');
	}

	function getFavorite(){
		var favoriteArray = Favorite.getAllFavorite();
		var favorite = [];
		for (var x = 0; x < favoriteArray.length; x++) {
			try {
				if (main.getDataManager().orgGroups[favoriteArray[x]] !== undefined) favorite.push(main.getDataManager().orgGroups[favoriteArray[x]]);
				else if (main.getDataManager().projectBaseGroups[favoriteArray[x]] !== undefined) favorite.push(main.getDataManager().projectBaseGroups[favoriteArray[x]]);
				else if (main.getDataManager().privateGroups[favoriteArray[x]] !== undefined) favorite.push(main.getDataManager().privateGroups[favoriteArray[x]]);
				else if (main.getDataManager().orgMembers[favoriteArray[x]] !== undefined) {
					main.getDataManager().orgMembers[favoriteArray[x]].name = main.getDataManager().orgMembers[favoriteArray[x]].displayname;
					favorite.push(main.getDataManager().orgMembers[favoriteArray[x]]);
				}
			}
			catch (err) {
				//console.log(err);
			}
		}
		return favorite;
	}

	$scope.editFavorite = function(editType,id,type){
		$ionicLoading.show({
			  template: 'Loading..'
		});
		if(type==undefined){
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

	$scope.isFavorite = function(id){
		return Favorite.isFavorite(id);
	}
	
	$scope.$on('$ionicView.enter', function(){ 
		console.log("$ionicView.enter: ", vm.title);

		activate();

		$scope.refreshView = function () {
			console.debug("homeController : refreshView");

			var dataManager = main.getDataManager();

			$scope.myProfile = dataManager.myProfile;
			$scope.orgGroups = dataManager.orgGroups;
			$scope.pjbGroups = dataManager.projectBaseGroups;
			$scope.pvGroups = dataManager.privateGroups;
			$scope.chats = dataManager.orgMembers;
			$scope.favorites = getFavorite();
			
			$scope.$apply();
		};

		$scope.refreshView();

		$scope.interval = setInterval(function () { $scope.refreshView(); }, 1000);

		//<!-- My profile.
		$ionicModal.fromTemplateUrl('templates/modal-myprofile.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function (modal) {
			$scope.myProfileModal = modal;
		});
		//<!-- Org modal.
		$ionicModal.fromTemplateUrl('templates/modal-orggroup.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function (modal) {
			$scope.orgModal = modal;
		});
		//<!-- Projectbase modal.
		$ionicModal.fromTemplateUrl('templates/modal-projectbasegroup.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function (modal) {
			$scope.pjbModal = modal;
		});
		//<!-- Private group modal.
		$ionicModal.fromTemplateUrl('templates/modal-privategroup.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function (modal) {
			$scope.pvgModal = modal;
		});
		//<!-- Contact modal.
		$ionicModal.fromTemplateUrl('templates/modal-contact.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function (modal) {
			$scope.contactModal = modal;
		});

		//Cleanup the modal when we're done with it!
		$scope.$on('$destroy', function () {
			$scope.myProfileModal.remove();
			$scope.orgModal.remove();
			$scope.pjbModal.remove();
			$scope.pvgModal.remove();
			$scope.contactModal.remove();
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

	$scope.$on('$ionicView.beforeLeave', function () {
		console.log("beforeLeave: homeController");
	});

	$scope.$on('$ionicView.leave', function () {
		console.log("$ionicView.leave:", vm.title);
	});
	$scope.$on('$ionicView.unloaded', function () {
		console.log("$ionicView.unloaded:", vm.title);

		clearInterval($scope.interval);
		onLeave();
	});

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

	//<!-- My profile modal. -->
	$scope.openProfileModal = function (groupId) {
		initMyProfileModal($state, $scope, function done(){
			$scope.myProfileModal.show();
		});
	};
	$scope.closeProfileModal = function () {
		$scope.myProfileModal.hide();
	};
	//<!-- Org group modal ////////////////////////////////////////
	$scope.openModal = function(id,type){
		if(type==RoomType.organizationGroup){
			$scope.openOrgModal(id);
		}else if(type==RoomType.projectBaseGroup){
			$scope.openPjbModal(id);
		}else if(type==RoomType.privateGroup){
			$scope.openPvgModal(id);
		}else{
			$scope.openContactModal(id);
		}
	}
	$scope.openOrgModal = function (groupId) {
		initOrgModal($state, $scope, groupId, roomSelected, function () {
			$scope.orgModal.show();
		}, $rootScope);
	};
	$scope.closeOrgModal = function () {
		$scope.orgModal.hide();
	};
	//<!-- Project base group modal /////////////////////////////////////////
	$scope.openPjbModal = function (groupId) {
		initPjbModal($state, $scope, groupId, roomSelected, function () {
			$scope.pjbModal.show();
		}, $rootScope);
	};
	$scope.closePjbModal = function () {
		$scope.pjbModal.hide();
	}
	//<!-- Private group modal ////////////////////////////////////////////
	$scope.openPvgModal = function (groupId) {
		initPvgModal($state, $scope, groupId, roomSelected, function () {
			$scope.pvgModal.show();
		}, $rootScope);
	};
	$scope.closePvgModal = function () {
		$scope.pvgModal.hide();
	}
	//<!-- Contact modal -------------------------->
	$scope.openContactModal = function(contactId) {
		initContactModal($scope, contactId, roomSelected, function done() {
			$scope.contactModal.show();
		});
	};
	$scope.closeContactModal = function() {
		$scope.contactModal.hide();	
	};
		
		
		
		
		
		
		
		
	setInterval(function () { 				
		$('#login').css('display', 'none');
		$('.bar-stable').css({ 'display': '' });
		$('#splash').css({ 'display': 'none' });
	}, 1000);            
	
	var chatheight = $(window).height() - 43;
	$('ion-content').find('#webgroup').css({'height':chatheight+'px'});
	$('ion-content').find('#webchatdetail').css({'height':chatheight-44+'px'});
	
	$(window).bind("beforeunload", function() { 
		leaveRoom();
		return confirm("Do you really want to close?"); 
	})
	
	$scope.webhref = function (groupId) {
		//alert(groupId);		
		leaveRoom();	
		webChatId = groupId;
		
		initOrgModal($state, $scope, groupId, roomSelected, function () {
			setTimeout(function () {
                $state.go('tab.group');
			}, 1);
		}, $rootScope);
	};
	
	//alert(roomSelected.getRoom()._id);
	//initOrgModal($state, $scope, roomSelected.getRoom()._id, roomSelected, function(){}, $rootScope);
	
	$scope.profile = [];
	initOrgModal($state, $scope, roomSelected.getRoom()._id, roomSelected, function (){}, $rootScope);
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
		
		
	// Hide nav-tab # in chat detail
	$('#chatMessage').animate({'bottom':'0'}, 350);

	var self = this;

	
	$scope.chat = [];

	var myprofile = main.getDataManager().myProfile;
	var allMembers = main.getDataManager().orgMembers;
	var chatRoomApi = main.getChatRoomApi();

	function activate() {
		console.log("chatController is activate");

		self.currentRoom = roomSelected.getRoom();
		self.chatRoomComponent = new ChatRoomComponent(main, self.currentRoom._id);

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
		addComponent();
	}

	function addComponent() {
		main.dataListener.addChatListenerImp(self.chatRoomComponent);
		sharedObjectService.unsubscribeGlobalNotifyMessageEvent();
		self.chatRoomComponent.serviceListener = function (event, newMsg) {
			if (event === "onChat") {
				Chats.set(self.chatRoomComponent.chatMessages);

				if (newMsg.sender !== main.dataManager.myProfile._id) {
					chatRoomApi.updateMessageReader(newMsg._id, self.currentRoom._id);
				}
			}
			else if (event === "onMessageRead") {
				Chats.set(self.chatRoomComponent.chatMessages);
			}
		}
		self.chatRoomComponent.notifyEvent = function (event, data) {
			if (event === ChatServer.ServerEventListener.ON_CHAT) {
<<<<<<< HEAD
				//var appBackground = cordova.plugins.backgroundMode.isActive();
				//sharedObjectService.getNotifyManager().notify(data, appBackground, localNotifyService);
=======
                if(ionic.Platform.platform() === "ios") {
				    var appBackground = cordova.plugins.backgroundMode.isActive();
				    sharedObjectService.getNotifyManager().notify(data, appBackground, localNotifyService);
                }
                else {
                    sharedObjectService.getNotifyManager().notify(data, appBackground, localNotifyService);
                }
>>>>>>> 5cee833901c695e2e26286acb64e1ee041789cae
			}
		};
		self.chatRoomComponent.getMessage(self.currentRoom._id, Chats, function (joinRoomRes) {
		    console.log("getMessageHistory: completed", joinRoomRes.code);
		    $scope.chat = Chats.all();
			Chats.set(self.chatRoomComponent.chatMessages);
			
			setTimeout(function () {
				$ionicLoading.hide();
			}, 1000);

			if (joinRoomRes.code !== HttpStatusCode.success) {
			    //<!-- Block user interface for this chat room.
			    blockUI(true);
			} else {
			    blockUI(false);
			}
		});
	}

	function leaveRoom() {
		self.chatRoomComponent.leaveRoom(self.currentRoom._id, function callback(err, res) {
			localStorage.removeItem(myprofile._id + '_' + self.currentRoom._id);
			localStorage.setItem(myprofile._id + '_' + self.currentRoom._id, JSON.stringify(self.chatRoomComponent.chatMessages));
			console.warn("save chat history", self.currentRoom.name);

			self.currentRoom = null;
			roomSelected.setRoom(self.currentRoom);
			self.chatRoomComponent.chatMessages = [];
			Chats.clear();
			main.dataListener.removeChatListenerImp(self.chatRoomComponent);
			sharedObjectService.regisNotifyNewMessageEvent();
		});
		
		$('#webchatdetail').find('.message-list').empty();
	}

	$scope.openPopover = function($event) {
	    $scope.popover.show($event);
	};
	
	function blockUI(boo) {
		$scope.inactive = boo;
	}

	$scope.viewProfile = function(){
		$scope.popover.hide();
		console.log(JSON.stringify($state.current));
		if($state.current.views.hasOwnProperty('tab-chats')){
			$state.go('tab.chats-chat-viewprofile', { chatId: $scope.otherId });
		}else{
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
		
	$("#modal-webview-iframe").on('load',function() {
			alert( $(this).contentDocument.title );
		});
	 
	var countUp = function () {		
		if( self.currentRoom != null )
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
	
	//$('#send_message').css({ 'display': 'inline-block' });
	//$('#chatroom_back').css({ 'display': 'inline-block' });
	
	// Send Message btn
	$('ion-footer-bar').find('#sendMsg').click(function()
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
					chatRoomApi.chat(self.currentRoom._id, "*", myprofile._id, result, ContentType[ContentType.Text], sendMessageResponse);
				}
			});
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


	    activate();
		
		$ionicScrollDelegate.$getByHandle('mainScroll').scrollBottom();


		if(self.currentRoom.type!=RoomType.privateChat){
			$ionicPopover.fromTemplateUrl('templates/popover-group.html', {
			    scope: $scope,
			}).then(function(popover) {
			    $scope.popover = popover;
			});
		}else{
			$ionicPopover.fromTemplateUrl('templates/popover-contact.html', {
			    scope: $scope,
			}).then(function(popover) {
			    $scope.popover = popover;
			});
		}

			
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
				
		//$('#send_message').css({ 'display': 'none' });

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
		console.warn(err);
        
		$ionicLoading.hide();

		$cordovaDialogs.alert(err.message, 'Location Fail.', 'OK')
		.then(function () {
			$scope.closeMapModal();
		      $ionicLoading.hide();
		});
	});
}


var initOrgModal = function ($state, $scope, groupId, roomSelected, done, $rootScope) {
		var group = main.getDataManager().orgGroups[groupId];
		roomSelected.setRoom(group);
		$scope.profile = group;

		var members = group.members;
		$scope.members_length = members.length;
		groupMembers(members, null, function done(members) {
			$scope.members = members;
			$scope.$apply();
		});

		//<!-- Join chat room.
		$scope.toggle = function (chatId) {
			$scope.closeOrgModal();
			//       $state.go('', { chatId: chatId });
			location.href = '#/tab/group/chat/' + chatId;
		};

		$scope.viewGroupDetail = function (id) {
			$rootScope.selectTab = 'members';
			$state.go('tab.group-members', { chatId: id });
		};

		done();
	}

	var initPjbModal = function ($state, $scope, groupId, roomSelected, done, $rootScope) {
		var group = main.getDataManager().projectBaseGroups[groupId];
		roomSelected.setRoom(group);
		$scope.chat = group;

		var members = group.members;
		$scope.members_length = members.length;
		groupMembers(members, null, function done(members) {
			$scope.members = members;
			$scope.$apply();
		});

		$scope.toggle = function (chatId) {
			$scope.closePjbModal();
			location.href = '#/tab/group/chat/' + chatId;
		};

		$scope.viewGroupDetail = function (id) {
			$rootScope.selectTab = 'members';
			$state.go('tab.group-members', { chatId: id });
		};

		done();
	}

	var initPvgModal = function ($state, $scope, groupId, roomSelected, done, $rootScope) {
		var group = main.getDataManager().privateGroups[groupId];
		roomSelected.setRoom(group);
		$scope.group = group;

		var members = group.members;
		$scope.members_length = members.length;
		groupMembers(members, null, function done(members) {
			$scope.members = members;
			$scope.$apply();
		});

		$scope.chat = function (chatId) {
			$scope.closePvgModal();
			location.href = '#/tab/group/chat/' + chatId;
		};

		$scope.viewGroupDetail = function (id) {
			$rootScope.selectTab = 'members';
			$state.go('tab.group-members', { chatId: id });
		};

		done();
	}

	var initContactModal = function ($scope, contactId, roomSelected, done) {
		var contact = main.getDataManager().orgMembers[contactId];
		console.debug(contact);
		$scope.contact = contact;

		server.getPrivateChatRoomId(dataManager.myProfile._id, contactId, function result(err, res) {
			console.log(JSON.stringify(res));
			var room = JSON.parse(JSON.stringify(res.data));
			$scope.chat = function () {
				roomSelected.setRoom(room);
				location.href = '#/tab/group/chat/' + room._id;
			};

			$scope.openViewContactProfile = function (id) {
				location.href = '#/tab/group/member/' + id;
				//$state.go("tab.group-members", { chatId: id}, { inherit: false });
			}

			$scope.$apply();
		});

		done();
	}

	var initMyProfileModal = function ($state, $scope, done) {
		$scope.chat = main.getDataManager().myProfile;

		$scope.editProfile = function (chatId) {
			$state.go('tab.group-viewprofile', { chatId: chatId });
		};

		done();
	}
