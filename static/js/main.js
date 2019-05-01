let map;
let bounds;

function initMap(){
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat:41.404484, lng:2.175728},
        zoom: 10
    });
    bounds = new google.maps.LatLngBounds();
    ko.applyBindings(new ViewModel())
}

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

    this.showMarker = function(show) {
        if (show) {
            this.marker.setMap(map);
            bounds.extend(this.marker.position);
            map.fitBounds(bounds);
        } else {
            this.marker.setMap(null);
        }
    };
}

let ViewModel = function(){

    let self = this;

    this.placeList = ko.observableArray([]);
    this.filterPlaces = ko.observable("");

    places.forEach(function(place){
        self.placeList.push(new Place(place));
    });

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

    this.filtredPlaces.subscribe(function (places) {
        ko.utils.arrayForEach(self.placeList(), function (place) {
            let show = false;
            for (i=0; i < places.length; i++) {
                if (places[i].title == place.title)
                    show = true;
            }
            place.showMarker(show);
        });
     });

}



