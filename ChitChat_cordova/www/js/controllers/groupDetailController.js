(function () {
    'use strict';

    angular
        .module('spartan.group', [])
        .controller('groupDetailController', groupDetailController)
        .controller('viewGroupMembersCtrl', viewGroupMembersCtrl)
        .controller('editMemberGroup', editMemberGroup);

    groupDetailController.$inject = ['$location']; 

    function groupDetailController($location) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'groupDetailController';

        activate();

        function activate() { }
    }

    function editMemberGroup($scope, $stateParams, CreateGroup, roomSelected){
        $scope.createType = 'PrivateGroup'
        $scope.myProfile = main.getDataManager().myProfile;

        $scope.allmembers = CreateGroup.getAllMember();

        var room = roomSelected.getRoom();


        for(var i=0; i<room.members.length; i++){
            var x;
            $.each($scope.allmembers, function(index, result) {
                if(result._id == room.members[i].id){
                    x = index;
                }
            });
            $scope.allmembers.splice(x,1);
        }

        console.log($scope.allmembers);
    }
    
    function viewGroupMembersCtrl($scope, $stateParams, roomSelected) {
        navHide();
        var room = roomSelected.getRoom();
        var group = null;
        switch (room.type) {
            case 0:
                group = main.getDataManager().orgGroups[$stateParams.chatId];
                break;
            case 1:
                group = main.getDataManager().projectBaseGroups[$stateParams.chatId];
                break;
            case 2:
                group = main.getDataManager().privateGroups[$stateParams.chatId];
                break;
            default:
                break;
        }

        var gMembers = group.members;

        $scope.chat = group;
        groupMembers(gMembers, gMembers.length, function done(members) {
            $scope.members = members;
        });
        $scope.members_length = gMembers.length;

        $scope.InviteMembers = function(){
            location.href = '#/tab/group/members/' + $scope.chat._id +'/invite';
        }
    }
})();
