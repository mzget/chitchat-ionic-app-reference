(function () {
    'use strict';

    angular
        .module('spartan.services')
        .factory('chatRoomService', chatRoomService);

    //    chatRoomService.$inject = ['$http'];

    function chatRoomService($http, $sce, $cordovaFile, roomSelected, ConvertDateTime) {
        var service = {
            init: init,
            getPersistendMessage: getPersistendMessage,
            savePersistendMessage: savePersistendMessage,
            all: function () {
                return chats;
            },
            remove: function (chat) {
                chats.splice(chats.indexOf(chat), 1);
            },
            get: function (chatId) {
                for (var i = 0; i < chats.length; i++) {
                    if (chats[i]._id === chatId) {
                        return chats[i];
                    }
                }
                return null;
            },
            set: function (json) {
                chats = json;

                if (rid != roomSelected.getRoom()._id) {
                    rid = roomSelected.getRoom()._id;
                    date = [];
                }

                for (var i = 0; i < chats.length; i++) {
                    if (!chats[i].hasOwnProperty('_id')) { continue; }
                    chats[i].time = ConvertDateTime.getTime(chats[i].createTime);
                    var dateTime = chats[i].createTime.substr(0, chats[i].createTime.lastIndexOf('T'));
                    if (date.indexOf(dateTime) == -1) {
                        date.push(chats[i].createTime.substr(0, chats[i].createTime.lastIndexOf('T')));

                        var dateMsg = new Date(dateTime);
                        var dateNow = new Date();

                        if (dateMsg.getFullYear() == dateNow.getFullYear() &&
                         dateMsg.getMonth() == dateNow.getMonth() &&
                         dateMsg.getDate() == dateNow.getDate()) {
                            chats[i].firstMsg = "Today";
                        } else if (dateMsg.getFullYear() == dateNow.getFullYear() &&
                         dateMsg.getMonth() == dateNow.getMonth() &&
                         dateMsg.getDate() == dateNow.getDate() - 1) {
                            chats[i].firstMsg = "Yesterday";
                        } else {
                            chats[i].firstMsg = days[dateMsg.getDay()] + ', ' + (dateMsg.getMonth() + 1) + '/' + dateMsg.getFullYear();
                        }


                    }
                    if (chats[i].type == ContentType[ContentType.Video]) {
                        if (chats[i].temp == 'true') {
                            chats[i].body = cordova.file.documentsDirectory + chats[i]._id;
                        } else {

                            chats[i].bodyUrl = $sce.trustAsResourceUrl('http://203.113.25.44' + chats[i].body);
                            var chatBody = chats[i].body;
                            var splitChat = chatBody.split(".");
                            var nameThumbnail = splitChat[0] + '.png';
                            chats[i].thumbnail = $sce.trustAsResourceUrl('http://203.113.25.44' + nameThumbnail);
                        }
                    }
                    else if (chats[i].type === ContentType[ContentType.Location]) {
                        var location = JSON.parse(chats[i].body);

                        chats[i].locationName = location.name;
                        chats[i].locationAddress = location.address;
                        chats[i].lat = location.latitude;
                        chats[i].long = location.longitude;
                    }
                }
            },
            clear: clear
        };

        var chats = [];
        var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        var date = [];
        var rid;

        return service;

        function init() {

        }

        function getPersistendMessage() {
            var curRoom = roomSelected.getRoom();
            messageDAL.getData(curRoom._id, function done(err, messages) {
                console.warn("getPersistendMessage: ", messages);
            });
        }

        function savePersistendMessage() {
            var curRoom = roomSelected.getRoom();
            messageDAL.saveData(curRoom._id, chats);
        }

        function clear() {
            chats = [];
        }
    }
})();