angular.module('starter.services', [])

.factory('FileService', function() {
  var images;
  
  function getImages(){
    return images;
  };

  function setImages() {
    images = [];
    return images;
  };

  function addImage(img) {
      images[0] = img;
  };

  function clearImages(){
    images = [];
  };
 
  return {
    storeImage: addImage,
    images: setImages,
    getImages: getImages,
    clearImages: clearImages
  }
})

.factory('GenerateID', function() {
  function makeid() {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
 
    for (var i = 0; i < 5; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  return {
    makeid: makeid
  }
})

.factory('VideoService', function($cordovaCamera, FileService, $q, $cordovaFile, GenerateID){

  var videoUri = "";

  function getVideoUri(){
    return videoUri;
  }

  function setVideoUri(name){
    videoUri = cordova.file.tempDirectory + name;
  }

  function optionType(){
    return {
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
      allowEdit: false,
      mediaType: Camera.MediaType.VIDEO,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false
    };
  }
  function saveMedia() {
    return $q(function(resolve, reject) {
      var options = optionType();
      $cordovaCamera.getPicture(options).then(function(imageUrl) {
        var name = imageUrl.substr(imageUrl.lastIndexOf('/') + 1);
        var namePath = imageUrl.substr(0, imageUrl.lastIndexOf('/') + 1);
        console.log(imageUrl,namePath);
        var newName = GenerateID.makeid() + name;
        $cordovaFile.copyFile(namePath, name, cordova.file.tempDirectory, newName)
          .then(function(info) {
            setVideoUri(newName);
            resolve();
          }, function(e) {
            reject();
          });
      });
    })
  }
  return {
    handleMediaDialog: saveMedia,
    getVideoUri: getVideoUri
  }
})


.factory('ImageService', function($cordovaCamera, FileService, $q, $cordovaFile, GenerateID) {
 
  function optionsForType(type) {
    var source;
    switch (type) {
      case 0:
        source = Camera.PictureSourceType.CAMERA;
        break;
      case 1:
        source = Camera.PictureSourceType.PHOTOLIBRARY;
        break;
    }
    return {
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: source,
      allowEdit: false,
      encodingType: Camera.EncodingType.JPEG,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false
    };
  }
 
  function saveMedia(type) {
    return $q(function(resolve, reject) {
      var options = optionsForType(type);
 
      $cordovaCamera.getPicture(options).then(function(imageUrl) {
        var name = imageUrl.substr(imageUrl.lastIndexOf('/') + 1);
        var namePath = imageUrl.substr(0, imageUrl.lastIndexOf('/') + 1);
        console.log(imageUrl,namePath);
        var newName = GenerateID.makeid() + name;
        $cordovaFile.copyFile(namePath, name, cordova.file.dataDirectory, newName)
          .then(function(info) {
            FileService.storeImage(newName);
            resolve();
          }, function(e) {
            reject();
          });
      });
    })
  }
  return {
    handleMediaDialog: saveMedia
  }
})
.factory('CreateGroup',function(){

  var id_checked = [];
  var allmembers = [];
  var members = main.getDataManager().orgMembers;
  
  function getAllMember(){
    allmembers = [];
    for(var i in members){
      allmembers.push( {"_id":members[i]._id, "displayname":members[i].displayname, "image":members[i].image, "checked":getChecked(i) } );
    }
    return allmembers;
  }
  function getSelectedMember(){
    var selectedMember = [];
    selectedMember.push( {"_id":"Add","image":"Add","displayname":"Add"});
    var count = 0;
    for(var i in members){
      if(id_checked[count]==i)
        selectedMember.push( {"_id":members[i]._id, "displayname":members[i].displayname, "image":members[i].image } );
      count++;
    }
    return selectedMember;
  }

  function getSelectedIdWithMe(){ 
    var id = id_checked;
    id[id.length] = main.getDataManager().myProfile._id;
    return id; 
  }

  function getChecked(id){
    var checked = false;
    for(var x=0; x<id_checked.length; x++){
      if(id==id_checked[x]){
        checked = true;
      }
    }
    return checked;
  }

  function setMemberSelected(id,selected){
    if(selected){
      id_checked[id_checked.length] = id;
    }else{
      for(var i=0; i<id_checked.length; i++){
        if(id_checked[i]==id){ id_checked.splice( i, 1 ); }
      }
    }
  }

  return{
    getAllMember: getAllMember,
    getSelectedMember: getSelectedMember,
    getSelectedIdWithMe: getSelectedIdWithMe,
    setMemberSelected: setMemberSelected
  }
})

.factory('Chats', function($sce) {
    // Might use a resource here that returns a JSON array

	// Some fake testing data
    var chats = [];

	return {
		all: function() {
			return chats;
		},
		remove: function(chat) {
			chats.splice(chats.indexOf(chat), 1);
		},
		get: function(chatId) {
			for (var i = 0; i < chats.length; i++) {
				if (chats[i].id === parseInt(chatId)) {
					return chats[i];
				}
			}
			return null;
		},
		set: function(json) {
			chats = json;
      for (var i = 0; i < chats.length; i++){
        if(chats[i].type=='Video'){
          chats[i].bodyUrl = $sce.trustAsResourceUrl('http://stalk.animation-genius.com'+chats[i].body);
        }
      }
		}
	};
})
.factory('roomSelected', function () {
    var room;

    function getRoom() {
        return room;
    };

    function setRoom(_room) {
        room = _room;
        console.debug("setRoom", room);
    };

    return {
        getRoom: getRoom,
        setRoom: setRoom
    }
});