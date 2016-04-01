(function () {
    'use strict';

    angular
        .module('spartan.backend')
        .controller('backendMembers', backendMembers)
        .controller('backendMemberInfo', backendMemberInfo);

    function backendMembers($location, $http, $scope, $state, $rootScope, $mdDialog, $ionicLoading) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'backendMembers';
   
        $scope.webServer = $rootScope.webServer;
        $scope.moreInfo = moreInfo;
        $scope.member = {};
        $rootScope.members = {};

        activate();

        function activate() {

        }

		$http.get($rootScope.restServer + '/users/getOrgMembers').then(function success(res) {
			var members = {}
			$.each(res.data.result, function(index,result){
				members[result._id] = result;
			});
			$rootScope.members = members;
        }, 
        function errorCallback(err) {
            console.error('err.status');
        });

        function moreInfo(userId) {
			$state.go('member-info', { memberId: userId });
        }
    }

    function backendMemberInfo($location, $http, $scope, $state, $stateParams, $rootScope, $mdDialog, $ionicLoading,
    sharedObjectService) {
          /* jshint validthis:true */
        var vm = this;
        vm.title = 'backendMemberInfo';
   
        var userId = $stateParams.memberId;
        $scope.profile = {};

        activate();
        getMemberProfile();
        function activate() {
          
        }
        
        function getMemberProfile() {
            $scope.profile = sharedObjectService.getDataManager().getContactProfile(userId);
        }
    }
})();