var myprofile;
var date = new Date();
var now;
var newchatmessage;
var allMembers;

angular.module('spartan.controllers', [])

.controller("LoginCtrl", function ($scope) {
    console.warn('LoginCtrl');

    $scope.confirmDialog = function () {
        navigator.notification.confirm("Checkout this confirmation dialog", function (buttonIndex) {
            switch (buttonIndex) {
                case 1:
                    console.log("Decline Pressed");
                    break;
                case 2:
                    console.log("Dont Care Pressed");
                    break;
                case 3:
                    console.log("Accept Pressed");
                    break;
            }
        }, "Our Title", ["Decline", "Dont Care", "Accept"]);
    }
})

// GROUP
.controller('GroupCtrl', function($rootScope, $scope, $timeout, roomInfo) 
{	
	var currentRoom = roomInfo.getRoom();
	
	$scope.$on('$ionicView.enter', function(){ 
		$rootScope.hideTabs = false;
	});
	
    myprofile = main.getDataManager().myProfile;
    $scope.myProfile = myprofile;
	$scope.orgGroups = main.getDataManager().orgGroups;
	$scope.pjbGroups = main.getDataManager().projectBaseGroups;
	$scope.pvGroups = main.getDataManager().privateGroups;
	$scope.chats = main.getDataManager().orgMembers;
	
    var reload = function () {		
		if(currentRoom != null)
		{	
			myprofile = main.getDataManager().myProfile;
			$scope.myProfile = myprofile;
			$scope.orgGroups = main.getDataManager().orgGroups;
			$scope.pjbGroups = main.getDataManager().projectBaseGroups;
			$scope.pvGroups = main.getDataManager().privateGroups;
			allMembers = main.getDataManager().orgMembers;
			$scope.chats = allMembers;

			$timeout(reload, 1000);
		}
    }
    $timeout(reload, 1000);

	//$scope.chats = Chats.all();
	$scope.remove = function(chat) {
		Chats.remove(chat);
	};		
	
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
	
	$scope.hideTab = function(){		
		$rootScope.hideTabs = true;
	}
})

// GROUP - Profile
.controller('GroupMyprofileCtrl', function($scope) {
	$scope.chat = main.getDataManager().myProfile;
})

// Group - View Profile
.controller('GroupViewprofileCtrl', function($scope, $stateParams, $state, $cordovaProgress) {
	if($stateParams.chatId==main.getDataManager().myProfile._id){
		$scope.chat = main.getDataManager().myProfile;
		$scope.model = {
		    displayname: $scope.chat.displayname,
		    status: $scope.chat.status
		};
		$scope.title = "My Profile";
		$('#viewprofile-input-display').removeAttr('disabled');
		$('#viewprofile-input-status').removeAttr('disabled');
		$scope.edit = 'true';

		$scope.$on('fileUrl', function(event, url) { 
			if(url!=null){
				server.ProfileImageChanged($stateParams.chatId,url[0],function(err,res){
					main.getDataManager().myProfile.image = url[0];
					if(main.getDataManager().myProfile.displayname != $scope.model.displayname ||
						main.getDataManager().myProfile.status != $scope.model.status){
						saveProfile();
					}else saveSuccess();
				});
			}else{
				if(main.getDataManager().myProfile.displayname != $scope.model.displayname ||
						main.getDataManager().myProfile.status != $scope.model.status){
					saveProfile();
				}
			}
		});

		function saveProfile(){
			server.UpdateUserProfile($stateParams.chatId,$scope.model,function(err,res){
				console.log(JSON.stringify(res));
				main.getDataManager().myProfile.displayname = $scope.model.displayname;
				main.getDataManager().myProfile.status = $scope.model.status;
				saveSuccess();
			});
		}

		function saveSuccess(){
			$cordovaProgress.showSuccess(false, "Success!");
	    	setTimeout(function(){ $cordovaProgress.hide(); }, 1500);
		}

	}else{
    	var member = main.getDataManager().orgMembers[$stateParams.chatId];
		if(	member.firstname == null || member.firstname == "" &&
			member.lastname == null || member.lastname == "" &&
			member.mail == null || member.mail == "" && 
			member.role == null || member.role == "" &&
			member.tel == null || member.tel == ""){
			server.getMemberProfile($stateParams.chatId, function(err, res) {
				if (!err) {
					console.log(JSON.stringify(res));
					console.log(res["data"]);
					member.firstname = res["data"].firstname;
					member.lastname = res["data"].lastname;
					member.mail = res["data"].mail;
					member.role = res["data"].role;
					member.tel = res["data"].tel;
					$state.go($state.current, {}, {reload: true});
				}
				else {
					console.warn(err, res);
				}
			});
		}
		$scope.chat = main.getDataManager().orgMembers[$stateParams.chatId];
		$scope.model = {
		    displayname: $scope.chat.displayname,
		    status: $scope.chat.status
		};
		$scope.title = $scope.chat.displayname+"'s Profile";
		$('#viewprofile-input-display').attr('disabled','disabled');
		$('#viewprofile-input-status').attr('disabled','disabled');
		$scope.edit = 'false';
	}
})

