(function() {
    'use strict';

    angular
        .module('spartan.directives')
        .directive('webNotify', webNotifyDirective);

//    webNotifyDirective.$inject = ['$window'];
    
    function webNotifyDirective($window, webNotification) {
        // Usage:
        //     <webNotifyDirective></webNotifyDirective>
        // Creates:
        // 
        var directive = {
            link: link,
            restrict: 'C'
        };
        return directive;

        function link($scope, $element, $attrs) {
            $scope.$on('onNotify', function (event, data) {
                notify();
            });

            function notify() {
                webNotification.showNotification('Example Notification', {
                    body: 'Notification Text...',
                    icon: '../bower_components/HTML5-Desktop-Notifications/alert.ico',
                    onClick: function onNotificationClicked() {
                        window.alert('Notification clicked.');
                    },
                    autoClose: 3000 
                },
                function onShow(error, hide) {
                    if (error) {
                        window.alert('Unable to show notification: ' + error.message);
                    }
                    else {
                        console.log('Notification Shown.');

                        setTimeout(function hideNotification() {
                            console.log('Hiding notification....');
                            hide(); //manually close the notification (or let the autoClose close it)
                        }, 5000);
                    }
                });
            }
        }
    }

})();