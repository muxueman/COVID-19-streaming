(function (global) {

    var dc = {};
    var homeHtml = "snippets/home-snippets.html";
    var graphHtml = "snippets/graph-snippets.html";

    var covidData;
    d3.csv("data/example.csv").then(function(data) {
        covidData = data;
    });
    
    // rgb to hex
    function rgbToHex(r, g, b){
        var hex = ((r<<16) | (g<<8) | b).toString(16);
        return "#" + new Array(Math.abs(hex.length-7)).join("0") + hex;
    }
  
    // hex to rgb
    function hexToRgb(hex){
        var rgb = [];
        for(var i=1; i<7; i+=2){
            rgb.push(parseInt("0x" + hex.slice(i,i+2)));
        }
        return rgb;
    }
  
    // 计算渐变过渡色
    function gradient (startColor,endColor,step){
        // 将 hex 转换为rgb
        var sColor = hexToRgb(startColor),
        eColor = hexToRgb(endColor);
        // 计算R\G\B每一步的差值
        var rStep = (eColor[0] - sColor[0]) / step;
        gStep = (eColor[1] - sColor[1]) / step;
        bStep = (eColor[2] - sColor[2]) / step;
        var gradientColorArr = [];
        for(var i=0;i<step;i++){
          // 计算每一步的hex值
            gradientColorArr.push(rgbToHex(parseInt(rStep*i+sColor[0]),parseInt(gStep*i+sColor[1]),parseInt(bStep*i+sColor[2])));
        }
        return gradientColorArr;
    }

    var startColor = '#99CCFF';
    var endColor = '#000066';
    var colorArr1 = gradient(startColor, endColor, 100);
    var colorArr2 = gradient("#003399", startColor, 300);

    var getBackGroundColor = function (risk) {
        //console.log(risk*1000 | 0);
        var index = risk*1000 | 0;
        var ccColor = "grey";
        if (index != null && index<100) 
            ccColor = colorArr1[index];
        // if (level == "low") return "#CCFFFF";
        // else if (level == "Medium") return "#3366FF";
        // else if (level == "High") return "#0033CC";
        // else if (level == "Extrem high") return "#000066";
        // else return "white";
        return ccColor;
    }

    var getAttitudeColor = function (attitude) {
        if (attitude == 0) return "white";
        var index = attitude*1000 | 0;
        var cccColor = "grey";
        if (index != null && index<300) 
            cccColor = colorArr2[index];
        return cccColor;
    }


    document.querySelector('#locate-me').addEventListener('click', function (event) {
        var location = document.querySelector('#show-location');
        function success(position) {
            var latitude  = position.coords.latitude;
            var longitude = position.coords.longitude  
            location.placeholder = `Lat: ${latitude}°, Lng: ${longitude}°`;;
            //initNewYorkMap(latitude, longitude, 13, true);  
            //initNewYorkSimpleMap(latitude, longitude, 8, true);
            initCountryMap(latitude, longitude, 5, true);
            initAttitudeMap(latitude, longitude, 5, true);
        }
        function error() {
            location.placeholder = 'Unable to retrieve your location';
        }
        if (!navigator.geolocation) {
          location.placeholder = 'Geolocation is not supported by your browser';
        } else {
          location.placeholder = 'Locating…';
          navigator.geolocation.getCurrentPosition(success, error);
        }
    });
    // Convenience function for inserting innerHTML for 'select'
    var insertHtml = function (selector, html) {
        var targetElem = document.querySelector(selector);
        targetElem.innerHTML = html;
    };
    
    // Show loading icon inside element identified by 'selector'.
    var showLoading = function (selector) {
        var html = "<div class='text-center'>";
        html += "<img src='images/ajax-loader.gif'></div>";
        insertHtml(selector, html);
    };

    // add location info for google map
    var addMarkerToMap = function (selector, latData, lngData) {
        var marker = new google.maps.Marker({
            position: {
                lat: latData, 
                lng: lngData,
            },
            map: selector
        });
    }

    // Init google map 
    var initNewYorkMap = function (latData, lngData, zoomLevel, addMarker) {
        var mapElem = new google.maps.Map(document.getElementById("New-York-ZipCode-map"), {
                center: {lat: latData, lng: lngData},
                zoom: zoomLevel
        });
        mapElem.data.loadGeoJson("data/new-york-zipcode.geojson");
        // Set the stroke width, and fill color for each polygon
        mapElem.data.setStyle({
            fillColor: 'grey',
            strokeWeight: 2,
            strokeColor: 'black',
        });

        if (addMarker) addMarkerToMap(mapElem, latData, lngData);

        // Set mouseover event for each feature.
        mapElem.data.addListener('mouseover', function(event) {
            document.getElementById('zipCode-info-box').textContent =
                event.feature.getProperty('ZCTA5CE10');
            mapElem.data.revertStyle();
            mapElem.data.overrideStyle(event.feature, {strokeWeight: 4});
        });

        
        mapElem.data.addListener('mouseout', function(event) {
            mapElem.data.revertStyle();
        });
    };

    var initNewYorkSimpleMap = function (latData, lngData, zoomLevel,addMarker) {
        var mapElem = new google.maps.Map(document.getElementById("New-York-City-map"), {
                center: {lat: latData, lng: lngData},
                zoom: zoomLevel
        });
        mapElem.data.loadGeoJson("data/new-york-city.geojson");
        mapElem.data.setStyle({
            fillColor: 'grey',
            strokeWeight: 2,
            strokeColor: 'black',
        });

        if (addMarker) addMarkerToMap(mapElem, latData, lngData);

        // Set mouseover event for each feature.
        mapElem.data.addListener('mouseover', function(event) {
            document.getElementById('city-info-box').textContent =
                event.feature.getProperty('NAME');
            mapElem.data.revertStyle();
            mapElem.data.overrideStyle(event.feature, {strokeWeight: 4});
        });

        
        mapElem.data.addListener('mouseout', function(event) {
            mapElem.data.revertStyle();
        });
    };

    var initCountryMap = function (latData, lngData, zoomLevel, addMarker) {
        var mapElem = new google.maps.Map(document.getElementById("US-State-map"), {
                center: {lat: latData, lng: lngData},
                zoom: zoomLevel
        });
        mapElem.data.loadGeoJson("data/us-states.geojson");

        mapElem.data.setStyle(function(feature) {
            return /** @type {google.maps.Data.StyleOptions} */({
              fillColor: getBackGroundColor(covidData[feature.getId()-1].risk),
              fillOpacity: 0.9,
              //getBackGroundOpacity(covidData[feature.getId()-1].risk),
              strokeWeight: 1
            });
        });

        if (addMarker) addMarkerToMap(mapElem, latData, lngData);
        

        // Set mouseover event for each feature.
        mapElem.data.addListener('mouseover', function(event) {
            
            var curContent = "";
            var curColor = "write";
            var curId = event.feature.getId();
            if (curId <= 56) {
                var curData = covidData[curId-1];
                var curContent = "risk: " + curData.level + "<br>" +
                    "People's attitude:<br>P: " + curData.positive +
                    "<br>N: " + curData.negative + "<br>confirmed cases/death<br>" +
                    curData.cases + "/" + curData.deaths;
                curColor = getBackGroundColor(curData.level);
                
            }
            var content = event.feature.getProperty('name') + "<br>" + curContent;
            document.getElementById('state-info-box').innerHTML = content;
            // console.log(content);
            // console.log(curColor);
            document.getElementById("state-info-box").style.borderColor = curColor;
            mapElem.data.revertStyle();
            mapElem.data.overrideStyle(event.feature, {strokeWeight: 4});
        });

        
        mapElem.data.addListener('mouseout', function(event) {
            mapElem.data.revertStyle();
        });

    };

    var initAttitudeMap = function (latData, lngData, zoomLevel, addMarker) {
        var mapElem = new google.maps.Map(document.getElementById("New-York-ZipCode-map"), {
                center: {lat: latData, lng: lngData},
                zoom: zoomLevel
        });
        mapElem.data.loadGeoJson("data/us-states.geojson");

        mapElem.data.setStyle(function(feature) {
            return /** @type {google.maps.Data.StyleOptions} */({
              fillColor: getAttitudeColor(covidData[feature.getId()-1].positive),
              fillOpacity: 0.9,
              //getBackGroundOpacity(covidData[feature.getId()-1].risk),
              strokeWeight: 1
            });
        });

        if (addMarker) addMarkerToMap(mapElem, latData, lngData);
        

        // Set mouseover event for each feature.
        mapElem.data.addListener('mouseover', function(event) {
            
            var curContent = "";
            var curColor = "write";
            var curId = event.feature.getId();
            if (curId <= 56) {
                var curData = covidData[curId-1];
                var curContent = "risk: " + curData.level + "<br>" +
                    "People's attitude:<br>P: " + curData.positive +
                    "<br>N: " + curData.negative + "<br>confirmed cases/death<br>" +
                    curData.cases + "/" + curData.deaths;
                curColor = getBackGroundColor(curData.level);
                
            }
            var content = event.feature.getProperty('name') + "<br>" + curContent;
            document.getElementById('zipCode-info-box').innerHTML = content;
            // console.log(content);
            // console.log(curColor);
            document.getElementById("zipCode-info-box").style.borderColor = curColor;
            mapElem.data.revertStyle();
            mapElem.data.overrideStyle(event.feature, {strokeWeight: 4});
        });

        
        mapElem.data.addListener('mouseout', function(event) {
            mapElem.data.revertStyle();
        });

    };
    
    // On page load (before images or CSS)
    document.addEventListener("DOMContentLoaded", function (event) {
    
    // On first load, show home view, call server to load
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(
        homeHtml,
        function (responseText) {
            document.querySelector("#main-content")
                .innerHTML = responseText;
            //initNewYorkMap(40.7128, -74.0060, 11, false); 
            //initNewYorkSimpleMap(42.8994, -74.2179, 7, false);
            initCountryMap(37.0902, -95.7129, 4, false);
            initAttitudeMap(37.0902, -95.7129, 4, false);
      },
      false);
    });


    
    dc.loadGraphs = function () {
        showLoading("#main-content");
        $ajaxUtils.sendGetRequest(
            graphHtml,
            function (responseText) {
                document.querySelector("#main-content")
                    .innerHTML = responseText;   
                loadAllCharts();                
                
        },
        false);
    };

    // load each timeline-graph-chart
    var loadAllCharts = function () {  
        //TODO: load data from external files
        loadCharts("chartContainer1");
        loadCharts("chartContainer2");
        loadCharts("chartContainer3");
        loadCharts("chartContainer4");
        loadCharts("chartContainer5");
        loadCharts("chartContainer6");
    }


    var loadCharts = function (selector) {
        var chart = new CanvasJS.Chart(document.getElementById(selector), {
        //Todo
    });
    chart.render();

    function toogleDataSeries(e){
        if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
        } else{
            e.dataSeries.visible = true;
        }
        chart.render();
    }
  }


    global.$dc = dc;
    global.$d3 = d3;
    global.$('.carousel').carousel();    // bootstrap func
    
})(window);


