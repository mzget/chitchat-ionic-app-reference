angular.module('spartan.chatroom', [])

.factory('roomInfo', function() {
  var room;
  
  function getRoom(){
    return room;
  };

  function setRoom(_room) {
    room = _room;
  };
 
  return {
    getRoom: getRoom,
    setRoom: setRoom
  }
})