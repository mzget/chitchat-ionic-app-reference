var date = new Date();
var now;
var newchatmessage;
var chatlog_count = 0;

angular.module('spartan.controllers')

.factory('getProfileMember',function(){
    var result;
    function _all(){

    }
})

.controller('FreecallCtrl', function($scope, $stateParams) {
	
})

.controller('HeaderChatCtrl', function($scope, $rootScope){
    
    $scope.$on('roomName', function(event, args) {
        $scope.roomName = args;
        setTimeout(function () {
            document.getElementById('chatMessage').style.display = "flex";
            resizeUI();
        }, 1000);
    });
    window.onresize = function(event) {
        document.getElementById('chatHeader').style.width = window.innerWidth - 284 + "px";
        document.getElementById('chatMessage').style.left = jQuery('#chat-list').offset().left + jQuery('#chat-list').width() + "px";
        document.getElementById('chatMessage').style.width = jQuery('#webchatdetail').width() + "px";
    };
    document.getElementById('chatHeader').style.width = window.innerWidth - 284 + "px";

    var viewInfo = true;
    $scope.toggleInfo = function() {
        viewInfo = !viewInfo;
        $rootScope.$broadcast('toggleInfo',viewInfo);
        setTimeout(function () {
            resizeUI();
        }, 100);
    }
    function resizeUI(){
        document.getElementById('chatMessage').style.left = jQuery('#chat-list').offset().left + jQuery('#chat-list').width() + "px";
        document.getElementById('chatMessage').style.width = jQuery('#webchatdetail').width() + "px";
    }
})

.controller('optionsController', function($scope, $state, $ionicModal,$timeout,CreateGroup,$localStorage, $rootScope, $ionicPopover, dbAccessService) {
        $scope.settings = {
            logOut: true,
        };

        $scope.myProfile = main.getDataManager().myProfile;
        $scope.admin = UserRole.admin;

        $scope.createType = function(type){
            CreateGroup.createType = type;
            location.href = '#/tab/account/create'
            console.log(CreateGroup.createType);
        }
        
        $ionicModal.fromTemplateUrl('templates/modal-theme.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.thememodal = modal
        })  

        $scope.openThemeModal = function() {
            $scope.thememodal.show()
        }

        $scope.closeThemeModal = function() {
            $scope.thememodal.hide();
        };

        $scope.$on('$destroy', function () {
            $scope.thememodal.remove();
        });
      
     
        $scope.data = {
            'themedefault': 'css/themedefault.css',
            'themeblue': 'css/themeblue.css',
            'themebrown': 'css/themebrown.css',
            'themegreen': 'css/themegreen.css',
            'themered': 'css/themered.css',
            'themeviole': 'css/themeviole.css',
            'themeyellow': 'css/themeyellow.css'
        }

        $scope.save_settings = function( data ) {
            $localStorage.themeData = data;
            $rootScope.theme = $localStorage.themeData;
            console.log($rootScope.themeblue)
        }

        $scope.logOut = function () {
            console.warn("logOut...");
            server.logout();
            server.dispose();

            dbAccessService.clearMessageDAL();
            localStorage.clear();
            //$state.go('tab.login');
            location.href = '';
        }
})
.controller('AccountCreate',function($scope,$rootScope,$state,$ionicHistory,$ionicLoading,$cordovaProgress,CreateGroup,FileService) {
    console.log('AccountCreate',CreateGroup.createType);
    var myProfile = main.getDataManager().myProfile;
    $rootScope.members = CreateGroup.getSelectedMember();
    $scope.model = { groupname: "" };
    var roomId = "";
    $scope.submit = function(){
        createGroup();
    }
    function createGroup(){
        $ionicLoading.show({
            template: 'Loading..'
        });
        if(CreateGroup.createType=="PrivateGroup"){
            server.UserRequestCreateGroupChat($scope.model.groupname,CreateGroup.getSelectedIdWithMe(), function(err, res) {
                if (!err) {
                    console.log(JSON.stringify(res));
                    roomId = res.data._id;
                    uploadImageGroup();
                }
                else {
                    console.warn(err, res);
                }
            });
        }else{
            server.requestCreateProjectBaseGroup($scope.model.groupname,CreateGroup.getSelectedMemberProjectBaseWithMe(), function(err, res) {
                if (!err) {
                    console.log(JSON.stringify(res));
                    roomId = res.data._id;
                    uploadImageGroup();
                }
                else {
                    console.warn(err, res);
                }
            });
        }
    }
    function createSuccess() {
        $ionicLoading.hide();
        $cordovaProgress.showSuccess(false, "Success!");
        setTimeout(function () { $cordovaProgress.hide(); }, 1500);
    }
    function uploadImageGroup(){
        if(FileService.getImages() != '') {
            $scope.$broadcast('uploadImg','uploadImg');
        }else{
            //$state.go('tab.group');
            createSuccess();
            $rootScope.$ionicGoBack();
        }
    }
    $scope.$on('fileUrl', function(event, args) {
        server.UpdatedGroupImage(roomId,args[0], function(err, res){
            if(!err){
                console.log(JSON.stringify(res));
                createSuccess();
                //$state.go('tab.group');
                $rootScope.$ionicGoBack();
            }else{
                console.warn(err, res);
            }
        });
    });
    $rootScope.$ionicGoBack = function() {
        if($state.current.name=='tab.account-create'){
            CreateGroup.clear();
        }
        $ionicHistory.goBack(-1);
    };

})

