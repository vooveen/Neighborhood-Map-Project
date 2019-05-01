// Map variables
let map;
let bounds;
let infoWindow;

//Initialize the map
function initMap(){
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat:41.404484, lng:2.175728},
        zoom: 10
    });
    infoWindow = new google.maps.InfoWindow();
    bounds = new google.maps.LatLngBounds();
    ko.applyBindings(new ViewModel())
}

// Set a place (with marker, InfoWindow .. etc)
let Place = function(place){
    this.title = place.title;
    this.location = place.location;
    this.marker = new google.maps.Marker({
        position: this.location,
        title: this.title,
        map: map,
        animation: google.maps.Animation.DROP,
    });
    bounds.extend(this.marker.position);
    map.fitBounds(bounds);

    // Show or hide a marker
    this.hideMarker = function() {
        this.marker.setMap(null);
    };
    this.showMarker = function() {
        this.marker.setMap(map);
        bounds.extend(this.marker.position);
        map.fitBounds(bounds);
    };
    this.filterMarkers = function(show) {
        show ? this.showMarker() : this.hideMarker();
    };

    // Show infoWindow when one of the markers is clicked
    this.marker.addListener('click', function() {
        populateInfoWindow(this, infoWindow);
        map.panTo(this.getPosition());
        bounceMarker(this);
    });

    // Show infoWindow when one of the plces in the list is clicked
    this.listInfoWindow = function(clicked) {
        populateInfoWindow(this.marker, infoWindow);
        map.panTo(this.marker.getPosition());
        bounceMarker(this.marker);
    };
}

// Populate  infowindow
function populateInfoWindow(marker, infowindow) {
    // Check if infowindow is opened or not in this marker
    if (infowindow.marker != marker) {
        // Clear the infowindow content
        infowindow.setContent('');
        infowindow.marker = marker;

        // Using Foursquare Api to retrieve places info
        const clientId = '1VISNEBM0RONUYS245X32RNS2TKSSGEU3QZYLCHSIHZKKVAZ';
        const clientSecret = 'AQ0B22SJINNAO414HFB2TQTQRUD13TU52LFMYLIMKXYM04NC';
        let content = '<div><h2>' + marker.title + '</h2></div>';
        let url = 'https://api.foursquare.com/v2/venues/search?v=20161016';
        url += '&client_id='+clientId;
        url += '&client_secret='+clientSecret;
        url += '&ll='+marker.position.lat()+','+marker.position.lng();
        url += '&query='+marker.title;

        // get JSON data from the foursquare api URL
        $.getJSON(url).done(function(data) {
            if (data.response.venues) {
                let result = data.response.venues[0];
                let name = result.name;
                content += '<div>'+name+'</div>';
                let category = result.categories[0].name;
                content += '<div><b>'+category+'</b></div>';
                console.log(result);
                let address = result.location.formattedAddress;
                for (i =0; i < address.length; i++) {
                    content = content+address[i]+ ', ';
                }
            }
        // When failed to retreive information
        }).fail(function() {
            content = content + "<div>Can't Get Data from Foursquare</div>";
        // Show windowInfo information
        }).always(function() {
            let attribution = '<div> <a href="https://developer.foursquare.com/">Foursquare API used to get Data</a></div>';
            infowindow.setContent(content + attribution);
        });


        // marker is cleared if the infowindow is closed
        infowindow.addListener('closeclick', function() {
        infowindow.marker = null;
        });
    }
    // Open the infowindow
    infowindow.open(map, marker);
}

// Bounce effect
function bounceMarker(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function(){
        marker.setAnimation(null);
    }, 500);
}

// Handle Google map api errors
function handleMapsError() {
    alert("Sorry, Google maps Can't be loaded right now !");
}

// The ViewModel
let ViewModel = function(){

    let self = this;
    this.placeList = ko.observableArray([]);
    this.filterPlaces = ko.observable("");

    // Pushing places data from the model to an observableArray
    places.forEach(function(place){
        self.placeList.push(new Place(place));
    });

    /* If there is no filter all places will be rendered
    in the places list, else only places
    that match with the input will be rendered */
    this.filtredPlaces = ko.computed(function() {
            let filter = self.filterPlaces().toLowerCase();
            if (!filter) {
                return self.placeList();
            } else {
                return ko.utils.arrayFilter(self.placeList(), function(item){
                    return item.title.toLowerCase().indexOf(filter) !== -1;
                });
            }
        }
    );

    /* When filtredPlaces input changes the boolean show is
    set to true or false and filterMarkers() func is called to
    show or hide marker */
    this.filtredPlaces.subscribe(function (places) {
        ko.utils.arrayForEach(self.placeList(), function (place) {
            let show = false;
            for (i=0; i < places.length; i++) {
                if (places[i].title == place.title)
                    show = true;
            }
            place.filterMarkers(show);
        });
     });

}



