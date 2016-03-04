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
                notify(data);
            });

            function notify(data) {
                webNotification.showNotification('ChitChat Notification', {
                    body: data.body,
                    icon: './favicon.ico',
                    onClick: function onNotificationClicked() {
                       
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