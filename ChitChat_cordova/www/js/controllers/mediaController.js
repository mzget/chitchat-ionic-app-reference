angular.module('spartan.media', [])

.controller('ImageController', function($scope, $ionicPlatform, $ionicActionSheet, $ionicLoading, $cordovaProgress,$ionicModal, ImageService, FileService,roomSelected) {
 
  	$ionicPlatform.ready(function() {
    	$scope.images = FileService.images();
    	if (!$scope.$$phase) { $scope.$apply(); }
  	});

  	$scope.$on('addImg', function(event, args) { $scope.addImg(); });
  	$scope.$on('uploadImg', function(event, args) { $scope.uploadImg(); });

  	$scope.urlForImage = function(imageName) {
    	var trueOrigin = cordova.file.cacheDirectory + imageName;
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
    		//$scope.$apply(); 
    		$scope.$emit('fileUri',[FileService.getImages(),ContentType[ContentType.Image]]);
    		//$scope.uploadImg();
    	});
  	}

  	$scope.uploadImg = function() {
  		if(FileService.getImages().length==0) { $scope.$emit('fileUrl',null,"Image"); return; }
	    var imageURI = cordova.file.cacheDirectory + FileService.getImages();
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
	    ft.upload(imageURI, "http://203.113.25.44/?r=api/upload", win, fail,
	        options);

	}

	function win(r) {
	    console.log("Code = " + r.responseCode);
	    console.log("Response = " + r.response);
	    console.log("Sent = " + r.bytesSent);
	    $ionicLoading.hide();
	    $scope.$emit('fileUrl', [r.response,FileService.getImages(),ContentType[ContentType.Image]]);
	    FileService.clearImages();
	}

	function fail(error) {
	    alert("An error has occurred: Code = " + error.code);
	    console.log("upload error source " + error.source);
	    console.log("upload error target " + error.target);
	    $cordovaProgress.showText(false, "Fail!", 'center');
	    setTimeout(function(){ $cordovaProgress.hide(); }, 1500);
	}

		$ionicModal.fromTemplateUrl('templates/modal-image.html', function($ionicModal) {
	    	$scope.modalImage = $ionicModal;
	  	}, {
		    scope: $scope,
		    animation: 'slide-in-up'
	  	});
	

	$scope.viewImage = function(src){
		$scope.src = src;
		$scope.modalImage.show();
	}
	$scope.closeImage = function(){
		$scope.modalImage.hide();
	}

	$scope.uploadImage = function(id) {
		if(FileService.getImages().length!=0) { 
			var img = new UploadMedia(roomSelected.getRoom()._id, cordova.file.cacheDirectory + id, ContentType[ContentType.Image], function(id,messageId){
				$scope.$emit('delectTemp', [id]); 
			});
			mediaUpload[id] = img;
			mediaUpload[id].upload();
		}else{
			if(mediaUpload[id].hasOwnProperty('url')){
				$scope.$emit('delectTemp', [id]); 
			}else{
				document.getElementById( id + '-resend').classList.remove("hide");
			}
		}
	}

})
.controller('VideoController', function($scope, $cordovaCapture, $ionicLoading, $ionicActionSheet, $cordovaProgress,$cordovaFile,GenerateID,VideoService,roomSelected) {

	$scope.$on('captureVideo', function(event, args) { $scope.addVideo(); });

	var videoURI;
	var videoName;

	$scope.addVideo = function() {
	    $scope.hideSheet = $ionicActionSheet.show({
	      buttons: [
	        { text: 'Record Video' },
	        { text: 'Video from library' }
	      ],
	      titleText: 'Add video',
	      cancelText: 'Cancel',
	      buttonClicked: function(index) {
	      	if(index==0){ $scope.captureVideo(); }
	      	else{ 
	      		$scope.hideSheet();
	      		VideoService.handleMediaDialog().then(function() {
		    		videoURI = VideoService.getVideoUri();
		    		videoName = videoURI.substr(videoURI.lastIndexOf('/') + 1);
		    		$scope.$emit('fileUri',[videoName,ContentType[ContentType.Video]]);
		    	});
	      	}
	      }
	    });
	}

	$scope.captureVideo = function() {
		$scope.hideSheet();
	    var options = { limit: 1, duration: 15 };
	    $cordovaCapture.captureVideo(options).then(function(videoData) {
	    	console.log(videoData);
	      	moveVideoToTmp(videoData[0].localURL);
	    }, function(err) {
	      // An error occurred. Show a message to the user
	    });
	}

	function moveVideoToTmp(uri){
		videoName = GenerateID.makeid() + '.MOV';
		var name = uri.substr(uri.lastIndexOf('/') + 1);
        var namePath = uri.substr(0, uri.lastIndexOf('/') + 1);
        var namePathTrim = namePath.substring(0,namePath.length - 1);
        var folderFile = namePathTrim.substr(namePathTrim.lastIndexOf('/') + 1);
        
        $cordovaFile.moveFile(namePath,name,cordova.file.cacheDirectory,videoName)
        .then(function(success) {
        	console.log(success);
        	videoURI = cordova.file.cacheDirectory + videoName;
        	delectFolderTmp(folderFile);
          }, function(error) {
          	console.log(error);
          });
	}

	function delectFolderTmp(nameFolder){
		$cordovaFile.removeDir(cordova.file.tempDirectory, nameFolder)
	      .then(function (success) {
	        console.log(success);
	        $scope.$emit('fileUri',[videoName,"Video"]);
	      }, function (error) {
	        console.log(error);
	      });
	}
	$scope.uploadVideo = function(id) {
		if(videoName != null || videoName != undefined) { 
			var video = new UploadMedia(roomSelected.getRoom()._id, videoURI, ContentType[ContentType.Video], function(id,messageId){
				$scope.$emit('delectTemp', [id]); 
			});
			mediaUpload[id] = video;
			mediaUpload[id].upload();
		}else{
			if(mediaUpload[id].hasOwnProperty('url')){
				$scope.$emit('delectTemp', [id]); 
			}else{
				document.getElementById( id + '-resend').classList.remove("hide");
			}
		}
	}
	$scope.resend = function(uri,id){
		// var video = new UploadMedia( uri, ContentType[ContentType.Video], function(url,name,type) {
		// 	$scope.$emit('fileUrl', [url,name,type]);
		// });
		// mediaUpload[id] = video;
		// mediaUpload[id].upload();
	}
	$scope.sentCancel = function(id){
		mediaUpload[id].cancel();
	}
})
.controller('VoiceController', function($scope, $ionicLoading, $cordovaProgress, $timeout, $cordovaFileTransfer, $cordovaFile, GenerateID,roomSelected) {

	$scope.$on('startRecord', function(event, args) { $scope.startRecord(); });
	$scope.$on('stopRecord', function(event, args) { $scope.stopRecord(); });
	$scope.$on('cancelRecord', function(event, args) { $scope.cancelRecord(); });

    var fileName;
	var src;
	var mediaRec;

	$scope.startRecord = function() {
        fileName = GenerateID.makeid() + ".wav";
		src = "documents://"+ fileName;
	    mediaRec = new Media(src,
	        function() { console.log("recordAudio():Audio Success"); },
	        function(err) { console.log("recordAudio():Audio Error: "+ err.code); 
	    });
	    mediaRec.startRecord();
	}

	$scope.stopRecord = function(){
		mediaRec.stopRecord();
		$scope.$emit('fileUri',[fileName,ContentType[ContentType.Voice]]);
		//$scope.uploadVoice();
	}

	function cancelRecord(){
		mediaRec.stopRecord();
	}

	var audio;
	$scope.play = function(id,url){
		var fileName = url.substr(url.lastIndexOf('/') + 1);
		var fileMedia = url.replace('file://','');

		$('.ion-pause').css({ 'display': 'none' });
		$('.ion-play').css({ 'display': 'inline' });

		$cordovaFile.checkFile(cordova.file.documentsDirectory, fileName)
	      .then(function (success) {
			$('#' + id + '-voice-play').css({ 'display': 'none' });
			$('#' + id + '-voice-pause').css({ 'display': 'inline' });
			//audio.stop();
	        audio = new Media(fileMedia,
                         function() { $('#' + id + '-voice-play').css({ 'display': 'inline' }); $('#' + id + '-voice-pause').css({ 'display': 'none' }); },
                         function(err){ console.log("playAudio(): Error: "+ err.code) }
                         );
			audio.play();
	      }, function (error) {
	        downloadMedia(id,url);
	      });
	}
	$scope.pause = function(id){
		$('#' + id + '-voice-play').css({ 'display': 'inline' });
		$('#' + id + '-voice-pause').css({ 'display': 'none' });
		audio.stop();
	}

	function downloadMedia(id,media){
		var fileName = media.substr(media.lastIndexOf('/') + 1);
		var url = media;
	    var targetPath = cordova.file.documentsDirectory + fileName;
	    var trustHosts = true
	    var options = {};

	    $('#' + id + '-downloaded').removeClass('hide');

	    $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
	      .then(function(result) {
	        $('#' + id + '-downloaded').addClass('hide'); $scope.play(id,targetPath);
	      }, function(err) {
	        console.log(err,"ERROR");
	        $('#' + id + '-downloaded').removeClass('hide');
	      }, function (progress) {
	        $timeout(function () {
	          var downloadProgress = (progress.loaded / progress.total) * 100;
	          console.log(downloadProgress);
	          $('#' + id + '-download-progress').css({ 'width': downloadProgress+'%' });
	        })
	      });
	}

	$scope.uploadVoice = function(id) {
		if(fileName != null || fileName != undefined) { 
			var voice = new UploadMedia(roomSelected.getRoom()._id, cordova.file.documentsDirectory + id, ContentType[ContentType.Voice], function(id,messageId){
				$scope.$emit('delectTemp', [id]); 
			});
			mediaUpload[id] = voice;
			mediaUpload[id].upload();
		}else{
			if(mediaUpload[id].hasOwnProperty('url')){
				$scope.$emit('delectTemp', [id]); 
			}else{
				document.getElementById( id + '-resend').classList.remove("hide");
			}
		}
	}

});

