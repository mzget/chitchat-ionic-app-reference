(function () {
    'use strict';

    angular
        .module('spartan.auth', [])
        .controller('authController', authController)
        .controller('noConnection', noConnection);

    function authController($location, $ionicPlatform, $ionicLoading, $state, $localStorage, $ionicModal, $scope, $rootScope, $cordovaSpinnerDialog, networkService, chatslogService) {
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'authController';
        var registrationId = "";
     
        $ionicPlatform.ready(function () {
            activateBackground();
            activate();
            setConfigTheme();
            main.setDataManager(dataManager);
            main.setServerListener(serverEvents);
            main.setServerImp(server);
            main.onMyProfileReadyListener = function (dataManager) {
                $('#login').css('display', 'none');
                $('.bar-stable').css({ 'display': '' });
                $('#splash').css({ 'display': 'none' });

                // Hide spinner dialog
                if (cordova.platformId === "ios") {
                    $cordovaSpinnerDialog.hide();
                }
                else if (cordova.platformId === "windows") {
                    $ionicLoading.hide();
                }
                    
                console.log("appConfig", server.appConfig.webserver);

                //location.href = "#/tab/group";
                $state.go('tab.group');
                activateNetworkService();
            };
            initSpartanServer();
            
            setTimeout(function () {
                if (!!navigator.splashscreen) {
                    navigator.splashscreen.hide();
                }
            }, 100);
        });

        function activate() {
            console.warn('authController activate');

            console.log("init push notification.");

            if (cordova.platformId === "ios") {
                var push = PushNotification.init({
                    "ios": { "alert": "true", "badge": "true", "sound": "true" }
                });

                push.on('registration', function (data) {
                    console.log("registration event", JSON.stringify(data));
                    registrationId = data.registrationId;
                    localStorage.setItem("registrationId", registrationId);
                });

                push.on('notification', function (data) {
                    console.warn("notification event", JSON.stringify(data));

                    push.finish(function () {
                        console.warn('finish successfully called');
                    });
                });

                push.on('error', function (e) {
                    console.error("push error", e.message);
                });
            }
        }
        
        function activateBackground() {
            if (cordova.platformId === "ios") {
                // Prevent the app from going to sleep in background
                cordova.plugins.backgroundMode.enable();
                // Get informed when the background mode has been activated
                cordova.plugins.backgroundMode.onactivate = function () {
                    console.warn("backgroundMode.onactivate");

                    var logCount = chatslogService.getChatsLogCount();
                    cordova.plugins.notification.badge.set(logCount);
                };

                // Get informed when the background mode has been deactivated
                cordova.plugins.backgroundMode.ondeactivate = function () {
                    console.warn("backgroundMode.ondeactivate");
                };
            }
        }

        function activateNetworkService() {
            networkService.regisSocketListener();
        }

        function initSpartanServer() {
            function initCallback (err, server) {
                console.log("Init serve completed is connected:", server._isConnected, JSON.stringify(err));
                if (err !== null) {
                    onServerConnectionFail(err);
                }
                else {
                    onReadyToSigning();
                }
            }
            server.init(initCallback);
        }

        function onLoginTimeout(param) {
            // Hide spinner dialog
            $cordovaSpinnerDialog.hide();

            navigator.notification.alert(param.message, function callback() {
                location.href = '';
            }, "Login Timeout!", "OK");
        }

        function onDuplicateLogin(param) {
            // Hide spinner dialog
            if (cordova.platformId === "ios") {
                $cordovaSpinnerDialog.hide();
            }
            else if (cordova.platformId === "windows") {
                $ionicLoading.hide();
            }

            navigator.notification.confirm("May be you use this app in other devices \n You want to logout other devices",
                function (buttonIndex) {
                    switch (buttonIndex) {
                        case 1:
                            location.href = '';
                            break;
                        case 2:
                            server.kickMeAllSession(param.uid);
                            location.href = "";
                            break;
                    }
                }, "Duplicated login!", ["Cancle", "OK"]);
        }

        function onAuthenFail(errMessage) {
            // Hide spinner dialog
            $cordovaSpinnerDialog.hide();

            navigator.notification.alert(errMessage, function callback() { }, "Login fail!", "OK");
        }

        function onServerConnectionFail(errMessage) {
            // Hide spinner dialog
            if (cordova.platformId === "ios") {
                $cordovaSpinnerDialog.hide();
            }
            else if (cordova.platformId === "windows") {
                $ionicLoading.hide();
            }

            navigator.notification.alert(errMessage, function callback() {
                console.warn("Just go to no connection page.");

                $('#login').css('display', 'none');
                $('.bar-stable').css({ 'display': '' });
                $('#splash').css({ 'display': 'none' });
                $cordovaSpinnerDialog.hide();
                location.href = "#/tab/login/error";
            },
            "Connecting to server fail! \n Please come back again.", "OK");
        }

        function onMissingParams() {
            // Hide spinner dialog
            $cordovaSpinnerDialog.hide();

            navigator.notification.alert("Missing username or password.", function callback() { }, "Cannot login.", "OK");
        }

        function onReadyToSigning() {
            var authen = server.authenData;
            console.log("token: ", authen.token);
            if (!authen.token) {
                $('#splash').css({ 'display': 'none' });

                $('body #login #btn-login').click(function (event) {
                    event.preventDefault();

                    $('body #login input').attr('readonly', true);
                    $('body #login #btn-login').attr('disabled', true);

                    var email = $('body #login form input[name="email"]').val();
                    var password = $('body #login form input[name="password"]').val();

                    // console.error(email, ":", password)
                    if (!email || !password) {
                        onMissingParams();
                        $('body #login input').attr('readonly', false);
                        $('body #login #btn-login').attr('disabled', false);
                    }
                    else {
                        // Show spinner dialog
                        if (cordova.platformId === "ios") {
                            $cordovaSpinnerDialog.show(null, "loging in...", true);
                        }
                        else if (cordova.platformId === "windows") {
                            $ionicLoading.show({
                                template: "loging in..."
                            });
                        }

                        main.getHashService(password, function (err, res) {
                            main.authenUser(server, email, res, function (err, res) {
                                if (!err && res !== null) {
                                    if (res.code === HttpStatusCode.success) {
                                        console.log("Success Login User...");
                                    }
                                    else if (res.code === 1004) {
                                        onDuplicateLogin(res);
                                    }
                                    else if (res.code === HttpStatusCode.requestTimeout) {
                                        $('body #login input').attr('readonly', false);
                                        $('body #login #btn-login').attr('disabled', false);
                                        onLoginTimeout(res);
                                    }
                                }
                                else {
                                    $('body #login input').attr('readonly', false);
                                    $('body #login #btn-login').attr('disabled', false);
                                    // maybe user not found.
                                    onAuthenFail(err);
                                }
                            });
                        });
                    }
                });
            }
            else {
                server.TokenAuthen(authen.token, function (err, res) {
                    if (!err && res !== null) {
                        console.log("Authen result: ", JSON.stringify(res));
                        if (res.success) {
                            main.authenUser(server, res.username, res.password, function (err, res) {
                                if (!err && res !== null) {
                                    if (res.code === HttpStatusCode.success) {
                                        console.log("Success Authen User...");
                                    }
                                    else if(res.code === 1004) {
                                        //<!-- Authen fail.
                                        server.logout();

                                        console.warn(JSON.stringify(err), JSON.stringify(res));
                                        onDuplicateLogin(err);
                                    }
                                    else if (res.code === HttpStatusCode.requestTimeout) {
                                        onLoginTimeout(res);
                                    }
                                }
                                else {
                                    //<!-- Authen fail.
                                    server.logout();
                                    location.href = '';

                                    console.error(err, res);
                                    onDuplicateLogin(err);
                                }
                            });
                        }
                    }
                });
            }
        }

        $ionicModal.fromTemplateUrl('templates/modal-setConfig.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.setConfigModal = modal
        })  

        function setConfigTheme(){
            if(typeof($scope.setConfigModal) != 'undefined'){
                if(!$localStorage.themeData){
                    $localStorage.themeData = 'themeblue';
                }
                $rootScope.theme = $localStorage.themeData;
                $scope.setConfigModal.show();
                $scope.setConfigModal.hide();
            }
        }
    }

    

    function noConnection($scope,$ionicNavBarDelegate,$rootScope,$ionicHistory){
        $ionicNavBarDelegate.showBackButton(false);
        $scope.goBack = function(){
            $ionicHistory.goBack(-1);
        }
    }
})();
