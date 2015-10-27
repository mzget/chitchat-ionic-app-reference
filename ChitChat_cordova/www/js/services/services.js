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

.factory('CreateGroup',function(ProjectBase){
  var createType = "";
  var id_checked = [];
  var allmembers = [];
  var membersSelectedInProjectBase = [];
  var members = main.getDataManager().orgMembers;
  
  function getAllMember(){
    allmembers = [];
    for(var i in members){
      if(this.createType=="ProjectBase"){
        if(members[i]._id==main.getDataManager().myProfile._id){
          allmembers.push( {"_id":members[i]._id, "displayname":members[i].displayname, "image":members[i].image, "checked":true } );
        }else{
          allmembers.push( {"_id":members[i]._id, "displayname":members[i].displayname, "image":members[i].image, "checked":getChecked(i) } );
        }
      }else{
        allmembers.push( {"_id":members[i]._id, "displayname":members[i].displayname, "image":members[i].image, "checked":getChecked(i) } );
      }
    }
    return allmembers;
  }
  function getSelectedMember(){
    var selectedMember = [];
    membersSelectedInProjectBase = [];
    selectedMember.push( {"_id":"Add","image":"Add","displayname":"Add"});
    
    var membersLength = getLength(members);
    
    for(var i in members){
      for(var x=0; x<membersLength; x++){
        if(id_checked[x]==i){
          if(this.createType=="ProjectBase"){
            var positionRole = ProjectBase.getRolePosition(members[i]._id);
            selectedMember.push( {"_id":members[i]._id, "displayname":members[i].displayname, "image":members[i].image, "role":positionRole[0], "position":positionRole[1] } );
            membersSelectedInProjectBase[membersSelectedInProjectBase.length] = new function(){
              this.id = members[i]._id;
              this.role = positionRole[0];
              this.jobPosition = positionRole[1];
            }
          }else{
            selectedMember.push( {"_id":members[i]._id, "displayname":members[i].displayname, "image":members[i].image } );
          }
        }
      }
    }
    var myProfile = main.getDataManager().myProfile;
    if(this.createType=="ProjectBase"){
      var positionRole = ProjectBase.getRolePosition(myProfile._id);
      membersSelectedInProjectBase[membersSelectedInProjectBase.length] = new function(){
        this.id = myProfile._id;
        this.role = positionRole[0];
        this.jobPosition = positionRole[1];
      }
    }
    var positionRole = ProjectBase.getRolePosition(myProfile._id);
    selectedMember.push( {"_id":myProfile._id, "displayname":myProfile.displayname, "image":myProfile.image, "role":positionRole[0], "position":positionRole[1] } );
    return selectedMember;
  }

  function getLength(item){
    var count = 0;
    for(var i in item){
      count++;
    }
    return count;
  }
  function getSelectedMemberProjectBaseWithMe(){
    return membersSelectedInProjectBase;
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
  function clear(){
    createType = "";
    id_checked = [];
    allmembers = [];
    membersSelectedInProjectBase = [];
    ProjectBase.clear();
  }

  return{
    createType: createType,
    getAllMember: getAllMember,
    getSelectedMember: getSelectedMember,
    getSelectedMemberProjectBaseWithMe: getSelectedMemberProjectBaseWithMe,
    getSelectedIdWithMe: getSelectedIdWithMe,
    setMemberSelected: setMemberSelected,
    clear: clear
  }
})

.factory('ProjectBase',function(){
  var editPositionMember = [];
  function setRolePosition(id,role,position){
    if(containID(id)){
      for(var i=0; i<editPositionMember.length; i++){
        if(editPositionMember[i]._id==id){
          editPositionMember[i].role = role;
          editPositionMember[i].position = position;
        }
      }
    }else{
      editPositionMember.push( { "_id":id,"role":role,"position":position } );
    }
    console.log(getRolePosition(id));
  }
  function getRolePosition(id){
    var positionRole = [];
    var defaultRole = MemberRole[MemberRole.member];
    if(containID(id)){
      for(var x=0; x<editPositionMember.length; x++){
        if(editPositionMember[x]._id == id){
          positionRole = [editPositionMember[x].role.role,editPositionMember[x].position.job];
        }
      }
    }else{
      positionRole = [defaultRole,main.getDataManager().companyInfo.jobPosition[0]];
    }
    return positionRole;
  }
  function getRolePositionIndex(id){
    var positionRole = [];
    var index = [];
    if(containID(id)){
      for(var x=0; x<editPositionMember.length; x++){
        if(editPositionMember[x]._id == id){
          positionRole = [editPositionMember[x].role.role,editPositionMember[x].position.job];

          for(var job=0; job<main.getDataManager().companyInfo.jobPosition.length; job++){
            if(positionRole[1]==main.getDataManager().companyInfo.jobPosition[job]){
              index[1] = job;
            }
          }
          for(var role=0; role<(Object.keys(MemberRole).length/2); role++){
            if(positionRole[0]==MemberRole[role]){ index[0] = role; }
          }
        }
      }
    }else{
      if(id==main.getDataManager().myProfile._id){
        index = [1,0];
      }else{
        index = [0,0];
      }
    }
    return index;
  }

  function containID(id){
    var hasValue = false;
    for(var x=0; x<editPositionMember.length; x++){
      if(editPositionMember[x]._id == id){
        hasValue = true;
      }
    }
    return hasValue;
  }
  function clear(){
    positionRole = [];
  }
  
  return{
    setRolePosition: setRolePosition,
    getRolePosition: getRolePosition,
    getRolePositionIndex: getRolePositionIndex,
    clear: clear
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
				if (chats[i]._id === chatId) {
					return chats[i];
				}
			}
			return null;
		},
		set: function(json) {
			chats = json;
			for (var i = 0; i < chats.length; i++) {
			    if (chats[i].type == 'Video') {
			        chats[i].bodyUrl = $sce.trustAsResourceUrl('http://stalk.animation-genius.com' + chats[i].body);
			    }
			    else if (chats[i].type === ContentType[ContentType.Location]) {
			        var location = JSON.parse(chats[i].body);

			        chats[i].locationName = location.name;
			        chats[i].locationAddress = location.address;
			        chats[i].lat = location.latitude;
			        chats[i].long = location.longitude;
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