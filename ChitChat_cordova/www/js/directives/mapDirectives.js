
angular.module('spartan.directives', [])

.directive('map', function() {
  return {
    restrict: 'E',
    scope: {
        setup: '=',
        selectedPlace: '&selectedPlace'
    },
    link: function ($scope, $element, $attr) {
        var zValue = $scope.$eval($attr.zoom);
        var lat = $scope.$eval($attr.lat);
        var lng = $scope.$eval($attr.lng);
        var currPoint = {lat: lat, lng: lng};

        
      function setup(data) {
        currPoint = { lat: data.lat, lng: data.long };

        var mapOptions = {
          center: currPoint,
          zoom: zValue,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map($element[0], mapOptions);
        map.setCenter(currPoint);
        var infowindow = new google.maps.InfoWindow();

        var service = new google.maps.places.PlacesService(map);
        service.nearbySearch({
          location: currPoint,
          radius: 1000
        }, callback);
        
        function callback(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                for (var i = 0; i < results.length; i++) {
                    createMarker(results[i]);
                }
            }
        }
        
        function createMarker(place) {
            var placeLoc = place.geometry.location;
            var marker = new google.maps.Marker({
                map: map,
                position: place.geometry.location
            });

            google.maps.event.addListener(marker, 'click', function () {
                infowindow.setContent(place.name);
                infowindow.open(map, this);

                $scope.selectedPlace({ data: place });
            });
        }

        // Stop the side bar from dragging when mousedown/tapdown on the map
        google.maps.event.addDomListener($element[0], 'mousedown', function (e) {
          e.preventDefault();
          return false;
        });
      }
      
      $scope.$on('onInitMap', function (event, data) {
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
