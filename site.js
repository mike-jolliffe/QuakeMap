var map = new ol.Map({
    layers: [
        new ol.layer.Tile({source: new ol.source.OSM()}),
    ],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([-112.5, 45.6]),
        zoom: 4
    })
});

var vectorSource = false;

// AJAX GET request for earthquakes
function getData() {
    $.ajax({
        type: "GET",
        url: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson",
        success: function (resp) {
            if (vectorSource) {
                vectorSource.clear()
            }
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
        var evtTime = data.features[i].properties.time;

        // Create new feature from each lon/lat pair
        points[i] = new ol.Feature({
            'geometry': new ol.geom.Point(
                [coords[i][0], coords[i][1]]),
            'attributes': {
                'magnitude': magnitude,
                'evtTime': evtTime,
                'opacity': getOpacity(evtTime)
            },
            'i': i,
            'size': getSize(magnitude)  // TODO make this dynamic with styles so dots grow on zoom
        });
    }
    callback(points)
}

// Marker style
var styles = {
    '10': new ol.style.Style({
        image: new ol.style.Circle({
            radius: 3,
            //fill: new ol.style.Fill({color: [126, 126, 126, feature.get('opacity')]}), //TODO opacity
            stroke: new ol.style.Stroke({color: '#bada55', width: 1})
        })
    }),
    '20': new ol.style.Style({
        image: new ol.style.Circle({
            radius: 6,
            //fill: new ol.style.Fill({color: '#666666'}),
            stroke: new ol.style.Stroke({color: '#bada55', width: 1})
        })
    }),
    '30': new ol.style.Style({
        image: new ol.style.Circle({
            radius: 10,
            //fill: new ol.style.Fill({color: '#666666'}),
            stroke: new ol.style.Stroke({color: '#bada55', width: 1})
        })
    }),
    '40': new ol.style.Style({
        image: new ol.style.Circle({
            radius: 10,
            fill: new ol.style.Fill({color: '#bada55'}),
            stroke: new ol.style.Stroke({color: '#666666', width: 2})
        })
    })
};

// Standardize magnitude of events in three categories
function getSize(magData) {
    if (magData < 1) {
        return 10
    } else if (magData < 3) {
        return 20
    } else {
        return 30
    }
}

// Convert freshness of quake to opacity
function getOpacity(time) {
    var week = 6.048e8;
    var now = (new Date).getTime();
    var opacity = 1 - ((now - time) / week) / 1.5;
    return opacity
}

function renderMap(data) {
    vectorSource = new ol.source.Vector({
        features: data,
        wrapX: false
    });

    var vector = new ol.layer.Vector({
        source: vectorSource,
        style: function (feature) {
            var opacity = feature.get('attributes').opacity.toFixed(2);
            var color = new ol.color.asArray('#222222');
            //color = color.slice();
            color[3] = opacity;  // change the alpha of the color
            var size = new ol.style.Style({
                image: new ol.style.Circle({
                    radius: feature.get('size'),
                    fill: new ol.style.Fill({color: color}),
                    stroke: new ol.style.Stroke({color: '#bada55', width: 1})
                })
            });
        return size
        }
    });

    // Anchor pop-up to map
    var container = document.getElementById('popup');
    var content = document.getElementById('popup-content');
    var closer = document.getElementById('popup-closer');

    var overlay = new ol.Overlay(({
        element: container,
        autoPan: true,
        autoPanAnimation: {
            duration: 250
        }
    }));

    // MAP
    map.addLayer(vector);
    map.addOverlay(overlay);


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

    function removeallFeaturesStyle() {
        //continue only if needed
        if (!hovered) return;

        vectorSource.getFeatures().forEach(function (feature) {
            feature.setStyle(null);
        });
        hovered = false;
    }

    function removeOthersStyle(feature) {
        vectorSource.getFeatures().forEach(function (ft) {
            //don't remove from the current hovering

        });
    }

    closer.onclick = function () {
        overlay.setPosition(undefined);
        closer.blur();
        return false;
    };

    map.on('singleclick', function (evt) {
        var feature = map.forEachFeatureAtPixel(evt.pixel, function (ft, layer) {
            //you can add a condition on layer to restrict the listener
            return ft
        });
        var mag = feature.getProperties().attributes.magnitude;
        var tm = new Date(feature.getProperties().attributes.evtTime);
        var new_tm = (tm.getMonth() + 1) + '/' + tm.getDate() + '/' + tm.getFullYear();
        content.innerHTML = '<span>Magnitude: </span><code>' + mag + '</code><br>' +
            '<span>Event Time: </span><code>' + new_tm + '</code>';
        overlay.setPosition(evt.coordinate)
    });
}

getData();
// Refresh every 5ish minutes
setInterval(getData, 320000);


// TODO Modify point opacity corresponds to event time away from current time, opaque smaller number
// TODO animate "new" earthquakes somehow
// TODO create a project readme