(function () {
	'use strict';

	angular
		.module('spartan.backend', [])
		.controller('backendOrgController', backendOrgController)
		.controller('backendPjbController', backendPjbController)

	function backendOrgController($scope, $rootScope, $state, $stateParams, $http, sharedObjectService){
		$http.get($rootScope.restServer + '/groupApi/getOrg').then(function success(res) {
			$scope.orgGroups = res.data.result;
			groupInfo();
        }, function errorCallback(err) {
            console.error('err.status');
        });
		$scope.$on('avatarUrl', function(event, args) { 
			if($stateParams.groupId !== undefined) editOrgGroup(args);
			else createOrgGroup(args);
		});
		$scope.webServer = $rootScope.webServer;
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
				createOrgGroup(null);
			}
		}
		$scope.changeGroupStatus = function(index){
			$scope.groupStatus = index
		}
        $scope.saveInfo = function(){
        	if($('#avatarToUpload')[0].files.length != 0){
				$scope.$broadcast('uploadImg', []);
			}else{
				editOrgGroup(null);
			}
        }
        $scope.inviteToGroup = function(){
        	var selectedMember = $('#inviteSelect').val();
        	var members = [];
        	for (var x in selectedMember) {
				members.push({ "id":selectedMember[x] });
			}
			console.log(members);
        	$http.post($rootScope.restServer + '/groupApi/inviteOrg', {
				"_id": $scope.orgGroup._id,
			    "members": members
			}).then(function success(res) {
				console.log(res);
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
        function editOrgGroup(img){
        	if(img==null) img = $scope.orgGroup.image;
        	var dataForm = $('#UploadAvatar').serializeArray();
        	$http.post($rootScope.restServer + '/groupApi/editOrg', {
				"_id": $scope.orgGroup._id,
				"name": dataForm[0].value,
				"description": dataForm[1].value,
				"status": $scope.groupStatus,
				"nodeId": dataForm[3].value,
				"image": img
			}).then(function success(res) {
				console.log(res);
	        }, function errorCallback(err) {
	            console.error('err.status');
	        });
        }
		function createOrgGroup(img){
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
	        }, function errorCallback(err) {
	            console.error('err.status');
	        });
		}
		
	}
	function backendPjbController($scope, $rootScope, $state, $stateParams, ProjectBase){
		$scope.webServer = $rootScope.webServer;
		$scope.pjbGroups = main.getDataManager().projectBaseGroups
		$scope.editingData = {};

		$scope.jobPosition=[];
		$scope.rolePosition = [ {"role": MemberRole[MemberRole.member]}, {"role": MemberRole[MemberRole.admin]}];
		for(var x=0; x<main.getDataManager().companyInfo.jobPosition.length; x++){
			$scope.jobPosition.push({"job":main.getDataManager().companyInfo.jobPosition[x]});
		}

		main.getDataManager().onProjectBaseGroupsDataReady = function () {
        	setTimeout(function(){  
        		$scope.pjbGroups = main.getDataManager().projectBaseGroups;
        	}, 3000);
        };
        $("body").on("click",".more-info-pjb",function(){
			$state.go('projectbase-member', { groupId: $(this).data("id") })
		});
		if($scope.pjbGroups[$stateParams.groupId] != null && $state.current.name == "projectbase-member"){
			$scope.orgGroup = $scope.pjbGroups[$stateParams.groupId];
			$.each($scope.orgGroup.members, function (index, result) {
				if(result !== undefined ){
					var member = main.getDataManager().orgMembers[result.id];
					if(member !== undefined)
					{
						result._id = result.id;
						result.displayname = member.displayname;
						result.image = member.image;
						result.mail = member.mail;
						result.tel = member.tel;
					}
					if(result.role==null) result.role = "member";
					if(result.jobPosition==null) result.jobPosition = "Softwate Developer";
					ProjectBase.setRolePosition(result._id,result.role,result.jobPosition);
				}
			});
			getExternalMember();
			setDefaultEditingData();
		}
		function getExternalMember(){
        	$scope.externalMembers = jQuery.extend({}, main.getDataManager().orgMembers)
        	$.each($scope.orgGroup.members, function (index, result) {
        		if($scope.externalMembers[result._id] != null){
        			delete $scope.externalMembers[result._id];
        		}
        	});
        }
        function setDefaultEditingData(){
        	for (var i = 0, length = $scope.orgGroup.members.length; i < length; i++) {
		    	$scope.editingData[$scope.orgGroup.members[i].id] = false;
		    }
        }
        function openSelectRole(id){
			$scope.targetId = id;
			var index = ProjectBase.getRolePositionIndex(id);
			$scope.job = $scope.jobPosition[index[1]];
			$scope.role = $scope.rolePosition[index[0]];
		};
       

        $scope.modify = function(tableData){
	        $scope.editingData[tableData.id] = true;
	        openSelectRole(tableData.id);
	    };
	    $scope.update = function(tableData){
	        $scope.editingData[tableData.id] = false;
	    };
        $scope.select2options = {
		    allowClear: true,
		    formatResult: function(item, container) {
		    	var image = $scope.webServer + '/timthumb.php?src=' + main.getDataManager().orgMembers[item.id].image + '&h=30&w=30'
		    	return '<span><img src="' + image + '" style="border-radius:50%; margin-right:15px;"/> ' + item.text + '</span>'
		    },
		    formatSelection: function(item, container) {
		    	var image = $scope.webServer + '/timthumb.php?src=' + main.getDataManager().orgMembers[item.id].image + '&h=20&w=20'
		    	return '<span><img src="' + image + '" style="border-radius:50%; "/> ' + item.text + '</span>'
		    }
		}
	}

})();