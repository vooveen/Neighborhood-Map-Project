// Map variables
let map;
let bounds;

//Initialize the map
function initMap(){
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat:41.404484, lng:2.175728},
        zoom: 10
    });
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
    this.filterMarkers = function(show) {
        if (show) {
            this.marker.setMap(map);
            bounds.extend(this.marker.position);
            map.fitBounds(bounds);
        } else {
            this.marker.setMap(null);
        }
    };
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