.factory('getProfileMember',function(){
	var result;
	function _all(){

	}
})

// GROUP - Type
.controller('GroupProjectbaseCtrl', function($scope, $stateParams, roomInfo) {
	var room = main.getDataManager().projectBaseGroups[$stateParams.chatId];
	$scope.chat = room;
	
	members = main.getDataManager().projectBaseGroups[$stateParams.chatId].members;
	console.log('ALL GROUP MEMBERS : '+members.length);
	groupMembers(members, null, function done(members) {
		$scope.members = members;
	});
	$scope.members_length = members.length;
			
	$scope.toggle = function (chatId) {
		var currentRoom = main.getDataManager().projectBaseGroups[chatId];
		roomInfo.setRoom(currentRoom);
	    location.href = '#/tab/group/chat/' + chatId;
	};
})
.controller('GroupPrivateCtrl', function($scope, $stateParams, roomInfo) {
	$scope.chat = main.getDataManager().privateGroups[$stateParams.chatId];
	
	members = main.getDataManager().privateGroups[$stateParams.chatId].members;
	console.log('ALL GROUP MEMBERS : '+members.length);
	groupMembers(members, null, function done(members) {
		$scope.members = members;
	});
	$scope.members_length = members.length;
			
	$scope.toggle = function (chatId) {
	    var currentRoom = main.getDataManager().privateGroups[chatId];
		roomInfo.setRoom(currentRoom);
	    location.href = '#/tab/group/chat/' + chatId;
	};
})

.controller('GroupOrggroupsCtrl', function($scope, $stateParams, roomInfo) {	
	$scope.chat = main.getDataManager().orgGroups[$stateParams.chatId];
	
	members = main.getDataManager().orgGroups[$stateParams.chatId].members;
	console.log('ALL GROUP MEMBERS : ' + members.length);
	groupMembers(members, null, function done(members) {
		$scope.members = members;
	});
	$scope.members_length = members.length;
			
	$scope.toggle = function (chatId) {
	   	var currentRoom = main.getDataManager().orgGroups[chatId];
		roomInfo.setRoom(currentRoom);
	    location.href = '#/tab/group/chat/' + chatId;
	};
})
.controller('GroupDetailCtrl', function($scope, $stateParams, roomInfo) {
	$scope.chat = main.getDataManager().orgMembers[$stateParams.chatId];
	
	server.getPrivateChatRoomId(dataManager.myProfile._id, $stateParams.chatId, function result(err, res) {
		console.log(JSON.stringify(res));
		var room = JSON.parse(JSON.stringify(res.data));

		$scope.toggle = function () {
			roomInfo.setRoom(room);
			location.href = '#/tab/group/chat/' + room._id;
		};
	});
})

// GROUP - Type
.controller('GroupMembersCtrl', function($scope, $stateParams) {	
	$scope.chat = main.getDataManager().orgGroups[$stateParams.chatId];
	
	members = main.getDataManager().orgGroups[$stateParams.chatId].members;
	console.log('ALL GROUP MEMBERS : '+members.length);
	groupMembers(members, members.length, function done(members) {
		$scope.members = members;
	});
	$scope.members_length = members.length;
})

