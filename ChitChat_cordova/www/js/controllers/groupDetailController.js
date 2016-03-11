(function () {
    'use strict';

    angular
        .module('spartan.group', [])
        .controller('groupDetailCtrl', groupDetailCtrl)
        .controller('editMemberGroup', editMemberGroup)
        .controller('InfoCtrl', InfoCtrl);

    function editMemberGroup($scope, $rootScope, $ionicHistory, $ionicLoading, $cordovaProgress, $ionicModal, $ionicTabsDelegate, CreateGroup, ProjectBase, roomSelected)
    {
        $ionicTabsDelegate.showBar(false);
        var id_checked = [];
        $scope.myProfile = main.getDataManager().myProfile;

        var room_id = roomSelected.getCurrentRid();
        var room = dataManager.getGroup(room_id);
 
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
        }
        else if ($rootScope.status = "edit") {
            getMembersInProjectBase(room, function (value) {
                $scope.allmembers = value;
                
                for (var x = 0; x < room.members.length; x++) {
                    ProjectBase.setRolePosition($scope.allmembers[x].id, $scope.allmembers[x].role, $scope.allmembers[x].jobPosition);
                }
            });
        }

        $scope.checked = function (id, selected) {
            setMemberSelected(id, selected);
        }

        $scope.invite = function () {
            $ionicLoading.show({
                template: 'Loading..'
            });
            server.editGroupMembers("add", room._id, RoomType[room.type], id_checked, function (err, res) {
                if (res.code === HttpStatusCode.success) {
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

                    $ionicLoading.hide();
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

        $scope.$on('$ionicView.enter', function () {
            console.info('view enter: ', ngControllerUtil.editMemberGroup);
        });
    }

    function groupDetailCtrl($scope, $state, $ionicModal, $rootScope, $cordovaProgress, $ionicLoading, $ionicHistory, $ionicTabsDelegate,
        roomSelected, CreateGroup, modalFactory)
    {
            var self = this;
            self.name = ngControllerUtil.groupDetailCtrl;
            $ionicTabsDelegate.showBar(false);

            $scope.button = {};
            $scope.button.post = {};
            $scope.button.album = {};
            $scope.button.members = {};
            $scope.selectTab = function (button) {
                $scope.button.post.clicked = false;
                $scope.button.album.clicked = false;
                $scope.button.members.clicked = false;
                button.clicked = true;
            };

        $scope.$on('$ionicView.enter', function () {
            console.info('view.enter: ', self.name);

            if($rootScope.selectTab=='post') $scope.button.post.clicked = true;
            else if($rootScope.selectTab=='album') $scope.button.album.clicked = true;
            else if($rootScope.selectTab=='members') $scope.button.members.clicked = true;

            //<!-- My profile. 
            //@ it cannot auto close modal when clicked.
            //$ionicModal.fromTemplateUrl('templates/modal-myprofile.html', {
            //    scope: $scope,
            //    animation: 'slide-in-up'
            //}).then(function (modal) {
            //    $scope.myProfileModal = modal;
            //});
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
                //$scope.myProfileModal.remove();
            });
            // Execute action on hide modal
            $scope.$on('modal.hidden', function () {
                // Execute action
            });
            // Execute action on remove modal
            $scope.$on('modal.removed', function () {
                // Execute action
            });
            
            //console.debug(room.members.length);
            //for (var i = 0; i < room.members.length; i++) {
            //    var member = main.getDataManager().orgMembers[room.members[i].id];
            //    $scope.members.push(member);
            //}

            init();
        });
        $scope.$on('$ionicView.leave', function () {
            console.info("leave: ", self.name);
        });
        $scope.$on('$ionicView.unloaded', function () {
            console.info("unloaded :", self.name);
        });
        $scope.$on('$ionicView.beforeLeave', function () {
            console.info("beforeLeave :", self.name);

            $scope.contactModal.hide();
            //$scope.myProfileModal.hide();
        });
        $scope.$on('$ionicView.afterLeave', function () {
            console.info("afterLeave controller.");
        });

        var room_id = roomSelected.getCurrentRid();
        var room = dataManager.getGroup(room_id);
        console.info("roomInfo.", JSON.stringify(room));
      
        $scope.privateIndex = RoomType.privateGroup;
        $scope.projectBaseIndex = RoomType.projectBaseGroup;
        $scope.orgGroupsIndex = RoomType.organizationGroup;
        $scope.myProfile = main.getDataManager().myProfile;
        $scope.chatGroup = room;
        $scope.sourceImage = "";
        $scope.model = { groupname: room.name, originalName: room.name };

        function init() {
            if (room.type === RoomType.privateGroup || room.type === RoomType.organizationGroup) {
                groupMembers(room.members, room.members.length, function done(members) {
                    $scope.members = members;
                    
                    $ionicLoading.hide();
                });
            }
            else if (room.type === RoomType.projectBaseGroup) {
                var waitForMembers = new Promise(function executor(resolve, rejected) {
                    getMembersInProjectBase(room, function (value) {
                        $scope.members = value;
                        resolve($scope.members);
                    });
                }).then(function onfillful(value) {
                    var admin = false;
                    $.each($scope.members, function (index, result) {
                        if ($scope.myProfile._id == $scope.members[index]._id) {
                            if ($scope.members[index].role == MemberRole[MemberRole.admin] || $scope.members[index].textRole == MemberRole[MemberRole.admin]) { admin = true; }
                        }
                    });
                    $scope.meIsAdmin = admin;

                    $ionicLoading.hide();
                }).catch(function onReject(err) {

                });
            }
        }

        $scope.members_length = room.members.length;

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
            $ionicLoading.show();

            var idMember = [];
            console.warn('remove_member_id', id);
            idMember.push(id);
            server.editGroupMembers("remove", room._id, RoomType[room.type], idMember, function (err, res) {
                if (res.code === HttpStatusCode.success) {
                    //@ if user remove your self.
                    if (id == $scope.myProfile._id) {
                        $ionicLoading.hide();

                        $state.go(NGStateUtil.tab_group);
                    }

                    var indexMember;
                    async.mapSeries(room.members, function iterator(item, cb) {
                        if (!!item && item.id === id) {
                            indexMember = room.members.indexOf(item);
                            room.members.splice(indexMember, 1);

                            cb();
                        }
                        else {
                            cb();
                        }
                    }, function done(err) {
                        init();
                    });
                    //$.each(room.members, function (index, result) {
                    //    if (result._id == id || result.id == id) { indexMember = index; }
                    //});
                    //$scope.members.splice(indexMember, 1);
                }
                else {
                    console.warn(err, res);

                    $ionicLoading.hide();
                }
            });
        }

        $scope.viewContact = function (contactId) {
            if (main.getDataManager().isMySelf(contactId)) {
                $scope.openProfileModal();
            }
            else {
                $scope.openContactModal(contactId);
            }
        }

        $scope.openProfileModal = function () {
            //modalFactory.initMyProfileModal($scope, function done() {
            //    $scope.myProfileModal.show();
            //});
        }
        //<!-- Contact modal -------------------------->
        $scope.openContactModal = function (contactId) {
            modalFactory.initContactModal($scope, $rootScope, contactId, roomSelected, function done() {
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


    function InfoCtrl($scope, $rootScope, $mdDialog, modalFactory, roomSelected, CreateGroup) {
        $scope.myProfile = main.getDataManager().myProfile;
        $scope.$on('toggleInfo', function(event, args) {
            $scope.viewInfo = args;
        });
        $scope.$on('roomName', function(event, args) {
            getInfo();
        });
        $scope.$on('onEditedGroupMember', function(event, args) {
            getInfo();
        });
        function getInfo(){
            var room = roomSelected.getRoom();
            $scope.viewInfo = true;
            //$scope.nameInfo = args;
            $scope.roomType = room.type;
            if(room.type === RoomType.privateGroup){
                $scope.group = main.getDataManager().privateGroups[room._id];
                groupMembers($scope.group.members, $scope.group.members.length, function done(members) {
                    $scope.members = members;
                    $scope.$apply();
                }); 
            }else if(room.type === RoomType.organizationGroup){
                $scope.group = main.getDataManager().orgGroups[room._id];
                groupMembers(room.members, room.members.length, function done(members) {
                    $scope.members = members;
                    $scope.$apply();
                }); 
            }
            else if(room.type === RoomType.privateChat){
                var id;
                $.each(room.members, function (index, result) {
                    if (result.id != main.getDataManager().myProfile._id) { 
                        id = result.id;
                    }
                });
                var member = main.getDataManager().orgMembers[id];
                if (!!member) {
                    if (member.firstname == null ||
                        member.lastname == null ||
                        member.mail == null ||
                        member.role == null ||
                        member.tel == null ) {
                        server.getMemberProfile(id, function (err, res) {
                            if (!err) {
                                member.firstname = res.data[0].firstname;
                                member.lastname = res.data[0].lastname;
                                member.mail = res.data[0].mail;
                                member.role = res.data[0].role;
                                member.tel = res.data[0].tel;
                            }
                            else {
                                console.warn(err, res);
                            }
                            $scope.$apply();
                        });
                    }
                    $scope.group = main.getDataManager().orgMembers[id];
                }
                else {
                    console.warn("A member is no longer in team.");
                }
            }else if (room.type === RoomType.projectBaseGroup) {
                $scope.group = main.getDataManager().projectBaseGroups[room._id];
                var waitForMembers = new Promise(function executor(resolve, rejected) {
                    getMembersInProjectBase($scope.group, function (value) {
                        $scope.members = value;
                        $scope.$apply();
                        resolve($scope.members);
                    });
                }).then(function onfillful(value) {
                    var admin = false;
                    $.each($scope.members, function (index, result) {
                        if ($scope.myProfile._id == $scope.members[index]._id) {
                            if ($scope.members[index].role == MemberRole[MemberRole.admin] || $scope.members[index].textRole == MemberRole[MemberRole.admin]) { admin = true; }
                        }
                    });
                    $scope.meIsAdmin = admin;
                    $scope.$apply();
                }).catch(function onReject(err) {

                });
            }
        }
        $scope.openContactModal = function (contactId) {
            if(contactId!=main.getDataManager().myProfile._id) 
                modalFactory.initContactWeb($rootScope, contactId);    
        };
        $scope.invite = function(ev){
            $mdDialog.show({
              controller: InviteController,
              templateUrl: 'templates_web/modal-invite.html',
              parent: angular.element(document.body),
              targetEvent: ev,
              clickOutsideToClose:true,
              onRemoving: closeDialogInvite
            });
        }
        function closeDialogInvite(){
            CreateGroup.clear();
        }

        $scope.editGroup = function(ev) {
            $mdDialog.show({
              controller: EditGroupController,
              templateUrl: 'templates_web/modal-editgroup.html',
              parent: angular.element(document.body),
              targetEvent: ev,
              clickOutsideToClose:true,
              onRemoving: closeDialogEditGroup
            });
        }
        function closeDialogEditGroup(){
            document.getElementById("UploadAvatar").reset();
        }
        $scope.isAdmin = function(id){
            if(roomSelected.getRoom() !== undefined)
                return isAdminInProjectBase(roomSelected.getRoom(),id);
            else
                return false;
        }
        $scope.$on('inviteGroup', function(event, args) {
            var room = roomSelected.getRoomOrLastRoom();
            var newMember = [];
            for (var i = 0; i < args.length; i++) {
                newMember.push({ "id": args[i] });
            };
            room.members = room.members.concat(newMember);
            if(room.type == RoomType.privateGroup){
                groupMembers(room.members, room.members.length, function done(members) {
                    $scope.members = members;
                    $scope.$apply();
                }); 
            }else{
                getMembersInProjectBase(room, function (value) {
                    $scope.members = value;
                    $scope.$apply();
                });
            }
        });
        $scope.$on('editGroup', function(event, args) {
            var room = roomSelected.getRoomOrLastRoom(); 
            if(args.length == 0){
                if(room.type == RoomType.privateGroup){
                    groupMembers(room.members, room.members.length, function done(members) {
                        $scope.members = members;
                        $scope.$apply();
                    });
                }else if(room.type == RoomType.projectBaseGroup){
                    getMembersInProjectBase(room, function (value) {
                        $scope.allmembers = value;
                        $scope.$apply();
                    });
                }
            }
            else{
                $scope.image = args;
                room.image = args;
                $scope.$apply();
            }
        });
    }

    function getMembersInProjectBase(room, onCompleted) {
        async.mapSeries(room.members, function iterator(item, cb) {            
            var member = dataManager.getContactProfile(item.id);
            if (!!member) {
                item._id = member._id;
                item.displayname = member.displayname;
                item.image = member.image;
                if (item.role == null) {
                    item.role = MemberRole[MemberRole.member];
                }
                if (item.jobPosition == null) {
                    item.jobPosition = main.getDataManager().companyInfo.jobPosition[0];
                }
                item.isAdmin = isAdminInProjectBase(room, item._id);

                cb();
            }
            else {
                item = null;
                cb();
            }
        }, function done(err) {
            onCompleted(room.members);
        });
    }
})();
