(function () {
    'use strict';

    angular
        .module('spartan.controllers', [])
        .controller('authController', authController)
        .controller('noConnection', noConnection);

    function authController($location, $ionicPopup, $ionicLoading, $state, $localStorage, $ionicModal, $ionicTabsDelegate, $scope, $rootScope,
        $cordovaSpinnerDialog, $cordovaDialogs, $cordovaNetwork,
        networkService, chatslogService, dbAccessService, sharedObjectService)
        {

        /* jshint validthis:true */
        var vm = this;
        vm.title = 'authController';
        var registrationId = "";
        $ionicTabsDelegate.showBar(false);

        ionic.Platform.ready(function () {
            console.log(vm.title + " : ionic ready.");

            if (ionic.Platform.platform() === 'ios' || ionic.Platform.platform() === 'android') {
                try {
                    $cordovaSpinnerDialog.show("", "Wait for signing...", true);
                }
                catch(exception) {
                    console.warn(exception);
                }
            }
            else {
                $ionicLoading.show({
                    template: 'Wait for signing...'
                });
            }
            if (!!server) {
                server.dispose();
            }

            activateBackground();
            activate();
            setConfigTheme();
            activateNetworkService();

            setTimeout(function () {
                if (!!navigator.splashscreen) {
                    navigator.splashscreen.hide();
                }

                main.setDataManager(dataManager);
                main.setServerListener(serverEvents);
                main.setServerImp(server);
                main.onMyProfileReadyListener = function (dataManager) {
                    $('#login').css('display', 'none');
                    $('.bar-stable').css({ 'display': '' });
                    $('#splash').css({ 'display': 'none' });

                    // Hide spinner dialog
                    if (ionic.Platform.platform() === "ios" || ionic.Platform.platform() === 'android') {
                        try {
                            $cordovaSpinnerDialog.hide();
                        }
                        catch(ex) {
                            console.warn(ex);
                        }
                    }
                    else {
                        $ionicLoading.hide();
                    }

                    console.log("appConfig", server.appConfig.webserver);

                    $rootScope.webServer = sharedObjectService.getWebServer();
                    $rootScope.appVersion = sharedObjectService.getAppVersion();

                    if(ionic.Platform.platform() !== "ios") {
                        $location.path('/chats');
                    }
                    else{
                        $state.go('tab.group');
                    }
                };

                initSpartanServer();
            }, 100);
        });

        function activate() {
            console.warn('activate: ' + vm.title);

            console.log("init push notification.");

            if (ionic.Platform.platform() === "ios" || ionic.Platform.platform() === 'android') {
                try {
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
                catch(ex) {
                    console.warn(ex);
                }
            }
        }

        function activateBackground() {
            if (ionic.Platform.platform() === "ios" || ionic.Platform.platform() === 'android') {
                try {
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
                catch(ex) {
                    console.warn(ex);
                }
            }
        }

        function activateNetworkService() {
            networkService.init();
            networkService.regisSocketListener();
        }

        function initSpartanServer() {
            function initCallback(err, server) {
                console.log("Init serve completed is connected: " + server._isConnected + " : " + err);

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
            if (ionic.Platform.platform() === "ios" || ionic.Platform.platform() == 'android') {
                $cordovaSpinnerDialog.hide();
               
                navigator.notification.alert(param.message, function callback() {
                    location.href = '';
                }, "Login Timeout!", "OK");
            }
            else {
                $ionicLoading.hide();
                
                var alertPopup = $ionicPopup.alert({
                    title: 'Login Timeout!'
                    // template: 'It might taste good'
                });

                alertPopup.then(function(res) {
                    location.href = '';
                });
            }
        }

        function onDuplicateLogin(param) {
            console.log("onDuplicateLogin", JSON.stringify(param));
            // Hide spinner dialog
            if (ionic.Platform.platform() === "ios" || ionic.Platform.platform() == 'android') {
                $cordovaSpinnerDialog.hide();

                $cordovaDialogs.confirm("May be you use this app in other devices \n You want to logout other devices", "Duplicated login!", ["OK", "Cancel"])
                .then(function (buttonIndex) {
                    console.log("clicked", buttonIndex);
                    switch (buttonIndex) {
                        case 1:
                            server.kickMeAllSession(param.uid);
                            location.href = "";
                            break;
                        case 2:
                            localStorage.clear();
                            location.href = '';
                            break;
                    }
                });
            }
            else {
                $ionicLoading.hide();

                var confirmPopup = $ionicPopup.confirm({
                    title: 'Duplicated login!',
                    template: 'May be you use this app in other devices \n You want to logout other devices'
                });

                confirmPopup.then(function (res) {
                    if (res) {
                        server.kickMeAllSession(param.uid);
                        location.href = "";
                    } else {
                        localStorage.clear();
                        location.href = '';
                    }
                });
            }
        }

        function onAuthenFail(errMessage) {
            // Hide spinner dialog
            if (ionic.Platform.platform() === "ios") {
                $cordovaSpinnerDialog.hide();

                $cordovaDialogs.alert(errMessage, 'Authentication Fail!', 'OK')
                .then(function () {
                    // callback success
                    localStorage.clear();
                    location.href = '';
                });
            }
            else {
                $ionicLoading.hide();

                // navigator.notification.alert(errMessage, function callback() { }, "Login fail!", "OK");
                var alertPopup = $ionicPopup.alert({
                    title: "Login fail!",
                    template: errMessage
                });

                alertPopup.then(function (res) {
                    localStorage.clear();
                    location.href = '';
                });
            }
        }

        function onServerConnectionFail(errMessage) {
            console.warn("onServerConnectionFail: " + errMessage);

            // Hide spinner dialog
            if (ionic.Platform.platform() === "ios") {
                $cordovaSpinnerDialog.hide();
            }
            else {
                $ionicLoading.hide();
            }

            if ($cordovaNetwork.isOnline()) {
                $cordovaDialogs.confirm('Fail to connecting server! \n Please try again.',
                    'Fail to connecting server!', ['OK', 'Try Again'])
                .then(function (buttonId) {
                    // callback success
                    if (buttonId === 1) {
                        $('#login').css('display', 'none');
                        $('.bar-stable').css({ 'display': '' });
                        $('#splash').css({ 'display': 'none' });

                        location.href = "#/tab/login/error";
                    }
                    else if (buttonId === 2) {
                        location.href = '';
                    }
                });
            }
            else {
                console.warn("Just go to no connection page. " + errMessage);

                $cordovaDialogs.alert('Fail to connecting server! \n Please come back again.',
                    'No internet connection!', 'OK')
                .then(function () {
                    // callback success
                    $('#login').css('display', 'none');
                    $('.bar-stable').css({ 'display': '' });
                    $('#splash').css({ 'display': 'none' });

                    location.href = "#/tab/login/error";
                });
            }
        }

        function onMissingParams() {
            // Hide spinner dialog.
            if (ionic.Platform.platform() === "ios" || ionic.Platform.platform() === 'android') {
                $cordovaSpinnerDialog.hide();

                try {
                    navigator.notification.alert("Missing username or password.", function callback() { }, "Cannot login.", "OK");
                }
                catch (ex) {
                    console.warn(ex);
                }
            }
            else {
                $ionicLoading.hide();

                var alertPopup = $ionicPopup.alert({
                    title: 'Cannot login.',
                    template: 'Missing username or password.'
                });
                alertPopup.then(function (res) {
                });
            }
        }

        function onReadyToSigning() {
            $rootScope.themename = sharedObjectService.getThemename();
            var authen = server.authenData;
            console.log("token: ", authen.token);
            //<@-- if have no token app wiil take you to signing page.
            //<@-- else app will auto login by token.
            if (!authen.token) {
                if (ionic.Platform.platform() === "ios" || ionic.Platform.platform() === 'android') {
                    try {
                        $cordovaSpinnerDialog.hide();
                    }
                    catch (ex) {
                        console.warn(ex);
                    }
                }
                else {
                    $ionicLoading.hide();
                }

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
                        if (ionic.Platform.platform() === "ios" || ionic.Platform.platform() === 'android') {
                            try {
                                $cordovaSpinnerDialog.show(null, "loging in...", true);
                            }
                            catch (ex) { console.warn(ex) }
                        }
                        else {
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
                                    else if (res.code === HttpStatusCode.duplicateLogin) {
                                        console.warn(JSON.stringify(err), JSON.stringify(res));
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
                                if (res !== null) {
                                    if (res.code === HttpStatusCode.success) {
                                        console.log("Success Authen User...");
                                    }
                                    else if (res.code === HttpStatusCode.duplicateLogin) {
                                        onDuplicateLogin(res);
                                    }
                                    else if (res.code === HttpStatusCode.requestTimeout) {
                                        onLoginTimeout(res);
                                    }
                                    else if (res.code === HttpStatusCode.fail) {
                                        onAuthenFail(res.message);
                                    }
                                }
                                else {
                                    //<!-- Authen fail.
                                    server.logout();
                                    location.href = '';

                                    console.error("Authen fail", err, res);
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
        }).then(function (modal) {
            $scope.setConfigModal = modal
        })

        function setConfigTheme() {
            if (typeof ($scope.setConfigModal) != 'undefined') {
                if (!$localStorage.themeData) {
                    $localStorage.themeData = 'themedefault';
                }
                $rootScope.theme = $localStorage.themeData;
                $scope.setConfigModal.show();
                $scope.setConfigModal.hide();
            }
        }
    }

    function noConnection($scope, $ionicNavBarDelegate, $rootScope, $ionicHistory) {
        $ionicNavBarDelegate.showBackButton(false);

        $scope.goBack = function () {
            $ionicHistory.goBack(-1);
        }
    }
})();
