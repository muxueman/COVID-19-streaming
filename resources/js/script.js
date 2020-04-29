


(function (global) {

    var dc = {};
    
    var homeHtml = "snippets/home-snippets.html";
    var graphHtml = "snippets/graph-snippets.html";

    document.querySelector('#locate-me').addEventListener('click', function (event) {
        var location = document.querySelector('#show-location');
        function success(position) {
            var latitude  = position.coords.latitude;
            var longitude = position.coords.longitude  
            location.placeholder = `Lat: ${latitude}°, Lng: ${longitude}°`;;
            initNewYorkMap(latitude, longitude, 13, true);  
            initNewYorkSimpleMap(latitude, longitude, 8, true);
            initCountryMap(latitude, longitude, 5, true);
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
        
        // map.data.setStyle(function(feature) {
        //     return /** @type {google.maps.Data.StyleOptions} */({
        //       fillColor: feature.getProperty('color'),
        //       strokeWeight: 1
        //     });
        // });

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
        // map.data.setStyle(function(feature) {
        //     return /** @type {google.maps.Data.StyleOptions} */({
        //       fillColor: feature.getProperty('color'),
        //       strokeWeight: 1
        //     });
        // });

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

        mapElem.data.setStyle({
            fillColor: 'grey',
            strokeWeight: 2,
            strokeColor: 'black',
        });

        if (addMarker) addMarkerToMap(mapElem, latData, lngData);
        // map.data.setStyle(function(feature) {
        //     return /** @type {google.maps.Data.StyleOptions} */({
        //       fillColor: feature.getProperty('color'),
        //       strokeWeight: 1
        //     });
        // });

        // Set mouseover event for each feature.
        mapElem.data.addListener('mouseover', function(event) {
            document.getElementById('state-info-box').textContent =
                event.feature.getProperty('name');
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
            initNewYorkMap(40.7128, -74.0060, 11, false); 
            initNewYorkSimpleMap(42.8994, -74.2179, 7, false);
            initCountryMap(37.0902, -95.7129, 4, false);
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
        title: {
            text: "Comfirmed death"
        },
        axisX: {
            valueFormatString: "MMM YYYY"
        },
        axisY2: {
            title: "case",
            prefix: "$",
            suffix: "K"
        },
        toolTip: {
            shared: true
        },
        legend: {
            cursor: "pointer",
            verticalAlign: "top",
            horizontalAlign: "center",
            dockInsidePlotArea: true,
            itemclick: toogleDataSeries
        },
        data: [{
            type:"line",
            axisYType: "secondary",
            name: "San Fransisco",
            showInLegend: true,
            markerSize: 0,
            yValueFormatString: "$#,###k",
            dataPoints: [		
                { x: new Date(2014, 00, 01), y: 850 },
                { x: new Date(2014, 01, 01), y: 889 },
                { x: new Date(2014, 02, 01), y: 890 },
                { x: new Date(2014, 03, 01), y: 899 },
                { x: new Date(2014, 04, 01), y: 903 },
                { x: new Date(2014, 05, 01), y: 925 },
                { x: new Date(2014, 06, 01), y: 899 },
                { x: new Date(2014, 07, 01), y: 875 },
                { x: new Date(2014, 08, 01), y: 927 },
                { x: new Date(2014, 09, 01), y: 949 },
                { x: new Date(2014, 10, 01), y: 946 },
                { x: new Date(2014, 11, 01), y: 927 },
                { x: new Date(2015, 00, 01), y: 950 },
                { x: new Date(2015, 01, 01), y: 998 },
                { x: new Date(2015, 02, 01), y: 998 },
                { x: new Date(2015, 03, 01), y: 1050 },
                { x: new Date(2015, 04, 01), y: 1050 },
                { x: new Date(2015, 05, 01), y: 999 },
                { x: new Date(2015, 06, 01), y: 998 },
                { x: new Date(2015, 07, 01), y: 998 },
                { x: new Date(2015, 08, 01), y: 1050 },
                { x: new Date(2015, 09, 01), y: 1070 },
                { x: new Date(2015, 10, 01), y: 1050 },
                { x: new Date(2015, 11, 01), y: 1050 },
                { x: new Date(2016, 00, 01), y: 995 },
                { x: new Date(2016, 01, 01), y: 1090 },
                { x: new Date(2016, 02, 01), y: 1100 },
                { x: new Date(2016, 03, 01), y: 1150 },
                { x: new Date(2016, 04, 01), y: 1150 },
                { x: new Date(2016, 05, 01), y: 1150 },
                { x: new Date(2016, 06, 01), y: 1100 },
                { x: new Date(2016, 07, 01), y: 1100 },
                { x: new Date(2016, 08, 01), y: 1150 },
                { x: new Date(2016, 09, 01), y: 1170 },
                { x: new Date(2016, 10, 01), y: 1150 },
                { x: new Date(2016, 11, 01), y: 1150 },
                { x: new Date(2017, 00, 01), y: 1150 },
                { x: new Date(2017, 01, 01), y: 1200 },
                { x: new Date(2017, 02, 01), y: 1200 },
                { x: new Date(2017, 03, 01), y: 1200 },
                { x: new Date(2017, 04, 01), y: 1190 },
                { x: new Date(2017, 05, 01), y: 1170 }
            ]
        },
        {
            type: "line",
            axisYType: "secondary",
            name: "Manhattan",
            showInLegend: true,
            markerSize: 0,
            yValueFormatString: "$#,###k",
            dataPoints: [
                { x: new Date(2014, 00, 01), y: 1200 },
                { x: new Date(2014, 01, 01), y: 1200 },
                { x: new Date(2014, 02, 01), y: 1190 },
                { x: new Date(2014, 03, 01), y: 1180 },
                { x: new Date(2014, 04, 01), y: 1250 },
                { x: new Date(2014, 05, 01), y: 1270 },
                { x: new Date(2014, 06, 01), y: 1300 },
                { x: new Date(2014, 07, 01), y: 1300 },
                { x: new Date(2014, 08, 01), y: 1358 },
                { x: new Date(2014, 09, 01), y: 1410 },
                { x: new Date(2014, 10, 01), y: 1480 },
                { x: new Date(2014, 11, 01), y: 1500 },
                { x: new Date(2015, 00, 01), y: 1500 },
                { x: new Date(2015, 01, 01), y: 1550 },
                { x: new Date(2015, 02, 01), y: 1550 },
                { x: new Date(2015, 03, 01), y: 1590 },
                { x: new Date(2015, 04, 01), y: 1600 },
                { x: new Date(2015, 05, 01), y: 1590 },
                { x: new Date(2015, 06, 01), y: 1590 },
                { x: new Date(2015, 07, 01), y: 1620 },
                { x: new Date(2015, 08, 01), y: 1670 },
                { x: new Date(2015, 09, 01), y: 1720 },
                { x: new Date(2015, 10, 01), y: 1750 },
                { x: new Date(2015, 11, 01), y: 1820 },
                { x: new Date(2016, 00, 01), y: 2000 },
                { x: new Date(2016, 01, 01), y: 1920 },
                { x: new Date(2016, 02, 01), y: 1750 },
                { x: new Date(2016, 03, 01), y: 1850 },
                { x: new Date(2016, 04, 01), y: 1750 },
                { x: new Date(2016, 05, 01), y: 1730 },
                { x: new Date(2016, 06, 01), y: 1700 },
                { x: new Date(2016, 07, 01), y: 1730 },
                { x: new Date(2016, 08, 01), y: 1720 },
                { x: new Date(2016, 09, 01), y: 1740 },
                { x: new Date(2016, 10, 01), y: 1750 },
                { x: new Date(2016, 11, 01), y: 1750 },
                { x: new Date(2017, 00, 01), y: 1750 },
                { x: new Date(2017, 01, 01), y: 1770 },
                { x: new Date(2017, 02, 01), y: 1750 },
                { x: new Date(2017, 03, 01), y: 1750 },
                { x: new Date(2017, 04, 01), y: 1730 },
                { x: new Date(2017, 05, 01), y: 1730 }
            ]
        },
        {
            type: "line",
            axisYType: "secondary",
            name: "Seatle",
            showInLegend: true,
            markerSize: 0,
            yValueFormatString: "$#,###k",
            dataPoints: [
                { x: new Date(2014, 00, 01), y: 409 },
                { x: new Date(2014, 01, 01), y: 415 },
                { x: new Date(2014, 02, 01), y: 419 },
                { x: new Date(2014, 03, 01), y: 429 },
                { x: new Date(2014, 04, 01), y: 429 },
                { x: new Date(2014, 05, 01), y: 450 },
                { x: new Date(2014, 06, 01), y: 450 },
                { x: new Date(2014, 07, 01), y: 445 },
                { x: new Date(2014, 08, 01), y: 450 },
                { x: new Date(2014, 09, 01), y: 450 },
                { x: new Date(2014, 10, 01), y: 440 },
                { x: new Date(2014, 11, 01), y: 429 },
                { x: new Date(2015, 00, 01), y: 435 },
                { x: new Date(2015, 01, 01), y: 450 },
                { x: new Date(2015, 02, 01), y: 475 },
                { x: new Date(2015, 03, 01), y: 475 },
                { x: new Date(2015, 04, 01), y: 475 },
                { x: new Date(2015, 05, 01), y: 489 },
                { x: new Date(2015, 06, 01), y: 495 },
                { x: new Date(2015, 07, 01), y: 495 },
                { x: new Date(2015, 08, 01), y: 500 },
                { x: new Date(2015, 09, 01), y: 508 },
                { x: new Date(2015, 10, 01), y: 520 },
                { x: new Date(2015, 11, 01), y: 525 },
                { x: new Date(2016, 00, 01), y: 525 },
                { x: new Date(2016, 01, 01), y: 529 },
                { x: new Date(2016, 02, 01), y: 549 },
                { x: new Date(2016, 03, 01), y: 550 },
                { x: new Date(2016, 04, 01), y: 568 },
                { x: new Date(2016, 05, 01), y: 575 },
                { x: new Date(2016, 06, 01), y: 579 },
                { x: new Date(2016, 07, 01), y: 575 },
                { x: new Date(2016, 08, 01), y: 585 },
                { x: new Date(2016, 09, 01), y: 589 },
                { x: new Date(2016, 10, 01), y: 595 },
                { x: new Date(2016, 11, 01), y: 595 },
                { x: new Date(2017, 00, 01), y: 595 },
                { x: new Date(2017, 01, 01), y: 600 },
                { x: new Date(2017, 02, 01), y: 624 },
                { x: new Date(2017, 03, 01), y: 635 },
                { x: new Date(2017, 04, 01), y: 650 },
                { x: new Date(2017, 05, 01), y: 675 }
            ]
        },
        {
            type: "line",
            axisYType: "secondary",
            name: "Los Angeles",
            showInLegend: true,
            markerSize: 0,
            yValueFormatString: "$#,###k",
            dataPoints: [
                { x: new Date(2014, 00, 01), y: 529 },
                { x: new Date(2014, 01, 01), y: 540 },
                { x: new Date(2014, 02, 01), y: 539 },
                { x: new Date(2014, 03, 01), y: 565 },
                { x: new Date(2014, 04, 01), y: 575 },
                { x: new Date(2014, 05, 01), y: 579 },
                { x: new Date(2014, 06, 01), y: 589 },
                { x: new Date(2014, 07, 01), y: 579 },
                { x: new Date(2014, 08, 01), y: 579 },
                { x: new Date(2014, 09, 01), y: 579 },
                { x: new Date(2014, 10, 01), y: 569 },
                { x: new Date(2014, 11, 01), y: 525 },
                { x: new Date(2015, 00, 01), y: 535 },
                { x: new Date(2015, 01, 01), y: 575 },
                { x: new Date(2015, 02, 01), y: 599 },
                { x: new Date(2015, 03, 01), y: 619 },
                { x: new Date(2015, 04, 01), y: 639 },
                { x: new Date(2015, 05, 01), y: 648 },
                { x: new Date(2015, 06, 01), y: 640 },
                { x: new Date(2015, 07, 01), y: 645 },
                { x: new Date(2015, 08, 01), y: 648 },
                { x: new Date(2015, 09, 01), y: 649 },
                { x: new Date(2015, 10, 01), y: 649 },
                { x: new Date(2015, 11, 01), y: 649 },
                { x: new Date(2016, 00, 01), y: 650 },
                { x: new Date(2016, 01, 01), y: 665 },
                { x: new Date(2016, 02, 01), y: 675 },
                { x: new Date(2016, 03, 01), y: 695 },
                { x: new Date(2016, 04, 01), y: 690 },
                { x: new Date(2016, 05, 01), y: 699 },
                { x: new Date(2016, 06, 01), y: 699 },
                { x: new Date(2016, 07, 01), y: 699 },
                { x: new Date(2016, 08, 01), y: 699 },
                { x: new Date(2016, 09, 01), y: 699 },
                { x: new Date(2016, 10, 01), y: 709 },
                { x: new Date(2016, 11, 01), y: 699 },
                { x: new Date(2017, 00, 01), y: 700 },
                { x: new Date(2017, 01, 01), y: 700 },
                { x: new Date(2017, 02, 01), y: 724 },
                { x: new Date(2017, 03, 01), y: 739 },
                { x: new Date(2017, 04, 01), y: 749 },
                { x: new Date(2017, 05, 01), y: 740 }
            ]
        }]
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
    
    global.$('.carousel').carousel();    // bootstrap func
    
})(window);


