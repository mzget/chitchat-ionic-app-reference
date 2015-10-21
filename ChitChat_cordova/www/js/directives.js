
angular.module('starter.directives', [])

.directive('map', function() {
  return {
    restrict: 'E',
    scope: {
      setup: '='
    },
    link: function ($scope, $element, $attr) {
        var zValue = $scope.$eval($attr.zoom);
        var lat = $scope.$eval($attr.lat);
        var lng = $scope.$eval($attr.lng);
        var currPoint = new google.maps.LatLng(lat, lng);
        
      function setup(data) {
        currPoint = new google.maps.LatLng(data.lat, data.long);
        
        var mapOptions = {
          center: currPoint,
          zoom: zValue,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map($element[0], mapOptions);
        var marker = new google.maps.Marker({
            position: currPoint,
            map: map,
            draggable: false
        });

        // Stop the side bar from dragging when mousedown/tapdown on the map
        google.maps.event.addDomListener($element[0], 'mousedown', function (e) {
          e.preventDefault();
          return false;
        });
      }
      
      $scope.$on('onInitMap', function(event, data) {
        setup(data);
      });

      function initialize() {
        console.info('map directive is initialized');
      }

      if (document.readyState === "complete") {
        initialize();
      } else {
        google.maps.event.addDomListener(window, 'load', initialize);
      }     
    }
  }
});
