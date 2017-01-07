var map,
    geoJSON,
    request,
    pos,
    gettingData = false,
    openWeatherMapKey = "6a7a44f341c4a791667d912b3fb1c78c";
  
function locate() {
    'use strict';
    if (!navigator.geolocation) {
        alert("Geolocation not supported in your browser.");
        return;
    }
    var options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        };
    function success(position) {
        var lat = position.coords.latitude,
            lng = position.coords.longitude;
        pos = {lat: lat, lng: lng};
        initialize(pos);
    }
    function error(err) {
        console.warn("Error( " + err.code + "): " + err.message);
    }
    navigator.geolocation.getCurrentPosition(success, error, options);
    
}

function initialize() {
    'use strict';
    
    var mapOptions = {
            zoom: 8,
            center: new google.maps.LatLng(pos.lat, pos.lng)
        },
        marker = new google.maps.Marker({
            position: pos,
            title: "You are here"
        });
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    // Add interaction listeners to make weather requests
    google.maps.event.addListener(map, 'idle', checkIfDataRequested);
    // Sets up and populates the info window with details
    map.data.addListener('click', function (event) {
        infowindow.setContent(
            "<img src=" + event.feature.getProperty("icon") + ">"
                + "<br /><strong>" + event.feature.getProperty("city") + "</strong>"
                + "<br />" + event.feature.getProperty("temperature") + "&deg;C"
                + "<br />" + event.feature.getProperty("weather")
        );
        infowindow.setOptions({
            position: {
                lat: event.latLng.lat(),
                lng: event.latLng.lng()
            },
            pixelOffset: {
                width: 0,
                height: -15
            }
        });
        infowindow.open(map);
    });
}

var checkIfDataRequested = function () {
    'use strict';
// Stop extra requests being sent
    while (gettingData === true) {
        request.abort();
        gettingData = false;
    }
    getCoords();
};

// Get the coordinates from the Map bounds
var getCoords = function () {
    'use strict';
    var bounds = map.getBounds(),
        NE = bounds.getNorthEast(),
        SW = bounds.getSouthWest();
    
    getWeather(NE.lat(), NE.lng(), SW.lat(), SW.lng());
};

// Make the weather request
var getWeather = function (northLat, eastLng, southLat, westLng) {
    'use strict';
    gettingData = true;
    var requestString = "http://api.openweathermap.org/data/2.5/box/city?bbox="
                        + westLng + "," + northLat + "," //left top
                        + eastLng + "," + southLat + "," //right bottom
                        + map.getZoom()
                        + "&cluster=yes&format=json"
                        + "&APPID=" + openWeatherMapKey;
    request = new XMLHttpRequest();
    request.onload = proccessResults;
    request.open("get", requestString, true);
    request.send();
};

  // Take the JSON results and proccess them
var proccessResults = function () {
    'use strict';
    
    var results = JSON.parse(this.responseText),
        i;
    if (results.list.length > 0) {
        resetData();
        for (i = 0; i < results.list.length; i++) {
            geoJSON.features.push(jsonToGeoJson(results.list[i]));
        }
        drawIcons(geoJSON);
    }
};

var infowindow = new google.maps.InfoWindow();
  // For each result that comes back, convert the data to geoJSON
var jsonToGeoJson = function (weatherItem) {
    'use strict';
    var feature = {
        type: "Feature",
        properties: {
            city: weatherItem.name,
            weather: weatherItem.weather[0].main,
            temperature: weatherItem.main.temp,
            min: weatherItem.main.temp_min,
            max: weatherItem.main.temp_max,
            humidity: weatherItem.main.humidity,
            pressure: weatherItem.main.pressure,
            windSpeed: weatherItem.wind.speed,
            windDegrees: weatherItem.wind.deg,
            windGust: weatherItem.wind.gust,
            icon: "http://openweathermap.org/img/w/"
                + weatherItem.weather[0].icon  + ".png",
            coordinates: [weatherItem.coord.lon, weatherItem.coord.lat]
        },
        geometry: {
            type: "Point",
            coordinates: [weatherItem.coord.lon, weatherItem.coord.lat]
        }
    };
    // Set the custom marker icon
    map.data.setStyle(function (feature) {
        return {
            icon: {
                url: feature.getProperty('icon'),
                anchor: new google.maps.Point(25, 25)
            }
        };
    });
    // returns object
    return feature;
};
  // Add the markers to the map
var drawIcons = function (weather) {
    'use strict';
    map.data.addGeoJson(geoJSON);
    // Set the flag to finished
    gettingData = false;
};
// Clear data layer and geoJSON
var resetData = function () {
    'use strict';
    geoJSON = {
        type: "FeatureCollection",
        features: []
    };
    map.data.forEach(function (feature) {
        map.data.remove(feature);
    });
};

locate();