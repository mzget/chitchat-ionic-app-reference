angular.module('spartan.services', [])

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
    videoUri = cordova.file.documentsDirectory + name;
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
        var newName = GenerateID.makeid() + ".mp4";
        $cordovaFile.moveFile(namePath, name, cordova.file.documentsDirectory, newName)
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
        $cordovaFile.moveFile(namePath, name, cordova.file.documentsDirectory, newName)
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
  }
  function getRolePosition(id){
    var positionRole = [];
    if(containID(id)){
      for(var x=0; x<editPositionMember.length; x++){
        if(editPositionMember[x]._id == id){
          positionRole = [editPositionMember[x].role,editPositionMember[x].position];
        }
      }
    }else{
      if(id==main.getDataManager().myProfile._id){
        positionRole = [MemberRole[MemberRole.admin],main.getDataManager().companyInfo.jobPosition[0]];
      }else
        positionRole = [MemberRole[MemberRole.member],main.getDataManager().companyInfo.jobPosition[0]];
    }
    return positionRole;
  }
  function getRolePositionIndex(id){
    var positionRole = [];
    var index = [];
    if(containID(id)){
      for(var x=0; x<editPositionMember.length; x++){
        if(editPositionMember[x]._id == id){
          positionRole = [editPositionMember[x].role,editPositionMember[x].position];

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
    editPositionMember = [];
  }
  
  return{
    setRolePosition: setRolePosition,
    getRolePosition: getRolePosition,
    getRolePositionIndex: getRolePositionIndex,
    clear: clear
  }
})

.factory('Favorite',function(){
  var favoriteMembers = [];
  var favoriteGroups = [];
  var isGetFirstData = false;
  function getFavorite(){
    try{
      favoriteMembers = main.getDataManager().myProfile.favoriteUsers;
      favoriteGroups = main.getDataManager().myProfile.favoriteGroups;
      isGetFirstData = true;
    }catch(err){
      isGetFirstData = false;
    }
  }
  function isFavorite(id){
    var isHas = false;
    if(!isGetFirstData) getFavorite();
    else{
      var allFavorite = getAllFavorite();
      for(var i=0; i<allFavorite.length; i++){
          if(allFavorite[i] == id){
              isHas = true;
          }
      }
      return isHas;
    }
    return isHas;
  }
  function updateFavorite(editType,id,type){
    if(type==RoomType.organizationGroup || type==RoomType.projectBaseGroup || type==RoomType.privateGroup){
      if(editType=='add'){
          if(favoriteGroups==undefined) favoriteGroups = [];
          favoriteGroups.push(id);
      }else{
          var index = favoriteGroups.indexOf(id);
          favoriteGroups.splice( index , 1);
      }
    }else{
      if(editType=='add'){
          if(favoriteMembers==undefined) favoriteMembers = [];
          favoriteMembers.push(id);
      }else{
          var index = favoriteMembers.indexOf(id);
          favoriteMembers.splice( index , 1);
      }
    }   
  }
  function getAllFavorite(){
    if(!isGetFirstData) getFavorite();
    else{
      if(favoriteMembers != undefined && favoriteGroups != undefined){
        return favoriteMembers.concat(favoriteGroups);
      }
      else if(favoriteMembers != undefined) return favoriteMembers;
      else if(favoriteGroups != undefined) return favoriteGroups;
    }
    return [];
  }
  return{
    isFavorite: isFavorite,
    updateFavorite: updateFavorite,
    getAllFavorite: getAllFavorite
  }
})

.factory('blockNotifications',function(){
  var blockNotiMembers = [];
  var blockNotiGroups = [];
  var isGetFirstData = false;
  function getBlockNoti(){
    try{
      blockNotiMembers = main.getDataManager().myProfile.closedNoticeUsers;
      blockNotiGroups = main.getDataManager().myProfile.closedNoticeGroups;
      isGetFirstData = true;
    }catch(err){
      isGetFirstData = false;
    }
  }
  function isBlockNoti(id){
    var isHas = false;
    if(!isGetFirstData) {
      getBlockNoti();
      var allBlockNoti = getAllBlockNoti();
      for(var i=0; i<allBlockNoti.length; i++){
          if(allBlockNoti[i] == id){
              isHas = true;
          }
      }
      return isHas;
    }
    else{
      var allBlockNoti = getAllBlockNoti();
      for(var i=0; i<allBlockNoti.length; i++){
          if(allBlockNoti[i] == id){
              isHas = true;
          }
      }
      return isHas;
    }
    return isHas;
  }
  function updateBlockNoti(editType,id,type){
    if(type==RoomType.projectBaseGroup || type==RoomType.privateGroup){
      if(editType=='add'){
          if(blockNotiGroups==undefined) blockNotiGroups = [];
          blockNotiGroups.push(id);
      }else{
          var index = blockNotiGroups.indexOf(id);
          blockNotiGroups.splice( index , 1);
      }
    }else{
      if(editType=='add'){
          if(blockNotiMembers==undefined) blockNotiMembers = [];
          blockNotiMembers.push(id);
      }else{
          var index = blockNotiMembers.indexOf(id);
          blockNotiMembers.splice( index , 1);
      }
    }   
  }
  function getAllBlockNoti(){
    if(!isGetFirstData) getBlockNoti();
    else{
      if(blockNotiMembers != undefined && blockNotiGroups != undefined){
        return blockNotiMembers.concat(blockNotiGroups);
      }
      else if(blockNotiMembers != undefined) return blockNotiMembers;
      else if(blockNotiGroups != undefined) return blockNotiGroups;
    }
    return [];
  }
  return{
    isBlockNoti: isBlockNoti,
    updateBlockNoti: updateBlockNoti,
    getAllBlockNoti: getAllBlockNoti
  }
})

.factory('checkFileSize',function($q){

  function checkFile(pathFile){
    return $q(function(resolve, reject) {
      window.resolveLocalFileSystemURL(pathFile, 
        function win(fileEntry){
          fileEntry.file(function(file){
            var fileSize = file.size / 1000000;
            if(fileSize <= 20) resolve(true);
            else resolve(false);
          });
        }, 
        function fail(e){
          reject();
      });
    })
  }

  return{
    checkFile: checkFile
  }
})

.factory('ConvertDateTime', function() {

  var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  function getTime(date){
    var dateMsg = new Date(date);
    var minutes = (dateMsg.getMinutes() < 10? '0' : '') + dateMsg.getMinutes();

    return dateMsg.getHours() + ":" + minutes;
  }

  function getTimeChatlog(date) {
      var dateMsg = new Date(date);
      var dateNow = new Date();

      if (dateMsg.getFullYear() == dateNow.getFullYear() &&
       dateMsg.getMonth() == dateNow.getMonth() &&
       dateMsg.getDate() == dateNow.getDate()) {
          return getTime(date);
      }
      else if (dateMsg.getFullYear() == dateNow.getFullYear() &&
       dateMsg.getMonth() == dateNow.getMonth() &&
       dateMsg.getDate() == dateNow.getDate() - 1) {
          return "Yesterday";
      }
      else if (dateMsg.getFullYear() == dateNow.getFullYear() &&
       dateMsg.getMonth() == dateNow.getMonth() &&
       dateMsg.getDate() - 7 <= dateNow.getDate()) {
          return days[dateMsg.getDay()];
      }
      else {
          return dateMsg.getMonth() + '/' + dateMsg.getDate();
      }
  }

  return{
    getTime: getTime,
    getTimeChatlog: getTimeChatlog
  }
})

.factory('modalService', function (){
  function initContactModal($scope, contactId, roomSelected, done){
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
  return {
      initContactModal: initContactModal
  }
})

.factory('roomSelected', function () {
    var room;
    var lastJoinRoom;

    function getLastJoinRoom() {
        return lastJoinRoom;
    }

    function getRoom() {
        return room;
    };

    function setRoom(newRoom) {
        lastJoinRoom = room;
        room = newRoom;
       
        console.log("setRoom", JSON.stringify(room));
    };

    return {
        getRoom: getRoom,
        setRoom: setRoom,
        getLastJoinRoom: getLastJoinRoom
    }
});