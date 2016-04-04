(function () {
	'use strict';

	angular
		.module('spartan.backend', [])
		.controller('backendOrgController', backendOrgController)
		.controller('backendPjbController', backendPjbController);

	function backendOrgController($scope, $rootScope, $state, $stateParams, $http, $mdDialog, sharedObjectService) {
		$scope.$on('$ionicView.enter', function() { 
			getDataGroup();
        });
		$scope.webServer = $rootScope.webServer;
		$scope.$on('avatarUrl', function(event, args) { 
			if($stateParams.groupId !== undefined) editGroup(args);
			else createGroup(args);
		});
        $("body").on("click",".more-info-org",function(){
			$state.go('organization-member', { groupId: $(this).data("id") })
		});
		
        $scope.select2options = {
		    allowClear: true,
		    formatResult: function(item, container) {
		    	var image = $scope.webServer + '/timthumb.php?src=' + $rootScope.members[item.id].image + '&h=30&w=30'
		    	return '<span><img src="' + image + '" style="border-radius:50%; margin-right:15px;"/> ' + item.text + '</span>'
		    },
		    formatSelection: function(item, container) {
		    	var image = $scope.webServer + '/timthumb.php?src=' + $rootScope.members[item.id].image + '&h=20&w=20'
		    	return '<span><img src="' + image + '" style="border-radius:50%; "/> ' + item.text + '</span>'
		    }
		}
		$scope.create = function(){
			if($('#avatarToUpload')[0].files.length != 0){
				$scope.$broadcast('uploadImg', []);
			}else{
				createGroup(null);
			}
		}
		$scope.changeGroupStatus = function(index){
			$scope.groupStatus = index
		}
        $scope.saveInfo = function(){
        	if($('#avatarToUpload')[0].files.length != 0){
				$scope.$broadcast('uploadImg', []);
			}else{
				editGroup(null);
			}
        }
        $scope.inviteToGroup = function(){
        	var selectedMember = $('#inviteSelect').val();
        	var members = [];
        	for (var x in selectedMember) {
				members.push({ "id":selectedMember[x] });
			}
        	$http.post($rootScope.restServer + '/groupApi/inviteOrg', {
				"_id": $scope.orgGroup._id,
			    "members": members
			}).then(function success(res) {
				console.log(res);
				selectedMember = "";
				getDataGroup();
	        }, function errorCallback(err) {
	            console.error('err.status');
	        });
        }
        $scope.delectMemberInOrg = function(memberId){
        	$http.post($rootScope.restServer + '/groupApi/deleteMemberOrg', {
				"_id": $scope.orgGroup._id,
			    "members": {id: memberId}
			}).then(function success(res) {
				console.log(res);
				getDataGroup();
	        }, function errorCallback(err) {
	            console.error('err.status');
	        });
        }
        function getDataGroup(){
        	$http.get($rootScope.restServer + '/groupApi/getOrg').then(function success(res) {
			    $scope.orgGroups = res.data.result;
				console.log(res.data.result);
				groupInfo();
	        }, function errorCallback(err) {
	            console.error('err.status');
	        });
        }
        function groupInfo(){
			if($stateParams.groupId !== undefined){
				$.each($scope.orgGroups, function(index,result){
					if(result._id == $stateParams.groupId){
						$scope.orgGroup = $scope.orgGroups[index];
						$scope.groupStatus = $scope.orgGroup.status;
						$scope.status = ["Active", "Disable"];
						$.each($scope.orgGroup.members, function (position, value) {
							if(value !== undefined){
								$.extend( value, $rootScope.members[value.id] );
							}
						});
						getExternalMember();
						return false
					}
				});
			}
		}
		function getExternalMember(){
        	$scope.externalMembers = jQuery.extend({}, $rootScope.members)
        	$.each($scope.orgGroup.members, function (index, result) {
        		if($scope.externalMembers[result._id] != null){
        			delete $scope.externalMembers[result._id];
        		}
        	});
        }
        function editGroup(img){
        	if(img==null) img = $scope.orgGroup.image;
        	var dataForm = $('#UploadAvatar').serializeArray();
        	$http.post($rootScope.restServer + '/groupApi/editGroup', {
				"_id": $scope.orgGroup._id,
				"name": dataForm[0].value,
				"description": dataForm[1].value,
				"status": $scope.groupStatus,
				"nodeId": dataForm[3].value,
				"image": img
			}).then(function success(res) {
				console.log(res);
				getDataGroup();
	        }, function errorCallback(err) {
	            console.error('err.status');
	        });
        }
		function createGroup(img){
			var selectedMember = $('#inviteSelect').val();
			var members = [];
			var dataForm = $('#UploadAvatar').serializeArray();
			for (var x in selectedMember) {
				members.push({ "id":selectedMember[x] });
			}
			$http.post($rootScope.restServer + '/groupApi/createOrg', {
				"name": dataForm[0].value,
				"type": 0,
				"description": dataForm[1].value,
				"image": img,
				"status": 0,
				"nodeId": dataForm[2].value,
			    "members": members
			}).then(function success(res) {
				console.log(res);
				getDataGroup();
				$state.go('organization');
	        }, function errorCallback(err) {
	            console.error('err.status');
	        });
		}
		function delectGroupOrg(groupId){
        	$http.post($rootScope.restServer + '/groupApi/deleteGroupOrg', {
				"_id": groupId
			}).then(function success(res) {
				console.log(res);
				getDataGroup();
	        }, function errorCallback(err) {
	            console.error('err.status');
	        });
        }
		$scope.showConfirm = function(ev,group) {
		    var confirm = $mdDialog.confirm()
		          .title('Would you like to delete ' + group.name +' Group ?')
		          .textContent('This group is will be delete')
		          .ok('YES')
		          .cancel('NO');
		    $mdDialog.show(confirm).then(function() {
				delectGroupOrg(group._id);
		    }, function() {

		    });
		};		
	}
	function backendPjbController($scope, $rootScope, $state, $stateParams, $mdDialog, $http, ProjectBase){
		$scope.$on('$ionicView.enter', function() { 
			getDataGroup();
        });
        $scope.$on('avatarUrl', function(event, args) { 
			if($stateParams.groupId !== undefined) editGroup(args);
			else createGroup(args);
		});
		$scope.webServer = $rootScope.webServer;
		$scope.editingData = {};

		$scope.jobPosition=[];
		$scope.rolePosition = [ {"role": MemberRole[MemberRole.member]}, {"role": MemberRole[MemberRole.admin]}];
		for(var x=0; x<main.getDataManager().companyInfo.jobPosition.length; x++){
			$scope.jobPosition.push({"job":main.getDataManager().companyInfo.jobPosition[x]});
		}
        $("body").on("click",".more-info-pjb",function(){
			$state.go('projectbase-member', { groupId: $(this).data("id") })
		});

		function getDataGroup(){
        	$http.get($rootScope.restServer + '/groupApi/getPjb').then(function success(res) {
			    $scope.pjbGroups = res.data.result;
				console.log(res.data.result);
				groupInfo();
	        }, function errorCallback(err) {
	            console.error('err.status');
	        });
        }
        function groupInfo(){
			if($stateParams.groupId !== undefined){
				$.each($scope.pjbGroups, function(index,result){
					if(result._id == $stateParams.groupId){
						$scope.pjbGroup = $scope.pjbGroups[index];
						$scope.groupStatus = $scope.pjbGroup.status;
						$scope.status = ["Active", "Disable"];
						$.each($scope.pjbGroup.members, function (position, value) {
							if($rootScope.members[value.id] !== undefined){
								value._id = $rootScope.members[value.id].id;
								value.displayname = $rootScope.members[value.id].displayname;
								value.image = $rootScope.members[value.id].image;
								value.mail = $rootScope.members[value.id].mail;
								value.tel = $rootScope.members[value.id].tel;
								if(value.role==null) value.role = MemberRole[MemberRole.member];
								if(value.jobPosition==null) value.jobPosition = main.getDataManager().companyInfo.jobPosition[0];
								ProjectBase.setRolePosition(value.id,value.role,value.jobPosition);
							}
						});
						getExternalMember();
						return false
					}
				});
			}
		}
		$scope.create = function(){
			if($('#avatarToUpload')[0].files.length != 0){
				$scope.$broadcast('uploadImg', []);
			}else{
				createGroup(null);
			}
		}
		function createGroup(img){
			var selectedMember = $('#inviteSelect').val();
			var members = [];
			var dataForm = $('#UploadAvatar').serializeArray();
			for (var x in selectedMember) {
				members.push({ "id":selectedMember[x] });
			}
			$http.post($rootScope.restServer + '/groupApi/createOrg', {
				"name": dataForm[0].value,
				"type": 1,
				"description": dataForm[1].value,
				"image": img,
				"status": 0,
				"nodeId": dataForm[2].value,
			    "members": members
			}).then(function success(res) {
				console.log(res);
				getDataGroup();
				$state.go('projectbase');
	        }, function errorCallback(err) {
	            console.error('err.status');
	        });
		}
		$scope.saveInfo = function(){
        	if($('#avatarToUpload')[0].files.length != 0){
				$scope.$broadcast('uploadImg', []);
			}else{
				editGroup(null);
			}
        }
        function editGroup(img){
        	if(img==null) img = $scope.pjbGroup.image;
        	var dataForm = $('#UploadAvatar').serializeArray();
        	console.log(dataForm);
        	$http.post($rootScope.restServer + '/groupApi/editGroup', {
				"_id": $scope.pjbGroup._id,
				"name": dataForm[0].value,
				"description": dataForm[1].value,
				"status": $scope.groupStatus,
				"nodeId": dataForm[3].value,
				"image": img
			}).then(function success(res) {
				console.log(res);
				getDataGroup();
	        }, function errorCallback(err) {
	            console.error('err.status');
	        });
        }

		function getExternalMember(){
        	$scope.externalMembers = jQuery.extend({}, main.getDataManager().orgMembers)
        	$.each($scope.pjbGroup.members, function (index, result) {
        		if($scope.externalMembers[result._id] != null){
        			delete $scope.externalMembers[result._id];
        		}
        	});
        }
        function setDefaultEditingData(){
        	for (var i = 0, length = $scope.pjbGroup.members.length; i < length; i++) {
		    	$scope.editingData[$scope.pjbGroup.members[i].id] = false;
		    }
        }
        function openSelectRole(id){
			$scope.targetId = id;
			var index = ProjectBase.getRolePositionIndex(id);
			$scope.job = $scope.jobPosition[index[1]];
			$scope.role = $scope.rolePosition[index[0]];
		};
		$scope.inviteToGroup = function(){
        	var selectedMember = $('#inviteSelect').val();
        	var members = [];
        	for (var x in selectedMember) {
				members.push({ "id":selectedMember[x] });
			}
        	$http.post($rootScope.restServer + '/groupApi/inviteOrg', {
				"_id": $scope.pjbGroup._id,
			    "members": members
			}).then(function success(res) {
				console.log(res);
				getDataGroup();
	        }, function errorCallback(err) {
	            console.error('err.status');
	        });
        }
        $scope.modify = function(tableData){
	        $scope.editingData[tableData.id] = true;
	        openSelectRole(tableData.id);
	    };
	    $scope.update = function(tableData){
	        $scope.editingData[tableData.id] = false;
	    };
	    $scope.delectMemberInOrg = function(memberId){
        	$http.post($rootScope.restServer + '/groupApi/deleteMemberOrg', {
				"_id": $scope.pjbGroup._id,
			    "members": {id: memberId}
			}).then(function success(res) {
				console.log(res);
				getDataGroup();
	        }, function errorCallback(err) {
	            console.error('err.status');
	        });
        }
        $scope.select2options = {
		    allowClear: true,
		    formatResult: function(item, container) {
		    	var image = $scope.webServer + '/timthumb.php?src=' + $rootScope.members[item.id].image + '&h=30&w=30'
		    	return '<span><img src="' + image + '" style="border-radius:50%; margin-right:15px;"/> ' + item.text + '</span>'
		    },
		    formatSelection: function(item, container) {
		    	var image = $scope.webServer + '/timthumb.php?src=' + $rootScope.members[item.id].image + '&h=20&w=20'
		    	return '<span><img src="' + image + '" style="border-radius:50%; "/> ' + item.text + '</span>'
		    }
		}
		function delectGroupOrg(groupId){
        	$http.post($rootScope.restServer + '/groupApi/deleteGroupOrg', {
				"_id": groupId
			}).then(function success(res) {
				console.log(res);
				getDataGroup();
	        }, function errorCallback(err) {
	            console.error('err.status');
	        });
        }
		$scope.showConfirm = function(ev,group) {
		    var confirm = $mdDialog.confirm()
		          .title('Would you like to delete ' + group.name +' Group ?')
		          .textContent('This group is will be delete')
		          .ok('YES')
		          .cancel('NO');
		    $mdDialog.show(confirm).then(function() {
				delectGroupOrg(group._id);
		    }, function() {

		    });
		};	
	}
})();