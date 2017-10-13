

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
    var coords = [];
    var points = new Array(data.features.length - 1);
    for (var i = 0; i < data.features.length - 1; i++) {
        //console.log(data);

        // Apply projection transformation to the geometries
        coords.push(ol.proj.fromLonLat([data.features[i].geometry.coordinates[0],
                data.features[i].geometry.coordinates[1]],
            'EPSG:3857'));
        //var magnitude = data.features[i].properties.mag;
        //var evntTime = data.features[i].properties.time

        // Create new feature from each lon/lat pair
        points[i] = new ol.Feature({
            'geometry': new ol.geom.Point(
                [coords[i][0], coords[i][1]]),
            'i': i,
            'size': 10
        });
    }

    // Marker style
    var styles = {
        '10': new ol.style.Style({
            image: new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({color: '#666666'}),
                stroke: new ol.style.Stroke({color: '#bada55', width: 1})
            })
        }),
        '20': new ol.style.Style({
            image: new ol.style.Circle({
                radius: 10,
                fill: new ol.style.Fill({color: '#666666'}),
                stroke: new ol.style.Stroke({color: '#bada55', width: 1})
            })
        })
    };


    var vectorSource = new ol.source.Vector({
        features: points,
        wrapX: false
    });
    var vector = new ol.layer.Vector({
        source: vectorSource,
        style: function (feature) {
            return styles[feature.get('size')];
        }
    });

    // MAP
    var map = new ol.Map({
        layers: [
            new ol.layer.Tile({source: new ol.source.OSM()}),
            vector
        ],
        target: document.getElementById('map'),
        view: new ol.View({
            center: ol.proj.fromLonLat([-112.5, 45.6]),
            zoom: 4
        })
    });
}
// //
//
getData();



// TODO Add all points from a single USGS GeoJSON file into OL
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
