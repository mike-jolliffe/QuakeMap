var map = new ol.Map({
        target: 'map',
        layers: [
          new ol.layer.Tile({
            source: new ol.source.OSM()
          })
        ],
        view: new ol.View({
          center: ol.proj.fromLonLat([-117.5, 45.6]),
          zoom: 6
        })
      });

// AJAX GET request for earthquakes
function getData() {
    $.ajax({
        type: "GET",
        url: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson",
        success: function(resp) {
            parseResponse(resp)
        }
    })
}

function parseResponse(data) {
    for (var i = 0; i < data.features.length - 1; i++) {
        console.log(data.features[i].geometry.coordinates)
    }
    console.log(data) //TODO parse geoms by features[index].geometry.coordinates
}

getData();

// TODO Add all points from a single USGS GeoJSON file into OL
    // AJAX to get geoJSON
        //
    // Parse geoJSON
        // lat/long,
        // quake magnitude
        // time of event
    // Create a point from a given event
        // Point size corresponds to magnitude
        // Point opacity corresponds to event time away from current time, opaque smaller number
        // Reproject the point for display
    // Display points as vectorTiles?
        // Show magnitude of event in circle on hover
        // Change circle size based on zoom level?

// TODO make a call to the USGS GeoJSON every five minutes

// TODO animate "new" earthquakes somehow
// TODO create a project readme

