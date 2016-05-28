(function () {
    'use strict';

    angular
        .module('spartan.controllers')
        .controller('HeaderChatCtrl', HeaderChatCtrl);

    function HeaderChatCtrl($state, $scope, $rootScope, $ionicLoading, Favorite, blockNotifications, roomSelected, networkService) {
        $scope.warnMessage = '';
        $scope.reload = reload;
        var viewInfo = true;
        $scope.isFavorite = function (id) {
            return Favorite.isFavorite(id);
        }
        $scope.isBlockNoti = function (id) {
            return blockNotifications.isBlockNoti(id);
        }
        $scope.$on('roomName', function (event, args) {
            $scope.roomName = args;
            $scope.currentRoom = roomSelected.getRoomOrLastRoom();
            if ($scope.currentRoom.type === RoomType.privateChat) {
                $.each($scope.currentRoom.members, function (index, value) {
                    if (value.id != main.getDataManager().myProfile._id) {
                        $scope.otherId = value.id;
                    }
                });
            }
            setTimeout(function () {
                document.getElementById('chatMessage').style.display = "flex";
                resizeUI();
            }, 1000);
        });
        $scope.$on('onSocketDisconnected', function (event, args) {
            //@ Changed toolbar for tell user what happened.
            document.getElementById('chatToolbar').className = 'md-warn';
            $scope.warnMessage = 'Server connection problems. App still working offline.';
        });

        window.onresize = function (event) {
            resizeUI();
        };

        $scope.toggleInfo = function () {
            viewInfo = !viewInfo;
            $rootScope.$broadcast('toggleInfo', viewInfo);
            setTimeout(function () {
                resizeUI();
            }, 100);

            if (viewInfo == true) {
                document.getElementById('chatLayout').style.width = "60%";
            }
            else {
                document.getElementById('chatLayout').style.width = "100%";
            }
        }

        function resizeUI() {
            document.getElementById('chatMessage').style.left = jQuery('#leftLayout').offset().left + jQuery('#leftLayout').width() + "px";
            document.getElementById('chatMessage').style.width = jQuery('#webchatdetail').width() + "px";
            document.getElementById('chatLayout').style.height = window.innerHeight - 110 + "px";
            document.getElementById('infoLayout').style.height = window.innerHeight - 66 + "px";
            if (document.getElementById('chatMenuContain') != null) {
                document.getElementById('chatMenuContain').style.left = jQuery('#leftLayout').offset().left + jQuery('#leftLayout').width() + "px";
                document.getElementById('chatMenuContain').style.width = jQuery('#webchatdetail').width() + "px";
            }
            if (document.getElementById('stickerContain') != null) {
                document.getElementById('stickerContain').style.left = jQuery('#leftLayout').offset().left + jQuery('#leftLayout').width() + "px";
                document.getElementById('stickerContain').style.width = jQuery('#webchatdetail').width() + "px";
            }
            if (document.getElementById('recorderContain') != null) {
                document.getElementById('recorderContain').style.left = jQuery('#leftLayout').offset().left + jQuery('#leftLayout').width() + "px";
                document.getElementById('recorderContain').style.width = jQuery('#webchatdetail').width() + "px";
            }
            if (document.getElementById('mapContain') != null) {
                document.getElementById('mapContain').style.left = jQuery('#leftLayout').offset().left + jQuery('#leftLayout').width() + "px";
                document.getElementById('mapContain').style.width = jQuery('#webchatdetail').width() + "px";
            }

        }

        function reload() {
            location.href = '';
        }

        $scope.editFavorite = function (editType, id, type) {
            $ionicLoading.show({
                template: 'Loading..'
            });
            if (type == RoomType.privateChat) {
                server.updateFavoriteMember(editType, id, function (err, res) {
                    if (!err && res.code == 200) {
                        console.log(JSON.stringify(res));
                        Favorite.updateFavorite(editType, id, type);
                        $ionicLoading.hide();
                        $rootScope.$broadcast('editFavorite', 'editFavorite');
                    }
                    else {
                        console.warn(err, res);
                        $ionicLoading.hide();
                    }
                });
            } else {
                server.updateFavoriteGroups(editType, id, function (err, res) {
                    if (!err && res.code == 200) {
                        console.log(JSON.stringify(res));
                        Favorite.updateFavorite(editType, id, type);
                        $ionicLoading.hide();
                        $rootScope.$broadcast('editFavorite', 'editFavorite');
                    }
                    else {
                        console.warn(err, res);
                        $ionicLoading.hide();
                    }
                });
            }
        }

        $scope.editBlockNoti = function (editType, id, type) {
            $ionicLoading.show({
                template: 'Loading..'
            });
            if (type == RoomType.privateChat) {
                server.updateClosedNoticeMemberList(editType, id, function (err, res) {
                    if (!err && res.code == 200) {
                        console.log(JSON.stringify(res));
                        blockNotifications.updateBlockNoti(editType, id, type);
                        $ionicLoading.hide();
                    }
                    else {
                        console.warn(err, res);
                        $ionicLoading.hide();
                    }
                });
            } else {
                server.updateClosedNoticeGroupsList(editType, id, function (err, res) {
                    if (!err && res.code == 200) {
                        console.log(JSON.stringify(res));
                        blockNotifications.updateBlockNoti(editType, id, type);
                        $ionicLoading.hide();
                    }
                    else {
                        console.warn(err, res);
                        $ionicLoading.hide();
                    }
                });
            }
        }
    }
})();