(function () {
    'use strict';

    angular
        .module('spartan.services')
        .factory('modalFactory', modalFactory);

    // modalFactory.$inject = ['$http', 'webRTCFactory'];

    function modalFactory($http, $state, webRTCFactory) {
        var service = {
            initContactModal: initContactModal,
            initMyProfileModal: initMyProfileModal
        };

        return service;

        function initContactModal($scope, $rootScope, contactId, roomSelected, done) {
            var contact = main.getDataManager().orgMembers[contactId];
            $scope.contact = contact;
  
            server.getPrivateChatRoomId(dataManager.myProfile._id, contactId, function result(err, res) {
                console.log('getPrivateChatRoomId', JSON.stringify(res));
                
                if (res.code === HttpStatusCode.success) {
                    var room = JSON.parse(JSON.stringify(res.data));

                    if (ionic.Platform.platform() !== 'ios' && ionic.Platform.platform() !== 'android') {
                        $scope.chat = function () {
                            console.log("ROOM", room);
                            $rootScope.$broadcast('changeChat', room);
                        };
                    }
                    else {
                        $scope.chat = function () {
                            roomSelected.setRoom(room);
                            if ($state.current.name === NGStateUtil.tab_chats_chat_members) {
                                $state.go(NGStateUtil.tab_chats_chat);
                            }
                            else if ($state.current.name === NGStateUtil.tab_group || $state.current.name === NGStateUtil.tab_group_members) {
                                $state.go(NGStateUtil.tab_group_chat);
                            }
                        };
                    }

                    $scope.freecall = function () {
                        roomSelected.setRoom(room);

                        webRTCFactory.call(contactId);
                    };

                    $scope.openViewContactProfile = function (id) {
                        if ($state.current.name === NGStateUtil.tab_chats_chat_members) {
                            $state.go(NGStateUtil.tab_chats_chat_viewprofile, { chatId: id });
                        }
                        else if ($state.current.name === NGStateUtil.tab_group || $state.current.name === NGStateUtil.tab_group_members) {
                            $state.go(NGStateUtil.tab_group_viewprofile, { chatId: id });
                        }
                    }

                    $scope.$apply();
                }
                else {
                    console.warn(err, res);
                }
            });

            done();
        }

        function initMyProfileModal($scope, done) {
            $scope.chat = main.getDataManager().myProfile;

            $scope.editProfile = function (chatId) {
                $state.go(NGStateUtil.tab_group_viewprofile, { chatId: chatId });
            };

            done();
        }
    }
})();