var mediaUpload = {};

function UploadMedia(rid,uri,type,callback){
	var mimeType = { "Image":"image/jpeg", "Video":"video/quicktime", "Voice":"audio/wav" }
	var uriFile = uri;
	var mediaName = uri.substr(uri.lastIndexOf('/') + 1);
	var ft = new FileTransfer();
	var downloadContain;
	var downloadProgress;
	this.upload = function(){
		openProgress();
		var options = new FileUploadOptions();
		options.fileKey = "fileToUpload";
		options.fileName = mediaName;
	    options.mimeType = mimeType[type];
	    var params = new Object();
	    options.params = params;
	    options.chunkedMode = false;
		ft.onprogress = function(progressEvent){
			if (progressEvent.lengthComputable) {
				openProgress();
				var downloadPercent = (progressEvent.loaded / progressEvent.total) * 100;
		        downloadProgress.style.width = downloadPercent+'%';
		    } else {

		    }
		};
		ft.upload(uriFile, "http://203.113.25.44/?r=api/upload", win, fail,
        options);
	}
	this.cancel = function(){
		ft.abort();
		uploadFail();
	}

	function openProgress(){
		downloadContain = document.getElementById(mediaName + '-downloaded');
	    downloadProgress = document.getElementById(mediaName + '-download-progress');
	    downloadContain.classList.remove("hide");
	    document.getElementById( mediaName + '-resend').classList.add("hide");
	}

	function uploadFail(){
		document.getElementById( mediaName + '-downloaded').classList.add("hide");
		document.getElementById( mediaName + '-resend').classList.remove("hide");
	}

	function win(r){
		console.log("Code = " + r.responseCode);
	    console.log("Response = " + r.response);
	    console.log("Sent = " + r.bytesSent);
	    send(r.response);
	}

	function fail(error){
	    console.log("upload error source " + error.source);
	    console.log("upload error target " + error.target);
	    uploadFail();
	}

	function send(url){
		 main.getChatRoomApi().chat(rid, "*", main.getDataManager().myProfile._id, url, type, function(err, res) {
			if (err || res === null) {
				console.warn("send message fail.");
			}
			else {
				console.log("send message:", JSON.stringify(res));
				jQuery.extend(mediaUpload[mediaName], { 'url' : url, 'messageId' : res.messageId });
	    		callback.apply(this , [mediaName,res.messageId]);
			}
		});
	}
}

