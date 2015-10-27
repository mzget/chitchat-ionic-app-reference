(function () {
    'use strict';

    angular
        .module('spartan.group', [])
        .controller('groupDetailController', groupDetailController)
        .controller('viewGroupMembersCtrl', viewGroupMembersCtrl)
        .controller('editMemberGroup', editMemberGroup);

    groupDetailController.$inject = ['$location']; 

    var requestReload = false;
    var id_checked = [];

    function groupDetailController($location) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'groupDetailController';

        activate();

        function activate() { }
    }

    function editMemberGroup($scope, $stateParams, $ionicHistory, $ionicModal, CreateGroup, roomSelected){
        id_checked = [];
        $scope.invite = true;
        $scope.myProfile = main.getDataManager().myProfile;
        $scope.allmembers = CreateGroup.getAllMember();

        var room = roomSelected.getRoom();
        var group = getGroup(room.type,$stateParams.chatId);

        for(var i=0; i<room.members.length; i++){
            var positionIndex;
            $.each($scope.allmembers, function(index, result) {
                if(result._id == room.members[i].id){
                    positionIndex = index;
                }
            });
            $scope.allmembers.splice(positionIndex,1);
        }

        $scope.checked = function(id,selected){
            setMemberSelected(id,selected);
        }

        $scope.invite = function(){
            server.editGroupMembers("add",room._id,RoomType[room.type],id_checked, function(err, res) {
                if (!err) {
                    console.log(JSON.stringify(res));
                    requestReload = true;
                    $ionicHistory.goBack(-1);
                }
                else {
                    console.warn(err, res);
                }
            });
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
    }
    
    function viewGroupMembersCtrl($scope, $stateParams, $ionicModal, roomSelected) {
        navHide();
        $scope.$on('$ionicView.enter', function () {
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

            if(requestReload){   
                var member = [];
                for(var i=0; i<id_checked.length; i++){
                    var member = main.getDataManager().orgMembers[id_checked[i]];
                    $scope.members.push(member);
                }
                requestReload = false;
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
        var group = getGroup(room.type,$stateParams.chatId);
        var gMembers = group.members;

        $scope.chat = group;

        if(room.type==2){
            groupMembers(gMembers, gMembers.length, function done(members) {
                $scope.members = members;
            });
        }else if(room.type==1){
            for(var x=0; x<room.members.length; x++){
                room.members[x].displayname = main.getDataManager().orgMembers[room.members[x].id].displayname;
                room.members[x].image = main.getDataManager().orgMembers[room.members[x].id].image;
                if(room.members[x].role == null) { room.members[x].role = MemberRole[MemberRole.member]; }
                if(room.members[x].jobPosition == null) { room.members[x].jobPosition = main.getDataManager().companyInfo.jobPosition[0]; }
            }
            $scope.members = room.members;
        }

        $scope.members_length = gMembers.length;

        $scope.InviteMembers = function () {
            location.href = '#/tab/group/members/' + $scope.chat._id + '/invite';
        }

        $scope.viewContact = function (contactId) {
            console.debug("viewContact", contactId);
            $scope.openContactModal(contactId);
        }
        //<!-- Contact modal -------------------------->
        $scope.openContactModal = function (contactId) {
            initContactModal($scope, contactId, roomSelected, function done() {
                $scope.contactModal.show();
            });
        };
        $scope.closeContactModal = function () {
            $scope.contactModal.hide();
        };
    }

    function getGroup(type,chatId){
        var group = null;
        switch (type) {
            case 0:
                group = main.getDataManager().orgGroups[chatId];
                break;
            case 1:
                group = main.getDataManager().projectBaseGroups[chatId];
                break;
            case 2:
                group = main.getDataManager().privateGroups[chatId];
                break;
            default:
                break;
        }
        return group;
    }

})();
