(function () {
    'use strict';

    angular
        .module('spartan.controllers')
        .controller('signupController', signupController);

//    voiceCallController.$inject = ['$location'];

    function signupController($location, $http, $scope, $state, $rootScope, $mdDialog, $ionicLoading) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'signupController';
        $scope.account = {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            firstname: '',
            lastname: '',
            tel:''
        };
        $scope.gotoSigning = gotoSigning;
        $scope.continue = submitForm;
   
        var alert;

        activate();

        function activate() {

        }

        function gotoSigning() {
            $state.go('login');
        }

        function submitForm() {
            if (ionic.Platform.platform() === 'ios' || ionic.Platform.platform() === 'android') {
                try {
                    $cordovaSpinnerDialog.show("", "'Submiting...'", true);
                }
                catch (exception) {
                    console.warn(exception);
                }
            }
            else {
                $ionicLoading.show({
                    template: 'Submiting...'
                });
            }

            var account = JSON.parse(JSON.stringify($scope.account));
            if (!!account.username && !!account.email && !!account.password && !!account.firstname && !!account.lastname) {
                if (account.password === account.confirmPassword) {
                    main.getHashService(account.password, function (err, res) {
                        account.password = res;
                        delete account.confirmPassword;

                        var data = {
                            user: account,
                            teamRegister: $rootScope.teamInfo.root
                        };
                        $http.post($rootScope.restServer + '/users/signup', data)
                            .then(function successCallback(response) {
                                console.log(response.data);

                                $ionicLoading.hide();
                                alert = $mdDialog.alert({
                                    title: 'Submit Success',
                                    textContent: 'Welcome to ' + $rootScope.teamInfo.name,
                                    ok: 'Close'
                                });
                                $mdDialog
                                  .show(alert)
                                  .finally(function () {
                                      alert = undefined;
                                      $state.go('login');
                                  });

                            }, function errorCallback(response) {
                                console.warn(response.data);

                                $ionicLoading.hide();
                                alert = $mdDialog.alert({
                                    title: 'Submit Fail!',
                                    textContent: response.data.message,
                                    ok: 'Close'
                                });
                                $mdDialog
                                  .show(alert)
                                  .finally(function () {
                                      alert = undefined;
                                  });
                            });
                    });
                }
                else {
                    var msg = 'Password and confirm password fields is not match.!';
                    console.warn(msg);

                    $ionicLoading.hide();
                    alert = $mdDialog.alert({
                        title: 'Submit Fail!',
                        textContent: msg,
                        ok: 'Close'
                    });
                    $mdDialog
                      .show(alert)
                      .finally(function () {
                          alert = undefined;
                      });
                }
            }
            else {
                console.warn('Some params is missing.');
                
                $ionicLoading.hide();
                alert = $mdDialog.alert({
                    title: 'Submit Fail!',
                    textContent: 'Some params is missing.!',
                    ok: 'Close'
                });
                $mdDialog
                  .show(alert)
                  .finally(function () {
                      alert = undefined;
                  });
            }
        }
    }
})();