.controller('ChatsCtrl', function($scope) {
	// With the new view caching in Ionic, Controllers are only called
	// when they are recreated or on app start, instead of every page change.
	// To listen for when this page is active (for example, to refresh data),
	// listen for the $ionicView.enter event:
	//
	//$scope.$on('$ionicView.enter', function(e) {
	//});

	$scope.roomAccess = myprofile.roomAccess;
})

.controller('FreecallCtrl', function($scope, $stateParams) {
	
})

.controller('AccountCtrl', function($scope) {
	$scope.settings = {
		logOut: true,
	};
})

.controller('AccountCreate',function($scope) {
    $scope.images = "http://placehold.it/50x50";
})

.controller('ImageController', function($scope, $ionicPlatform, $ionicActionSheet, $ionicLoading, $cordovaProgress, ImageService, FileService) {
 
  	$ionicPlatform.ready(function() {
    	$scope.images = FileService.images();
    	if (!$scope.$$phase) { $scope.$apply(); }
  	});

  	$scope.$on('addImg', function(event, args) { $scope.addImg(); });

  	$scope.urlForImage = function(imageName) {
    	var trueOrigin = cordova.file.dataDirectory + imageName;
    	return trueOrigin;
  	}
 
	$scope.addImg = function() {
	    $scope.hideSheet = $ionicActionSheet.show({
	      buttons: [
	        { text: 'Take photo' },
	        { text: 'Photo from library' }
	      ],
	      titleText: 'Add images',
	      cancelText: 'Cancel',
	      buttonClicked: function(index) {
	        $scope.addImage(index);
	      }
	    });
	}
 
  	$scope.addImage = function(type) {
    	$scope.hideSheet();
    	ImageService.handleMediaDialog(type).then(function() { 
    		$scope.$apply(); 
    		$scope.$emit('fileUri',[FileService.getImages(),"Image"]);
    		$scope.uploadImg();
    	});
  	}

  	$scope.uploadImg = function() {
  		if(FileService.getImages().length==0) { $scope.$emit('fileUrl',null,"Image"); return; }
	    var imageURI = cordova.file.dataDirectory + FileService.getImages();
	    var options = new FileUploadOptions();
	    options.fileKey = "fileToUpload";
	    options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
	    options.mimeType = "image/jpeg";
	    var params = new Object();
	    options.params = params;
	    options.chunkedMode = false;
	    var ft = new FileTransfer();
	    ft.onprogress = function(progressEvent){
	    	if (progressEvent.lengthComputable) {
		      $ionicLoading.show({
			      template: 'Uploading ' + (Math.round(progressEvent.loaded / progressEvent.total * 100)).toFixed(0) + '%'
			  });
		    } else {
		      //loadingStatus.increment();
		    }
	    };
	    ft.upload(imageURI, "http://stalk.animation-genius.com/?r=api/upload", win, fail,
	        options);
	}

	function win(r) {
	    console.log("Code = " + r.responseCode);
	    console.log("Response = " + r.response);
	    console.log("Sent = " + r.bytesSent);
	    $ionicLoading.hide();
	    $scope.$emit('fileUrl', [r.response,FileService.getImages(),"Image"]);
	    FileService.clearImages();
	}

	function fail(error) {
	    alert("An error has occurred: Code = " + error.code);
	    console.log("upload error source " + error.source);
	    console.log("upload error target " + error.target);
	    $cordovaProgress.showText(false, "Fail!", 'center');
	    setTimeout(function(){ $cordovaProgress.hide(); }, 1500);
	}
})
.controller('VoiceController', function($scope, $ionicLoading, $cordovaProgress, GenerateID) {

	$scope.$on('startRecord', function(event, args) { $scope.startRecord(); });
	$scope.$on('stopRecord', function(event, args) { $scope.stopRecord(); });

    var fileName;
	var src;
	var mediaRec;
	$scope.playing = 'false';

	$scope.startRecord = function() {
        fileName = GenerateID.makeid();
		src = "documents://"+ fileName + ".wav";
	    mediaRec = new Media(src,
	        function() { console.log("recordAudio():Audio Success"); },
	        function(err) { console.log("recordAudio():Audio Error: "+ err.code); 
	    });
	    mediaRec.startRecord();
	}

	$scope.stopRecord = function(){
		mediaRec.stopRecord();
		$scope.$emit('fileUri',[fileName + ".wav","Voice"]);
		$scope.uploadVoice();
	}


	var audio;
	$scope.play = function(id,url){
		console.log(url);
		$('.ion-pause').css({ 'display': 'none' });
		$('.ion-play').css({ 'display': 'inline' });
		$('#' + id + '-voice-play').css({ 'display': 'none' });
		$('#' + id + '-voice-pause').css({ 'display': 'inline' });
		audio = new Media(url,
                         function() { $('#' + id + '-voice-play').css({ 'display': 'inline' }); $('#' + id + '-voice-pause').css({ 'display': 'none' }); },
                         function(err){ console.log("playAudio(): Error: "+ err.code) }
                         );
		audio.play();
	}
	$scope.pause = function(id){
		$('#' + id + '-voice-play').css({ 'display': 'inline' });
		$('#' + id + '-voice-pause').css({ 'display': 'none' });
		audio.stop();
	}

	$scope.uploadVoice = function() {
	    var voiceURI = cordova.file.documentsDirectory + fileName + ".wav";
        console.log(voiceURI);
	    var options = new FileUploadOptions();
	    options.fileKey = "fileToUpload";
	    options.fileName = voiceURI.substr(voiceURI.lastIndexOf('/') + 1);
	    options.mimeType = "audio/wav";
	    var params = new Object();
	    options.params = params;
	    options.chunkedMode = false;
	    var ft = new FileTransfer();
	    ft.onprogress = function(progressEvent){
	    	if (progressEvent.lengthComputable) {
		      $ionicLoading.show({
			      template: 'Uploading ' + (Math.round(progressEvent.loaded / progressEvent.total * 100)).toFixed(0) + '%'
			  });
		    } else {
		      //loadingStatus.increment();
		    }
	    };
	    ft.upload(voiceURI, "http://stalk.animation-genius.com/?r=api/upload", win, fail,
        options);
	}

	function win(r) {
	    console.log("Code = " + r.responseCode);
	    console.log("Response = " + r.response);
	    console.log("Sent = " + r.bytesSent);
	    $ionicLoading.hide();
        $scope.$emit('fileUrl', [r.response,fileName + ".wav","Voice"]);
	}

	function fail(error) {
	    alert("An error has occurred: Code = " + error.code);
	    console.log("upload error source " + error.source);
	    console.log("upload error target " + error.target);
	    $cordovaProgress.showText(false, "Fail!", 'center');
	    setTimeout(function(){ $cordovaProgress.hide(); }, 1500);
	}

}); // <-- LAST CONTROLLER

function groupMembers(members, size, callback)
{
	var max = members.length;
	if( max > 5 )
		max = 5;
		
	if( size )
		max = size;
    var counter = 0;
	var gmember = [];
	var getGroupMembers = function() {
		for(var i = 0; i <= members.length; i++) {
			if(!!members[i]) {
				var mem_id = members[i].id;
				var member = main.getDataManager().orgMembers[mem_id];
				if(!!member) {
					gmember.push(member);
					counter += 1;
	
					if(counter >= max) { break; }
				}
			}
		}
		
		if(gmember.length === 0 && !dataManager.isOrgMemberReady) {
			waitForOrgMembers();
		}
		else {
			callback(gmember);
		}
	}
	var waitForOrgMembers = function() {
		setTimeout(function() {
			getGroupMembers();
		}, 500);
	}
	
	if(dataManager.isOrgMemberReady) {
		getGroupMembers();
	}
	else {
		waitForOrgMembers();
	}
}

function back()
{
	//$('#send_message').css({'display':'none'});
	//$('#chatroom_back').css({'display':'none'});
}


function testfunc()
{
	return 'tabs-item-hide';
}
