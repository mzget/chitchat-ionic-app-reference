(function () {
    'use strict';

    angular
        .module('spartan.group', [])
        .controller('groupDetailController', groupDetailController)
        .controller('viewGroupMembersCtrl', viewGroupMembersCtrl)
        .controller('editMemberGroup', editMemberGroup);

    groupDetailController.$inject = ['$location']; 

    var requestReload = false;

    function groupDetailController($location) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'groupDetailController';

        activate();

        function activate() { }
    }

    function editMemberGroup($scope, $stateParams, $ionicHistory, CreateGroup, roomSelected){
        var id_checked = [];
        
        $scope.createType = 'PrivateGroup'
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
                    addMember();
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

        function addMember(){
            for(var i=0; i<id_checked.length; i++){
                $scope.member = { "id":id_checked[i] };
                group.members[length] = $scope.member;
            }
            requestReload = true;
            $ionicHistory.goBack(-1);
        }
    }


    
    function viewGroupMembersCtrl($scope, $stateParams, $state, roomSelected) {
        navHide();
        var room = roomSelected.getRoom();
        var group = getGroup(room.type,$stateParams.chatId);
        var gMembers = group.members;

        $scope.chat = group;
        groupMembers(gMembers, gMembers.length, function done(members) {
            $scope.members = members;
        });
        $scope.members_length = gMembers.length;

        $scope.InviteMembers = function(){
            location.href = '#/tab/group/members/' + $scope.chat._id +'/invite';
        }

        $scope.$on('$ionicView.enter', function(){
            if(requestReload){
                $state.go($state.current, {}, {reload: true});
                requestReload = false;
            }
        });
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
