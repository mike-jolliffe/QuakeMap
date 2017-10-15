var map;

// AJAX GET request for earthquakes
function getData() {
    $.ajax({
        type: "GET",
        url: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson",
        success: function(resp) {
            console.log(resp);
            parseResponse(resp, renderMap);
        }
    })
}

// Get points
function parseResponse(data, callback) {
    var coords = [];
    var points = new Array(data.features.length - 1);
    for (var i = 0; i < data.features.length - 1; i++) {
        //console.log(data);

        // Apply projection transformation to the geometries
        coords.push(ol.proj.fromLonLat([data.features[i].geometry.coordinates[0],
                data.features[i].geometry.coordinates[1]],
            'EPSG:3857'));
        var magnitude = data.features[i].properties.mag;
        //var evntTime = data.features[i].properties.time

        // Create new feature from each lon/lat pair
        points[i] = new ol.Feature({
            'geometry': new ol.geom.Point(
                [coords[i][0], coords[i][1]]),
            'i': i,
            'size': getSize(magnitude)
        });
    }
    callback(points)
}

// Marker style
var styles = {
    '10': new ol.style.Style({
        image: new ol.style.Circle({
            radius: 2,
            fill: new ol.style.Fill({color: '#666666'}),
            stroke: new ol.style.Stroke({color: '#bada55', width: 1})
        })
    }),
    '20': new ol.style.Style({
        image: new ol.style.Circle({
            radius: 5,
            fill: new ol.style.Fill({color: '#666666'}),
            stroke: new ol.style.Stroke({color: '#bada55', width: 1})
        })
    }),
    '30': new ol.style.Style({
        image: new ol.style.Circle({
            radius: 10,
            fill: new ol.style.Fill({color: '#666666'}),
            stroke: new ol.style.Stroke({color: '#bada55', width: 1})
        })
    }),
    '40': new ol.style.Style({
        image: new ol.style.Circle({
            radius: 10,
            fill: new ol.style.Fill({color: '#bada55'}),
            stroke: new ol.style.Stroke({color: '#666666', width: 2})
        })
    }),
}

function getSize(magData) {
    if (magData < 1) {
        return 10
    } else if (magData < 3) {
        return 20
    } else {
        return 30
    }
}


function renderMap(data) {
    var vectorSource = new ol.source.Vector({
        features: data,
        wrapX: false
    });
    var vector = new ol.layer.Vector({
        source: vectorSource,
        style: function (feature) {
            return styles[feature.get('size')];
        }
    });

    // Anchor pop-up to map
    var container = document.getElementById('popup');
    var content = document.getElementById('popup-content');
    var closer = $('#popup-closer');

    var overlay = new ol.Overlay(({
        element: container,
        autoPan: true,
        autoPanAnimation: {
            duration: 250
        }
    }));

    // MAP
    map = new ol.Map({
        layers: [
            new ol.layer.Tile({source: new ol.source.OSM()}),
            vector
        ],
        overlays: [overlay],
        target: 'map',
        view: new ol.View({
            center: ol.proj.fromLonLat([-112.5, 45.6]),
            zoom: 4
        })
    });


    map.on('pointermove', function (evt) {
        var feature = map.forEachFeatureAtPixel(evt.pixel, function (ft, layer) {
            //you can add a condition on layer to restrict the listener
            return ft //.setStyle(styles['20']);
        });

        if (feature) {
            hovered = true;
            feature.setStyle(styles['40']);
            removeOthersStyle(feature);
        } else {
            removeallFeaturesStyle();
        }
    });

    //set a global reference to loop only if needed
    var hovered = false;
    function removeallFeaturesStyle(){
        //continue only if needed
        if(!hovered) return;

        vectorSource.getFeatures().forEach(function(feature){
            feature.setStyle(null);
        });
        hovered = false;
    }

    function removeOthersStyle(feature){
        vectorSource.getFeatures().forEach(function(ft){
            //don't remove from the current hovering

        });
    }
}


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

// // Click handler to close pop-up
// closer.onclick = function() {
//     overlay.setPosition(undefined);
//     closer.blur();
//     return false;
// };

// Click handler to render pop-up
// map.on('singleclick', function(evt) {
//     var coordinate = evt.coordinate;
//     var hdms = ol.coordinate.toStringHDMS(ol.proj.transform(
//             coordinate, 'EPSG:3857', 'EPSG:4326'));
//
//         content.innerHTML = '<p>' + "You clicked here: " + '</p>';
//         overlay.setPosition(coordinate);
//       });