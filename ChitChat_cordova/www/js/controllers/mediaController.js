angular.module('spartan.media', [])

.controller('ImageController', function($scope, $q, $ionicPlatform, $ionicActionSheet, $ionicLoading, $cordovaProgress,$ionicModal, ImageService, FileService,roomSelected, checkFileSize) {
 
  	$ionicPlatform.ready(function() {
    	$scope.images = FileService.images();
    	if (!$scope.$$phase) { $scope.$apply(); }
  	});

  	$scope.$on('addImg', function(event, args) { $scope.addImg(); });
  	$scope.$on('uploadImg', function(event, args) { $scope.uploadImg(); });

  	$scope.urlForImage = function(imageName) {
    	var trueOrigin = cordova.file.documentsDirectory + imageName;
    	return trueOrigin;
  	}
 
	$scope.addImg = function() {
		if (ionic.Platform.platform() === "ios") {
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
		}else{
			var file    = document.querySelector('input[type=file]').files[0];
	        var reader  = new FileReader();
	        reader.onloadend = function () {
	            $scope.$emit('fileUri',[reader.result,ContentType[ContentType.Image]]);
	            console.log(reader.result);
	        } 
	        reader.readAsDataURL(file);
		}
	}
 
  	$scope.addImage = function(type) {
    	$scope.hideSheet();
    	ImageService.handleMediaDialog(type).then(function() { 
    		//$scope.$apply(); 
    		$scope.$emit('fileUri',[FileService.getImages(),ContentType[ContentType.Image]]);
    		//$scope.uploadImg();
    	});
  	}

  	function uploadImageForm(){
  		var formData = new FormData($('#UploadForm')[0]);
		$.ajax({
		       	url : 'http://203.113.25.44/?r=api/upload',
		       	type : 'POST',
		       	data : formData,
		       	processData: false,
			   	contentType: false,
		       	success : function(data) {
		       		console.log('success');
		        	console.log(data);
		        	$ionicLoading.hide();
	    			$scope.$emit('fileUrl', [data]);
	    			document.getElementById("UploadForm").reset();
		       	},
		       	error : function(data){
		       		console.log('error');
		       		$ionicLoading.hide();
		       		alert("Fail");
					console.log(data);
		       	},
		       	xhr: function()
				{
				    var xhr = new window.XMLHttpRequest();
				    //Upload progress
				    xhr.upload.addEventListener("progress", function(evt){
				      if (evt.lengthComputable) {
				        var percentComplete = evt.loaded / evt.total;
				        //Do something with upload progress
				        console.log(percentComplete);
				      }
				    }, false);
				    return xhr;
			  	},
		});
  	}

  	$scope.changeImage = function(img){
        var file    = document.querySelector('input[type=file]').files[0];
        var reader  = new FileReader();
        reader.onloadend = function () {
            $scope.$emit('fileUri',[reader.result]);
            document.getElementById(img).src = reader.result;
            console.log(reader.result);
        } 
        reader.readAsDataURL(file);
    }

  	$scope.uploadImg = function() {
  		if (ionic.Platform.platform() === "ios") {
	  		if(FileService.getImages().length==0) { $scope.$emit('fileUrl',null,"Image"); return; }
		    var imageURI = cordova.file.documentsDirectory + FileService.getImages();
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
		}else{
			uploadImageForm();
		}

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
	

	$scope.viewImage = function(type,src){
		$scope.modalImage.type = type;
		$scope.modalImage.src = src;
		$scope.modalImage.show();
	}
	$scope.closeImage = function(){
		$scope.modalImage.hide();
	}

	$scope.uploadImage = function(id) {
		if (ionic.Platform.platform() === "ios") {
			if(FileService.getImages().length!=0) { 
				checkFileSize.checkFile(cordova.file.documentsDirectory + id).then(function(canUpload) {
					if(canUpload){
						var img = new UploadMedia(roomSelected.getRoom()._id, cordova.file.documentsDirectory + id, ContentType[ContentType.Image], function(id,messageId){
							$scope.$emit('delectTemp', [id]); 
						});
					mediaUpload[id] = img;
					mediaUpload[id].upload();
					}else{
						navigator.notification.alert(
						    'This file size is over', 
						     null,          
						    'Fail to Upload',          
						    'OK'   
						);
					}
				});
			}else{
				if(mediaUpload[id].hasOwnProperty('url')){
					$scope.$emit('delectTemp', [id]); 
				}else{
					document.getElementById( id + '-resend').classList.remove("hide");
				}
			}
		}else{
			var file    = document.querySelector('input[type=file]').files[0];
	        var reader  = new FileReader();
	        reader.onloadend = function () {
	            //$scope.$emit('fileUri',[reader.result,ContentType[ContentType.Image]]);
	            //console.log(reader.result);
	            var img = new UploadMediaWeb(roomSelected.getRoom().id, reader.result, ContentType[ContentType.Image], function(id,messageId){
	            	$scope.$emit('delectTemp', [id]); 
	            });
	            mediaUpload[id] = img;
	            mediaUpload[id].upload();
	        } 
	        reader.readAsDataURL(file);
		}
	}

	$scope.saveFile = function(type,url){
 		$scope.mediaDownload(url).then(function(path) { 
 			saveToCameraRoll(type,path).then(function(){
 				navigator.notification.alert(
				    'This ' + type +' been saved!', 
				     null,          
				    'Complete',          
				    'OK'   
				);
 			})
    	});
 	}

 	function saveToCameraRoll(type,uri){
 		return $q(function(resolve, reject){
 			if(type == ContentType[ContentType.Image]){
		 		CameraRoll.saveImageToCameraRoll(uri, function() {
		 			resolve();
				}, function(err) {
					reject();
				});
		 	}else{
		 		CameraRoll.saveVideoToCameraRoll(uri, function() {
		 			resolve();
				}, function(err) {
					reject();
				});
		 	}
 		})
 	}

 	$scope.mediaDownload = function(url){
 		console.log(url);
 		return $q(function(resolve, reject) {
 			var fileName = url.substr(url.lastIndexOf('/') + 1);
		    var targetPath = cordova.file.documentsDirectory + fileName;
		    var ft = new FileTransfer();
	    	ft.onprogress = function(progressEvent){
	    		var downloadPercent = (progressEvent.loaded / progressEvent.total) * 100;
	        	console.log(downloadPercent);

			    $ionicLoading.show({
			      template: 'Downloading ' + downloadPercent.toFixed(0) + '%'
			    });
			};
		    ft.download(url,targetPath,
	    	function win(r){
	    		$ionicLoading.hide();
		    	resolve(targetPath);
			},
			function fail(error){
				$ionicLoading.hide();
			    reject();
			});
 		})
 	}

})
.controller('VideoController', function($scope, $q, $sce, $cordovaFileTransfer, $timeout, $cordovaCapture, $ionicLoading, $ionicActionSheet, $ionicModal, $cordovaProgress, $cordovaFile, checkFileSize, GenerateID,VideoService,roomSelected) {

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
		    		videoName = (videoURI.substr(videoURI.lastIndexOf('/') + 1));
		    		console.log(videoName);
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
		videoName = GenerateID.makeid() + '.mp4';
		var name = uri.substr(uri.lastIndexOf('/') + 1);
        var namePath = uri.substr(0, uri.lastIndexOf('/') + 1);
        var namePathTrim = namePath.substring(0,namePath.length - 1);
        var folderFile = namePathTrim.substr(namePathTrim.lastIndexOf('/') + 1);
        
        $cordovaFile.moveFile(namePath,name,cordova.file.documentsDirectory,videoName)
        .then(function(success) {
        	console.log(success);
        	videoURI = cordova.file.documentsDirectory + videoName;
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
			checkFileSize.checkFile(videoURI).then(function(canUpload) {
				if(canUpload){
					var video = new UploadMedia(roomSelected.getRoom()._id, videoURI, ContentType[ContentType.Video], function(id,messageId){
						$scope.$emit('delectTemp', [id]); 
					});
					mediaUpload[id] = video;
					mediaUpload[id].upload();
				}else{
					navigator.notification.alert(
					    'This file size is over', 
					     null,          
					    'Fail to Upload',          
					    'OK'   
					);
				}
			});
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

	$scope.openVideo = function(type,src) {
		$ionicModal.fromTemplateUrl('templates/modal-video.html', {
			scope: $scope,
		    animation: 'slide-in-up'
		}).then(function(modal) {
		    $scope.modalVideo = modal;
		    $scope.modalVideo.type = type;
		    $scope.modalVideo.src = src;
		    $scope.modalVideo.url = $sce.trustAsResourceUrl('http://203.113.25.44' + src);
		    $scope.modalVideo.show();
		    document.getElementById("video-player").play();
		});
	};
	$scope.closeVideo = function() {
		angular.element(document.getElementById("video-player").pause());
    	$scope.modalVideo.remove();
  	};
	
 	$scope.saveFile = function(type,url){
 		$scope.mediaDownload('http://203.113.25.44' + url).then(function(path) { 
 			saveToCameraRoll(type,path).then(function(){
 				navigator.notification.alert(
				    'This ' + type +' been saved!', 
				     null,          
				    'Complete',          
				    'OK'   
				);
 			})
    	});
 	}

 	function saveToCameraRoll(type,uri){
 		return $q(function(resolve, reject){
 			if(type == ContentType[ContentType.Image]){
		 		CameraRoll.saveImageToCameraRoll(uri, function() {
		 			resolve();
				}, function(err) {
					reject();
				});
		 	}else{
		 		CameraRoll.saveVideoToCameraRoll(uri, function() {
		 			resolve();
				}, function(err) {
					reject();
				});
		 	}
 		})
 	}


 	$scope.mediaDownload = function(url){
 		console.log(url);
 		return $q(function(resolve, reject) {
 			var fileName = url.substr(url.lastIndexOf('/') + 1);
		    var targetPath = cordova.file.documentsDirectory + fileName;
		    var ft = new FileTransfer();
	    	ft.onprogress = function(progressEvent){
	    		var downloadPercent = (progressEvent.loaded / progressEvent.total) * 100;
	        	console.log(downloadPercent);

			    $ionicLoading.show({
			      template: 'Downloading ' + downloadPercent.toFixed(0) + '%'
			    });
			};
		    ft.download(url,targetPath,
	    	function win(r){
	    		$ionicLoading.hide();
		    	resolve(targetPath);
			},
			function fail(error){
				$ionicLoading.hide();
			    reject();
			});
 		})
 	}


})
.controller('VoiceController', function($scope, $ionicLoading, $cordovaProgress, $timeout, $cordovaFileTransfer, $cordovaFile, GenerateID,roomSelected, checkFileSize) {

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
			checkFileSize.checkFile(cordova.file.documentsDirectory + id).then(function(canUpload) {
				if(canUpload){
					var voice = new UploadMedia(roomSelected.getRoom()._id, cordova.file.documentsDirectory + id, ContentType[ContentType.Voice], function(id,messageId){
						$scope.$emit('delectTemp', [id]); 
				});
				mediaUpload[id] = voice;
				mediaUpload[id].upload();
				}else{
					navigator.notification.alert(
					    'This file size is over', 
					     null,          
					    'Fail to Upload',          
					    'OK'   
					);
				}
			});
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

function UploadMediaWeb(rid,uri,type,callback){

	var mimeType = { "Image":"image/jpg", "Video":"video/mov", "Voice":"audio/wav" }
	var uriFile = uri;
	var mediaName = uri
	var downloadContain;
	var downloadProgress;

	this.upload = function(){
		var formData = new FormData($('#UploadForm')[0]);
		$.ajax({
		       	url : 'http://203.113.25.44/?r=api/upload',
		       	type : 'POST',
		       	data : formData,
		       	processData: false,
			   	contentType: false,
		       	success : function(data) {
		       		console.log('success');
		        	console.log(data);
		        	document.getElementById("UploadForm").reset();
		        	send(data);
		       	},
		       	error : function(data){
		       		console.log('error');
		       		alert("Fail");
					console.log(data);
		       	},
		       	xhr: function()
				{
				    var xhr = new window.XMLHttpRequest();
				    //Upload progress
				    xhr.upload.addEventListener("progress", function(evt){
				      if (evt.lengthComputable) {
				        var percentComplete = evt.loaded / evt.total;
				        //Do something with upload progress
				        console.log(percentComplete);
				      }
				    }, false);
				    return xhr;
			  	},
		});
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

function UploadMedia(rid,uri,type,callback){
	var mimeType = { "Image":"image/jpg", "Video":"video/mov", "Voice":"audio/wav" }
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
	    params.category = 'msg';
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
		console.log(JSON.stringify(r));
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