.controller('AccountInvite',function($scope,$rootScope,CreateGroup) {
    $scope.createType = CreateGroup.createType;
    $scope.myProfile = main.getDataManager().myProfile;
    $scope.allmembers = CreateGroup.getAllMember();

    $scope.checked = function(id,selected){
        CreateGroup.setMemberSelected(id,selected);
    }

    $scope.$on('$ionicView.beforeLeave', function(){
        //console.log('Back to Previously');
        $rootScope.members = CreateGroup.getSelectedMember();
    });
})

.controller('bobo', function ($scope, $rootScope, $timeout,$ionicPlatform, chatslogService) {
    /* jshint validthis:true */
    var vm = this;
    vm.title = 'bobo';

    var refresh = function () {
        if (!!chatslogService) {
            $scope.foo = chatslogService.getChatsLogCount();
            $timeout(refresh, 1000);
        }
    }
    $timeout(refresh, 1000);
})

.controller('CreateProjectBase',function($scope,$ionicModal,$rootScope,$ionicLoading,$cordovaProgress,CreateGroup,ProjectBase, roomSelected) {
	if(CreateGroup.createType!='ProjectBase'){ return; }
		$scope.jobPosition=[];
		$scope.rolePosition = [
			{"role": MemberRole[MemberRole.member]},
			{"role": MemberRole[MemberRole.admin]}];
		for(x=0; x<main.getDataManager().companyInfo.jobPosition.length; x++){
			$scope.jobPosition.push({"job":main.getDataManager().companyInfo.jobPosition[x]});
		}
		$scope.targetId = "";
	
		$scope.savePosition = function(role,job){
			ProjectBase.setRolePosition($scope.targetId,role,job);
			if($rootScope.status=='edit'){
				$ionicLoading.show({
			      template: 'Loading..'
			  	});
				var room = roomSelected.getRoom();
				var member = new function(){
			        this.id = $scope.targetId;
			        this.role = MemberRole[ ProjectBase.getRolePositionIndex($scope.targetId)[0] ];
			        this.jobPosition = job;
			    }
				server.editMemberInfoInProjectBase(room._id,RoomType[room.type],member, function(err, res) {
					if (!err) {
						console.log(JSON.stringify(res));
						$.each(room.members, function(index, result) {
		                    if(result._id == $scope.targetId){
		                        result.role = role;
		                        console.log(result.role);
		                        result.jobPosition = job;
		                    }
		                });
		                saveSuccess();
					}
					else {
						console.warn(err, res);
					}
				});
			}
			$scope.closeSelectRole();
		}
		function saveSuccess() {
        	$ionicLoading.hide();
        	$cordovaProgress.showSuccess(false, "Success!");
            setTimeout(function () { $cordovaProgress.hide(); }, 1500);
        }
		$scope.openSelectRole = function(id){
			$scope.targetId = id;
			var index = ProjectBase.getRolePositionIndex(id);
			$scope.job = $scope.jobPosition[index[1]];
			$scope.role = $scope.rolePosition[index[0]];
			if($rootScope.status=='edit'){ $scope.isAdmin = isAdminInProjectBase(roomSelected.getRoom(),id); }
			$scope.modal.show();
		};
		$scope.closeSelectRole = function() {
		    $scope.modal.remove();
		    createModalSlectPosition();
		};
	
		createModalSlectPosition();
		function createModalSlectPosition(){
			$ionicModal.fromTemplateUrl('templates/modal-select-role-projectbase.html', {
			    scope: $scope,
			    animation: 'slide-in-up'
			}).then(function(modal) {
			    $scope.modal = modal;
			});
		};

})

