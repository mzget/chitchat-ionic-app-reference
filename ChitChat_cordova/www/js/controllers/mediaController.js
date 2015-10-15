angular.module('spartan.media', [])

.controller('ImageController', function($scope, $ionicPlatform, $ionicActionSheet, $ionicLoading, $cordovaProgress,$ionicModal, ImageService, FileService) {
 
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

})
.controller('VideoController', function($scope, $cordovaCapture, $ionicLoading, $ionicActionSheet, $cordovaProgress,$cordovaFile,GenerateID,VideoService) {

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
		    		$scope.$apply(); 
		    		videoURI = VideoService.getVideoUri();
		    		videoName = videoURI.substr(videoURI.lastIndexOf('/') + 1);
		    		$scope.$emit('fileUri',[videoName,"Video"]);
		    		$scope.uploadVideo();
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
        
        $cordovaFile.moveFile(namePath,name,cordova.file.tempDirectory,videoName)
        .then(function(success) {
        	console.log(success);
        	delectFolderTmp(folderFile);
        	videoURI = cordova.file.tempDirectory + videoName;
        	$scope.$emit('fileUri',[videoURI,"Video"]);
        	$scope.uploadVideo();
          }, function(error) {
          	console.log(error);
          });
		
	}

	function delectFolderTmp(nameFolder){
		$cordovaFile.removeDir(cordova.file.tempDirectory, nameFolder)
	      .then(function (success) {
	        console.log(success);
	      }, function (error) {
	        console.log(error);
	      });
	}

	$scope.uploadVideo = function() {
	    console.log(videoURI);
	    var options = new FileUploadOptions();
	    options.fileKey = "fileToUpload";
	    options.fileName = videoURI.substr(videoURI.lastIndexOf('/') + 1);
	    options.mimeType = "video/quicktime";
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
	    ft.upload(videoURI, "http://stalk.animation-genius.com/?r=api/upload", win, fail,
        options);
	}

	function win(r) {
	    console.log("Code = " + r.responseCode);
	    console.log("Response = " + r.response);
	    console.log("Sent = " + r.bytesSent);
	    $ionicLoading.hide();
        $scope.$emit('fileUrl', [r.response,videoName,"Video"]);
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

});