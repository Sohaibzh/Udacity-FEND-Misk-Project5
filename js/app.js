  /*jshint loopfunc:true */
  // ignore the message 'Don't make functions within a loop.'
  var model = {
      //Store App Data
      // Store the 5 places with id form foursquare and icon
      places: [{
              title: 'King Abdulaziz International Airport',
              location: {
                  lat: 21.6706397713121,
                  lng: 39.150499105453484
              },
              id: '4c0b37c332daef3b62cb4b50',
              icon: 3
          },
          {
              title: 'King Abdullah Sports City',
              location: {
                  lat: 21.764988,
                  lng: 39.164595
              },
              id: '505fec0ee4b0a054474a1aea',
              icon: 0
          },
          {
              title: 'Faculty of Computer Science',
              location: {
                  lat: 21.489416,
                  lng: 39.246328
              },
              id: '4f2ccd72e4b01982f0559bfc',
              icon: 1
          },
          {
              title: 'Al Ittihad Club',
              location: {
                  lat: 21.542463,
                  lng: 39.212688
              },
              id: '502807c1e4b069e8b5be03af',
              icon: 2
          },
          {
              title: 'Alsaaj Alreefi',
              location: {
                  lat: 21.691674,
                  lng: 39.110184
              },
              id: '56f04531cd10f03a76519f27',
              icon: 4
          },
      ],
      // icons images ref: https://sites.google.com/site/gmapsdevelopment/
      icon: [{
              image: 'http://maps.gstatic.com/mapfiles/ms2/micons/sportvenue.png'
          },
          {
              image: 'http://maps.google.com/mapfiles/kml/pal3/icon30.png'
          },
          {
              image: 'http://maps.google.com/mapfiles/kml/pal2/icon57.png'
          },
          {
              image: 'http://maps.gstatic.com/mapfiles/ms2/micons/plane.png'
          },
          {
              image: 'http:/maps.google.com/mapfiles/kml/pal2/icon32.png'
          }
      ],
      runCount: 0 // count how many the maps run

  };

  var viewModel = function() {


      //document.getElementById('menu').style.visibility = 'hidden'; // hide the buttons
      //this.hideButton = ko.observable(true);
      this.hideDiv = ko.observable(false);
      var menutButton = document.getElementById('menuButton'); // store menu Button
      var menuDiv = document.getElementById('menu'); // store Menu Div
      var clicked = 0; // store the previous clicked marker
      var locations = model.places; // store places arraf from the model
      var iconImg = model.icon; // store icon array from the model
      this.allItems = ko.observableArray(); // Initial the observableArray for the dorpdown menu
      this.selectedItems = ko.observableArray([""]); // Initial selection item to empty
      largeInfowindow = new google.maps.InfoWindow();

      this.filter = ko.observable();
      this.places = ko.observableArray(model.places);



      var xhttp = new XMLHttpRequest(); // requst data from a server
      this.hideButtons = function() {

          this.hideDiv(!this.hideDiv());
      };




      // The following group uses the location array to create an array of markers on initialize.
      for (var i = 0; i < locations.length; i++) {
          // Get the position from the location array.
          var position = locations[i].location;
          var title = locations[i].title;
          var iconNum = locations[i].icon;
          var lat = locations[i].location.lat; // get the latitude
          var lng = locations[i].location.lng; // get the longitude
          // Create a marker per location, and put into markers array.
          allItems.push(locations[i].title);
          var marker = new google.maps.Marker({
              position: position,
              title: title,
              animation: google.maps.Animation.DROP,
              icon: iconImg[iconNum].image, // store the icon
              id: locations[i].id, // store the foursquare id
              lat: lat,
              lng: lng

          });

          // Push the marker to our array of markers.
          markers.push(marker);

          // Create an onclick event to open an infowindow at each marker.
          marker.addListener('click', function() {
              populateInfoWindow(this, largeInfowindow);
          });
      }


      function populateInfoWindow(marker, infowindow) {

          // Check to make sure the infowindow is not already opened on this marker.
          if (infowindow.marker != marker) {
              if (marker.title != clicked && clicked !== 0) {
                  clicked.setAnimation(null);
              }

              // foursquare api requst
              xhttp.open("GET", "https://api.foursquare.com/v2/venues/" + marker.id + "?&client_id=3RYKV5KB1SYSCKHSN4HED30PREZDY4QTNCJQ2H52MCU4WY5R&client_secret=KZNVYDDU0FDEQK3SZIPU5E1L22MBLL0TCZ3I0FY34LB2GGW3&v=20180609", true);
              xhttp.onerror = function() {
                  console.log("** An error occurred during the transaction");
              };
              xhttp.send();

              xhttp.onreadystatechange = function() {

                  if (this.readyState == 4 && this.status == 200) {



                      var obj = JSON.parse(this.responseText); // store the response from foursquare
                      var rating = obj.response.venue.rating ? obj.response.venue.rating : "rating unavailable";
                      infowindow.marker = marker;
                      marker.setAnimation(google.maps.Animation.BOUNCE); // create an animtion with the marker clicked
                      infowindow.setContent('<div class="place"><img src="' + obj.response.venue.bestPhoto.prefix + '200x200' + obj.response.venue.bestPhoto.suffix + '"></img><br>' +
                          '<br><span class="big">Name:</span>' +
                          '<p>' + obj.response.venue.name + '</p><hr><br>' +
                          '<span class="big">Comments:</span><br><br>' +
                          '<p>' + obj.response.venue.tips.groups[0].items[0].text +
                          '<br><br><p>' + obj.response.venue.tips.groups[0].items[2].text + '</P><br>' +
                          '<hr><br><span class="big">Categorie:</span>' +
                          '<p>' + obj.response.venue.categories[0].name + '</P><br><br><hr><br>' +
                          '<span class="big">Rating:</span>' +
                          '<p>' + rating + '</P></div>');
                      clicked = marker;
                      infowindow.open(map, marker);
                  }


              };

              // Make sure the marker property is cleared if the infowindow is closed.
              infowindow.addListener('closeclick', function() {
                  infowindow.marker = null;
                  marker.setAnimation(null); // https://developers.google.com/maps/documentation/javascript/examples/marker-animations
              });




          }
      }

      // to show the selected marker based on the Observable array
      this.showMarker = function() {
          for (var i = 0; i < markers.length; i++) {
              markers[i].setMap(null); // hide all the marker
              if (markers[i].title == this.selectedItems()) {
                  markers[i].setMap(map); // show the selecet marker
                  populateInfoWindow(markers[i], largeInfowindow);
              }
          }

      };
      // show marker based on the filter
      this.showMoreMarker = function(selectedMarker) {
          for (var i = 0; i < markers.length; i++) {
              markers[i].setMap(null); // hide all the marker
          }
          for (var index = 0; index < selectedMarker.length; index++) {
              selectedMarker[index].setMap(map); // show the selected marker
              selectedMarker[index].setAnimation(google.maps.Animation.BOUNCE); // add animation to the markres


          }

      };

      // This function will loop through the markers array and display them all.
      this.showListings = function() {
          var bounds = new google.maps.LatLngBounds();
          // Extend the boundaries of the map for each marker and display the marker
          for (var i = 0; i < markers.length; i++) {
              markers[i].setMap(map);
              bounds.extend(markers[i].position);
          }
          map.fitBounds(bounds);

      };

      // This function will loop through the listings and hide them all.
      this.hideListings = function() {
          for (var i = 0; i < markers.length; i++) {
              markers[i].setMap(null);
          }


      };
      // help for the input Filter
      this.visibleMarker = ko.computed(function() {
          var count = 0;
          return this.places().filter(function(place) {
              filet = [];
              for (var index = 0; index <= 4; index++) {
                  if (!self.filter() || markers[index].title.toLowerCase().indexOf(self.filter().toLowerCase()) !== -1) {
                      filet.push(markers[index]); // push the matches string
                  }

              }
              if (count === 0 && filet.length != 5) { // to call showMoreMarker only once
                  count++;

                  showMoreMarker(filet);
              }


              if (!self.filter() || place.title.toLowerCase().indexOf(self.filter().toLowerCase()) !== -1) {

                  return place;


              }

          });

      }, this);


  };



  var map;
  var filet = [];
  // Create a new blank array for all the listing markers.
  var markers = [];



 initMap = function() { // prevent the Uncaught InvalidValueError: initMap is not a function

      // Constructor creates a new map - only center and zoom are required.
      map = new google.maps.Map(document.getElementById('map'), {
          center: {
              lat: 21.5333333,
              lng: 39.1666666
          },
          zoom: 10, // zoom
          styles: [ // style the map
              {
                  "elementType": "geometry",
                  "stylers": [{
                      "color": "#f5f5f5"
                  }]
              },
              {
                  "elementType": "labels.icon",
                  "stylers": [{
                      "visibility": "off"
                  }]
              },
              {
                  "elementType": "labels.text.fill",
                  "stylers": [{
                      "color": "#ff4d4d"
                  }]
              },
              {
                  "elementType": "labels.text.stroke",
                  "stylers": [{
                      "color": "#f5f5f5"
                  }]
              },
              {
                  "featureType": "administrative.land_parcel",
                  "elementType": "labels.text.fill",
                  "stylers": [{
                      "color": "#bdbdbd"
                  }]
              },
              {
                  "featureType": "poi",
                  "elementType": "geometry",
                  "stylers": [{
                      "color": "#eeeeee"
                  }]
              },
              {
                  "featureType": "poi",
                  "elementType": "labels.text.fill",
                  "stylers": [{
                      "color": "#757575"
                  }]
              },
              {
                  "featureType": "poi.park",
                  "elementType": "geometry",
                  "stylers": [{
                      "color": "#e5e5e5"
                  }]
              },
              {
                  "featureType": "poi.park",
                  "elementType": "labels.text.fill",
                  "stylers": [{
                      "color": "#9e9e9e"
                  }]
              },
              {
                  "featureType": "road",
                  "elementType": "geometry",
                  "stylers": [{
                      "color": "#cccccc"
                  }]
              },
              {
                  "featureType": "road.arterial",
                  "elementType": "labels.text.fill",
                  "stylers": [{
                      "color": " #990000"
                  }]
              },
              {
                  "featureType": "road.highway",
                  "elementType": "geometry",
                  "stylers": [{
                      "color": "#99e699"
                  }]
              },
              {
                  "featureType": "road.highway",
                  "elementType": "labels.text.fill",
                  "stylers": [{
                      "color": "#616161"
                  }]
              },
              {
                  "featureType": "road.local",
                  "elementType": "labels.text.fill",
                  "stylers": [{
                      "color": "#9e9e9e"
                  }]
              },
              {
                  "featureType": "water",
                  "elementType": "geometry",
                  "stylers": [{
                      "color": "#a3b9dc"
                  }]
              },
              {
                  "featureType": "water",
                  "elementType": "labels.text.fill",
                  "stylers": [{
                      "color": "#9e9e9e"
                  }]
              }
          ],
          mapTypeControl: false
      });




      if (model.runCount === 0) {
          ko.applyBindings(viewModel);
          model.runCount++;


      }



  };

  var googleMapError = function googleMapError(){
    alert("Pleace Reaferech the Page!!!");

  };


  
