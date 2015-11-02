// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397705
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
module BlankCordovaApp1 {
    "use strict";

    export module Application {
        export function initialize() {
            document.addEventListener('deviceready', onDeviceReady, false);
        }

        function onDeviceReady() {
            // Handle the Cordova pause and resume events
            document.addEventListener('pause', onPause, false);
            document.addEventListener('resume', onResume, false);

            // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.
            console.info("onDeviceReady");
            /*
            var push = PushNotification.init({
                "android": {
                    "senderID": "1234567890"
                },
                "ios": { "alert": "true", "badge": "true", "sound": "true" },
                "windows": {}
            });

            push.on('registration', function (data) {
                console.log("registration event");
                document.getElementById("regId").innerHTML = data.registrationId;
                console.log(JSON.stringify(data));
            });

            push.on('notification', function (data) {
                console.log("notification event");
                console.log(JSON.stringify(data));
                var cards = document.getElementById("cards");
                var card = '<div class="row">' +
                    '<div class="col s12 m6">' +
                    '  <div class="card darken-1">' +
                    '    <div class="card-content black-text">' +
                    '      <span class="card-title black-text">' + data.title + '</span>' +
                    '      <p>' + data.message + '</p>' +
                    '    </div>' +
                    '  </div>' +
                    ' </div>' +
                    '</div>';
                cards.innerHTML += card;

                push.finish(function () {
                    console.log('finish successfully called');
                });
            });

            push.on('error', function (e) {
                console.log("push error");
            });
            */
        }

        function onPause() {
            // TODO: This application has been suspended. Save application state here.
            console.warn('onPause');
        }

        function onResume() {
            // TODO: This application has been reactivated. Restore application state here.
            console.warn('onResume');
        }

    }

    window.onload = function () {
        Application.initialize();
    }
}