.filter('orderObjectBy', function () {
  return function(items, field, reverse) {
    var filtered = [];
    angular.forEach(items, function(item) {
        filtered.push(item);
    });
    filtered.sort(function (a, b) {
        if (!!a[field] && !!b[field]) {
            return (a[field].toLowerCase() > b[field].toLowerCase() ? 1 : -1);
        }
        else {
            return 1;
        }
    });
    if (reverse) filtered.reverse();
    return filtered;
  };
})
.filter('orderByDate', function () {
  return function(items, field, reverse) {
    var filtered = [];
    angular.forEach(items, function(item) {
        filtered.push(item);
    });
    filtered.sort(function (a, b) {
        if (!!a[field] && !!b[field]) {
            if(a[field].isValid() && !b[field].isValid() || new Date(a[field]) > new Date(b[field])) return 1;
            else if(!a[field].isValid() && b[field].isValid() || new Date(a[field]) < new Date(b[field])) return -1;
            else return -1;      
        }
        else {
            return 1;
        }
    });
    if (reverse) filtered.reverse();
    return filtered;
  };
});
// .directive('hideTabBar', function($timeout) {
//   var style = angular.element('<style>').html(
//     '.has-tabs.no-tabs:not(.has-tabs-top) { bottom: 0; }\n' +
//     '.no-tabs.has-tabs-top { top: 44px; }');
//   document.body.appendChild(style[0]);
//   return {
//     restrict: 'A',
//     compile: function(element, attr) {
//       var tabBar = document.querySelector('.tab-nav');
//       return function($scope, $element, $attr) {
//         var scroll = $element[0].querySelector('.scroll-content');
//         $scope.$on('$ionicView.beforeEnter', function() {
//           tabBar.classList.add('slide-away');
//           scroll.classList.add('no-tabs');
//         });
//       }
//     }
//   };
// })
// .directive('showTabBar', function($timeout) {
//   var style = angular.element('<style>').html(
//     '.has-tabs.no-tabs:not(.has-tabs-top) { bottom: 0; }\n' +
//     '.no-tabs.has-tabs-top { top: 44px; }');
//   document.body.appendChild(style[0]);
//   return {
//     restrict: 'A',
//     compile: function(element, attr) {
//       var tabBar = document.querySelector('.tab-nav');
//       return function($scope, $element, $attr) {
//         var scroll = $element[0].querySelector('.scroll-content');
//         $scope.$on('$ionicView.beforeEnter', function() {
//           tabBar.classList.remove('slide-away');
//           scroll.classList.remove('no-tabs');
//         });
//       }
//     }
//   };
// }); // <-- LAST CONTROLLER

function isAdminInProjectBase(room,memberId){
    var admin = false;
    $.each(room.members, function(index, result) {
        if(result._id == memberId){
            if(result.role == MemberRole[MemberRole.admin]) { admin = true; }
        }
    });
    return admin;
}

function groupMembers(members, size, callback)
{
	var max = members.length;
	if( max > 5 )
		max = 5;
		
	if( size )
	    max = size;

    var counter = 0;
	var gmember = [];
	var getGroupMembers = function() {
		for(var i = 0; i <= members.length; i++) {
			if(!!members[i]) {
				var mem_id = members[i].id;
				var member = main.getDataManager().orgMembers[mem_id];
				if(!!member) {
					gmember.push(member);
					counter += 1;
	
					if(counter >= max) { break; }
				}
			}
		}
		
		if(gmember.length === 0 && !dataManager.isOrgMemberReady) {
			waitForOrgMembers();
		}
		else {
			callback(gmember);
		}
	}
	var waitForOrgMembers = function() {
		setTimeout(function() {
			getGroupMembers();
		}, 500);
	}
	
	if(dataManager.isOrgMemberReady) {
		getGroupMembers();
	}
	else {
		waitForOrgMembers();
	}
}

function back()
{
	//$('#send_message').css({'display':'none'});
	//$('#chatroom_back').css({'display':'none'});
}

function testfunc()
{
	return 'tabs-item-hide';
}