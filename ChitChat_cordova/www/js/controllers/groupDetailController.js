(function () {
    'use strict';

    angular
        .module('spartan.group', [])
        .controller('groupDetailController', groupDetailController)
        .controller('viewGroupMembersCtrl', viewGroupMembersCtrl)
        .controller('editMemberGroup', editMemberGroup);

//    groupDetailController.$inject = ['$location'];

    var requestReload = false;
    var id_checked = [];

    function groupDetailController($location) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'groupDetailController';

        activate();

        function activate() { }
    }

    function editMemberGroup($scope, $ionicHistory, $ionicLoading, $cordovaProgress, $ionicModal, $rootScope,
        CreateGroup, ProjectBase, roomSelected) {
        id_checked = [];
        $scope.myProfile = main.getDataManager().myProfile;

        var room = roomSelected.getRoom();
        console.info("roomInfo." , JSON.stringify(room));
        if (room == null) {
            room = roomSelected.getLastJoinRoom();
            console.warn("getLastJoinRoom is." , JSON.stringify(room));
        }

        if ($rootScope.status == "invite") {
            $scope.allmembers = CreateGroup.getAllMember();
            for (var i = 0; i < room.members.length; i++) {
                var positionIndex;
                $.each($scope.allmembers, function (index, result) {
                    if (result._id == room.members[i].id) {
                        positionIndex = index;
                    }
                });
                $scope.allmembers.splice(positionIndex, 1);
            }
            setSelectedMembers();
        } else if ($rootScope.status = "edit") {
            $scope.allmembers = getMembersInProjectBase(room);
            for (var x = 0; x < room.members.length; x++) {
                ProjectBase.setRolePosition($scope.allmembers[x].id, $scope.allmembers[x].role, $scope.allmembers[x].jobPosition);
            }
        }

        $scope.checked = function (id, selected) {
            setMemberSelected(id, selected);
        }

        $scope.invite = function () {
            $ionicLoading.show({
                template: 'Loading..'
            });
            server.editGroupMembers("add", room._id, RoomType[room.type], id_checked, function (err, res) {
                if (!err) {
                    console.log(JSON.stringify(res));
                    requestReload = true;
                    $ionicLoading.hide();
                    if(ionic.Platform.platform() == "ios") {
                        $cordovaProgress.showSuccess(false, "Success!");
                        setTimeout(function () {
                             $cordovaProgress.hide();
                        }, 1500); 
                    }
                    $ionicHistory.goBack(-1);
                }
                else {
                    console.warn(err, res);
                }
            });
        }

        function setMemberSelected(id, selected) {
            if (selected) {
                id_checked[id_checked.length] = id;
            } else {
                for (var i = 0; i < id_checked.length; i++) {
                    if (id_checked[i] == id) { id_checked.splice(i, 1); }
                }
            }
            setSelectedMembers();
        }

        function setSelectedMembers(){
            $scope.selectedMembers = id_checked.length;
        }
        

    }

    function viewGroupMembersCtrl($scope, $state, $ionicModal, $rootScope, $cordovaProgress, $ionicLoading, $ionicHistory,
        roomSelected, CreateGroup, modalFactory) {
        $scope.button = {};
        $scope.button.post = {};
        $scope.button.album = {};
        $scope.button.members = {};
        $scope.selectTab = function(button){
            $scope.button.post.clicked = false;
            $scope.button.album.clicked = false;
            $scope.button.members.clicked = false;
            button.clicked = true;
        };
        $scope.$on('$ionicView.enter', function () {
            if($rootScope.selectTab=='post') $scope.button.post.clicked = true;
            else if($rootScope.selectTab=='album') $scope.button.album.clicked = true;
            else if($rootScope.selectTab=='members') $scope.button.members.clicked = true;

            //<!-- Contact modal.
            $ionicModal.fromTemplateUrl('templates/modal-contact.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                $scope.contactModal = modal;
            });

            //Cleanup the modal when we're done with it!
            $scope.$on('$destroy', function () {
                $scope.contactModal.remove();
            });
            // Execute action on hide modal
            $scope.$on('modal.hidden', function () {
                // Execute action
            });
            // Execute action on remove modal
            $scope.$on('modal.removed', function () {
                // Execute action
            });

            if (requestReload) {
                var member = [];
                for (var i = 0; i < id_checked.length; i++) {
                    var member = main.getDataManager().orgMembers[id_checked[i]];
                    $scope.members.push(member);
                }
                requestReload = false;
                if (room.type === RoomType.projectBaseGroup) { init(); }
            }
        });
        $scope.$on('$ionicView.leave', function () {
            console.debug("leave controller.");
        });
        $scope.$on('$ionicView.unloaded', function () {
            console.info("unloaded controller.");
        });
        $scope.$on('$ionicView.beforeLeave', function () {
            console.info("beforeLeave controller.");
            $scope.contactModal.hide();
        });
        $scope.$on('$ionicView.afterLeave', function () {
            console.info("afterLeave controller.");
        });

        var room = roomSelected.getRoom();
        console.info("roomInfo.", JSON.stringify(room));
        if (room == null) {
            room = roomSelected.getLastJoinRoom();
            console.warn("LastJoinRoom is.", JSON.stringify(room));
        }
        var group = room;
        var gMembers = group.members;
        $scope.privateIndex = RoomType.privateGroup;
        $scope.projectBaseIndex = RoomType.projectBaseGroup;
        $scope.orgGroupsIndex = RoomType.organizationGroup;
        $scope.myProfile = main.getDataManager().myProfile;
        $scope.chatGroup = group;
        $scope.sourceImage = "";
        $scope.model = { groupname: group.name, originalName: group.name };
        init();
        function init() {
            if (room.type === RoomType.privateGroup || room.type === RoomType.organizationGroup) {
                groupMembers(gMembers, gMembers.length, function done(members) {
                    $scope.members = members;
                });
            } else if (room.type === RoomType.projectBaseGroup) {
                $scope.members = getMembersInProjectBase(room);
                var admin = false;
                $.each($scope.members, function (index, result) {
                    if ($scope.myProfile._id == $scope.members[index]._id) {
                        if ($scope.members[index].role == MemberRole[MemberRole.admin] || $scope.members[index].textRole == MemberRole[MemberRole.admin]) { admin = true; }
                    }
                });
                $scope.meIsAdmin = admin;
            }
        }

        $scope.members_length = gMembers.length;

        $scope.InviteMembers = function () {
            //location.href = '#/tab/group/members/' + $scope.chatGroup._id + '/invite';
            //@ may be $state.current is come from difference path.

            if ($state.current.name === NGStateUtil.tab_chats_chat_members) {
                $state.go(NGStateUtil.tab_chats_chat_members_invite);
            }
            else {
                $state.go('tab.group-members-invite');
            }
            $rootScope.status = "invite";
        }
        $scope.editMember = function () {
            location.href = '#/tab/group/members/' + $scope.chatGroup._id + '/edit';
            $rootScope.status = "edit";
            CreateGroup.createType = "ProjectBase";
        }
        $scope.removeMember = function (id) {
            var idMember = [];
            idMember.push(id);
            server.editGroupMembers("remove", room._id, RoomType[room.type], idMember, function (err, res) {
                if (!err) {
                    var indexMember;
                    $.each($scope.members, function (index, result) {
                        if (result._id == id || result.id == id) { 
                            indexMember = index;
                        }
                    });
                    $scope.members.splice(indexMember, 1);
            
                    if (id == $scope.myProfile._id) {
                        $state.go('tab.group');
                    }
                    else {
                        $state.go($state.current, {}, { reload: true });
                    }
                }
                else {
                    console.warn(err, res);
                }
            });
        }

        $scope.viewContact = function (contactId) {
            console.debug("viewContact", contactId);
            $scope.openContactModal(contactId);
        }
        //<!-- Contact modal -------------------------->
        $scope.openContactModal = function (contactId) {
            modalFactory.initContactModal($scope, contactId, roomSelected, function done() {
                $scope.contactModal.show();
            });
        };
        $scope.closeContactModal = function () {
            $scope.contactModal.hide();
        };

        $scope.groupSave = function () {
            $ionicLoading.show({
                template: 'Loading..'
            });
            uploadImgGroup();
        }

        function uploadImgGroup() {
            if ($scope.sourceImage != '') {
                $scope.$broadcast('uploadImg', 'uploadImg');
            } else {
                changeNameGroup();
            }
        }
        function changeNameGroup() {
            if ($scope.model.groupname != $scope.model.originalName) {
                server.editGroupName(room._id, RoomType[room.type], $scope.model.groupname, function (err, res) {
                    if (!err) {
                        console.log(JSON.stringify(res));
                        $scope.model.originalName = $scope.model.groupname;
                        $state.go($state.current, {}, { reload: true });
                        saveSuccess();
                    } else {
                        console.warn(err, res);
                    }
                });
            } else {
                saveSuccess();
            }
        }
        function saveSuccess() {
            $ionicLoading.hide();
            if (ionic.Platform.platform() === "ios") {
                $cordovaProgress.showSuccess(false, "Success!");
                setTimeout(function () { $cordovaProgress.hide(); }, 1500);
            }
        }

        $rootScope.$ionicGoBack = function () {

            if(typeof($ionicHistory.backView().stateParams) != 'undefined')
            {
                roomSelected.setRoom(room);
            }
            
            if ($state.current.name == 'tab.group-members') {
                CreateGroup.clear();
                $rootScope.status = "";
            }
            $ionicHistory.goBack(-1);
        };


        $scope.$on('fileUri', function (event, args) {
            $scope.sourceImage = args;
        });
        $scope.$on('fileUrl', function (event, args) {
            $scope.sourceImage = '';
            server.UpdatedGroupImage(room._id, args[0], function (err, res) {
                if (!err) {
                    console.log(JSON.stringify(res));
                    changeNameGroup();
                } else {
                    console.warn(err, res);
                }
            });
        });
    }

    function getMembersInProjectBase(room) {
        for (var x = 0; x < room.members.length; x++) {
            var member = dataManager.getContactProfile(room.members[x].id);
            if (!!member) {
                room.members[x]._id = member._id;
                room.members[x].displayname = member.displayname;
                room.members[x].image = member.image;
                if (room.members[x].role == null) {
                    room.members[x].role = MemberRole[MemberRole.member];
                }
                if (room.members[x].jobPosition == null) {
                    room.members[x].jobPosition = main.getDataManager().companyInfo.jobPosition[0];
                }
                room.members[x].isAdmin = isAdminInProjectBase(room, room.members[x]._id);
            }
        }

        return room.members;
    }
})();
