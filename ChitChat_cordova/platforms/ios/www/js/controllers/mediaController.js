angular.module('spartan.media', [])

.controller('ImageController', function($scope, $ionicPlatform, $ionicActionSheet, $ionicLoading, $cordovaProgress,$ionicModal, ImageService, FileService) {
 
  	$ionicPlatform.ready(function() {
    	$scope.images = FileService.images();
    	if (!$scope.$$phase) { $scope.$apply(); }
  	});

  	$scope.$on('addImg', function(event, args) { $scope.addImg(); });
  	$scope.$on('uploadImg', function(event, args) { $scope.uploadImg(); });

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
    		//$scope.$apply(); 
    		$scope.$emit('fileUri',[FileService.getImages(),"Image"]);
    		//$scope.uploadImg();
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

	    var downloadContain = document.getElementById(FileService.getImages()[0] + '-download-contain');
	    var downloadProgress = document.getElementById(FileService.getImages()[0] + '-download-progress');
	    var ionicLoadingUpload = true;
	    console.log(downloadContain);
	    if(downloadContain != null || downloadContain != undefined){
	    	ionicLoadingUpload = false;
	    	downloadContain.classList.remove("hide");
	    }
  		
	    ft.onprogress = function(progressEvent){
	    	if (progressEvent.lengthComputable) {
	    		if(ionicLoadingUpload){
	    			$ionicLoading.show({
				      template: 'Uploading ' + (Math.round(progressEvent.loaded / progressEvent.total * 100)).toFixed(0) + '%'
				  });
	    		}else{
	    			var downloadPercent = (progressEvent.loaded / progressEvent.total) * 100;
		        	downloadProgress.style.width = downloadPercent+'%';
	    		}
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
        	//$scope.uploadVideo();
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
	    var options = new FileUploadOptions();
	    options.fileKey = "fileToUpload";
	    options.fileName = videoURI.substr(videoURI.lastIndexOf('/') + 1);
	    options.mimeType = "video/quicktime";
	    var params = new Object();
	    options.params = params;
	    options.chunkedMode = false;

	    var downloadContain = document.getElementById(options.fileName + '-download-contain');
	    var downloadProgress = document.getElementById(options.fileName + '-download-progress');
	    downloadContain.classList.remove("hide");

	    var ft = new FileTransfer();
	    ft.onprogress = function(progressEvent){
	    	if (progressEvent.lengthComputable) {
		   	  // $ionicLoading.show({
			  //     template: 'Uploading ' + (Math.round(progressEvent.loaded / progressEvent.total * 100)).toFixed(0) + '%'
			  // });
				var downloadPercent = (progressEvent.loaded / progressEvent.total) * 100;
		        downloadProgress.style.width = downloadPercent+'%';
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
	    //$ionicLoading.hide();
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
.controller('VoiceController', function($scope, $ionicLoading, $cordovaProgress, $timeout, $cordovaFileTransfer, $cordovaFile, GenerateID,roomSelected) {

	$scope.$on('startRecord', function(event, args) { $scope.startRecord(); });
	$scope.$on('stopRecord', function(event, args) { $scope.stopRecord(); });
	$scope.$on('cancelRecord', function(event, args) { $scope.cancelRecord(); });

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
			audio.stop();
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

	    $('#' + id + '-download-contain').removeClass('hide');

	    $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
	      .then(function(result) {
	        $('#' + id + '-download-contain').addClass('hide'); $scope.play(id,targetPath);
	      }, function(err) {
	        console.log(err,"ERROR");
	        $('#' + id + '-download-contain').removeClass('hide');
	      }, function (progress) {
	        $timeout(function () {
	          var downloadProgress = (progress.loaded / progress.total) * 100;
	          console.log(downloadProgress);
	          $('#' + id + '-download-progress').css({ 'width': downloadProgress+'%' });
	        })
	      });
	}

	$scope.uploadVoice = function() {
		var downloadContain = document.getElementById(fileName + ".wav" + '-download-contain');
	    var downloadProgress = document.getElementById(fileName + ".wav" + '-download-progress');
	    downloadContain.classList.remove("hide");

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
		      // $ionicLoading.show({
			  //     template: 'Uploading ' + (Math.round(progressEvent.loaded / progressEvent.total * 100)).toFixed(0) + '%'
			  // });
				var downloadPercent = (progressEvent.loaded / progressEvent.total) * 100;
		        downloadProgress.style.width = downloadPercent+'%';
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
	    //$ionicLoading.hide();
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


