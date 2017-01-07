$(document).ready(function () {
    "use strict";
    
    function isDayTime() {
		var time = new Date().getHours();
		return time > 6 && time < 19;
	}
    
    function displayData(obj) {
        var i = 0;
        $("#temp").html(obj.temp[0]);
        $("#icon").find("i").addClass("wi-owm-" + (isDayTime() ? "day-" : "night-") + obj.id)
                  .attr("title", obj.desc);
        $("#temp").on("click", function () {
            i = (i + 1) % obj.temp.length;
            $(this).html(obj.temp[i]);
        });
    }
        
    function processData(data) {
        console.log(data);
        var K = data.main.temp,
            F = Math.round(1.8 * (K - 273) + 32),
            C = Math.round(K - 273.15),
            id = data.weather[0].id,
            desc = data.weather[0].description,
            icon = data.weather[0].icon,
            iconImg = "http://openweathermap.org/img/w/" + icon + ".png",
            obj = {
                temp: [F + "&deg; F", C + "&deg; C"],
                desc: desc,
                icon: icon,
                iconImg: iconImg,
                id: id
            };
        displayData(obj);
    }
    
    function request(pos) {
        var lat = "?lat=" + pos.lat,
            lon   = "&lon=" + pos.lon,
            appid = "&appid=6a7a44f341c4a791667d912b3fb1c78c",
            url   = "http://api.openweathermap.org/data/2.5/weather",
            query = url + lat + lon + appid;
        $.ajax({
            url: query,
            dataType: "jsonp",
            success: processData
        });
    }
    
    function locate() {
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
                lon = position.coords.longitude,
                pos = {lat: lat, lon: lon};
            request(pos);
        }
        function error(err) {
            console.warn("Error( " + err.code + "): " + err.message);
        }
        navigator.geolocation.getCurrentPosition(success, error, options);
    }
    
    locate();
    
});