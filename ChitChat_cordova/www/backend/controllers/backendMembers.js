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
            console.info('activate.', vm.title);

            $rootScope.title = 'Members';
        }

		$http.get($rootScope.restServer + '/users/getOrgMembers').then(function success(res) {
		    var members = {};

		    async.map(res.data.result, function iterator(item, cb){
                members[item._id] = item;
                cb();
            }, function done(err) {
			    $rootScope.members = members;
            });
        }, 
        function errorCallback(err) {
            console.error('err.status');
        });

        function moreInfo(userId) {
			$state.go('backend.member-info', { memberId: userId });
        }
    }

    function backendMemberInfo($location, $http, $scope, $state, $rootScope, $mdDialog, $ionicLoading,
    sharedObjectService) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'backendMemberInfo';
        var userId = '';

        $scope.profile = {};
        $scope.goto = goto;

        $scope.$on('stateChanged', function (events, params) {
            if (params.toState.name === 'backend.member-info') {

                userId = params.toParams.memberId;

                activate();
            }
        });

        function activate() {
            console.info('activate.', vm.title);

            getMemberProfile();
        }

        function getMemberProfile() {
            $scope.profile = sharedObjectService.getDataManager().getContactProfile(userId);

            console.info($scope.profile);
        }

        function goto(stateName) {
            $state.go(stateName);
        }
    }
})();