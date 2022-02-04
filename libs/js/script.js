let capitalPopup;
let currency;
let countryBounds;
let countryISO;

let defaultView = [51.505, -0.09];
let map = L.map('map').setView(defaultView, 4);
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
})
.addTo(map);

let markers;
var markerCluster = L.markerClusterGroup();
let border;
let borderStyle = {
    "color": "red",
    "weight": 7,
    "opacity": 0.15,
    "fillColor": "black",
    "fillOpacity": 0.3
};

var mapPinIcon = L.icon({
    iconUrl: 'libs/images/299087_marker_map_icon.png',
    iconSize: [40, 40],
    popupAnchor: [0, -22],
});

var earthQuakeIcon = L.icon({
    iconUrl: 'libs/images/crack.png',
    iconSize: [40, 40],
    popupAnchor: [0, -22],
});

const myIcon = L.icon({
    iconUrl: 'libs/images/image.png',
    iconSize:     [60, 60], 
    popupAnchor:  [-3, -20] 
});

L.easyButton( '<i class="fas fa-info"></i>', function(){
    $("#myModal").modal("show")
  }).addTo(map);

L.easyButton( '<i class="fas fa-cloud-sun"></i>', function(){
$("#myModalWeather").modal("show")
}).addTo(map);

// PRELOADER //
$(window).on("load", () => {
    $('.preloader-wrapper').delay(1000).fadeOut('slow', () => {
        $('.preloader-wrapper').remove();
    });
 });

// DOCUMENT READY - INITIAL POSITION //
$(function(){
    $.ajax({
        url: "libs/php/getCountryNames.php",
        type: 'POST',
        dataType: 'json',
        success: function(result) {  
    
            if (result.status.name == "ok") {
                const data = result.data
                data.forEach((country) => {
                    $("<option>", {
                        value: country.iso_a2,
                        text: country.name
                    }).appendTo("#countrySelection");
                });  
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus);
            console.log(errorThrown);
        }
    });
    navigator.geolocation.getCurrentPosition(userPosition)
})

const userPosition = (success) => {

    let userLatitude;
    let userLongitude;
// mouse click event checker
    if("coords" in success){
        userLatitude = success.coords.latitude
        userLongitude = success.coords.longitude
    } else {
        userLatitude = success.latlng.lat
        userLongitude = success.latlng.lng
    }
    

    $.ajax({
        url: "libs/php/getOpenCageByLatLng.php",
        type: 'POST',
        dataType: 'json',
        data: {
            lat: userLatitude,
            lng: userLongitude
        },
        success: function(result) {

            if (result.status.name == "ok") {
                let countryCode = result.data[0].properties.components;
                let countryISO = countryCode["ISO_3166-1_alpha-2"];

                $("#countrySelection").val(countryISO).change();
            }
        
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus);
            console.log(errorThrown);
        }
    }); 
}

// MAP DOUBLE CLICK EVENT

map.on('dblclick', function(e) {
    userPosition(e)
});

// ON CHANGE EVENT //
$("#countrySelection").on("change", ()=> {
    let currentISO = $('#countrySelection').val()
    countryPainter(currentISO);
    markerCluster.clearLayers();

    // get countries lat and from from country code
    $.ajax({
        url: "libs/php/getRestCountry.php",
        type: 'POST',
        dataType: 'json',
        data: {
            country: currentISO,
        },
        success: function(result) {
            let capitalName = result.data[0].capital[0];
            let restCountryData = result.data

            if (result.status.name == "ok") {
                
                // remove any markers
                if(markers){
                    map.removeLayer(markers);
                }
                // mark capitals
                let capitalLatLng = [result.data[0].capitalInfo.latlng[0], result.data[0].capitalInfo.latlng[1]];
                let capitalLat =`${result.data[0].capitalInfo.latlng[0]}&#176;`;
                let capitalLng = `${result.data[0].capitalInfo.latlng[1]}&#176;`;
                let inlineStyle = 'style="display: block; text-align: center"'
                markers =  L.marker(capitalLatLng, {
                    icon: myIcon,

                }).addTo(map);

                countryISO = result.data[0].cca2
                if(countryISO === "GB" || countryISO === "US" || countryISO === "NL"){

                    capitalPopup = L.popup()
                    .setLatLng(capitalLatLng)
                    .setContent(`<p ${inlineStyle}>${result.data[0].capital[0]} is the capital of the ${result.data[0].name.common}!</p><p ${inlineStyle}>${capitalLat}, ${capitalLng}</span></p>`)
                    .openOn(map);

                    markers.bindPopup(capitalPopup).openPopup();  
                } else {

                    capitalPopup = L.popup()
                    .setLatLng(capitalLatLng)
                    .setContent(`<p ${inlineStyle}>${result.data[0].capital[0]} is the capital of ${result.data[0].name.common}!</p><p ${inlineStyle}">${capitalLat}, ${capitalLng}</p>`)
                    .openOn(map);

                    markers.bindPopup(capitalPopup).openPopup();
                };

                // get countries currency
                Object.keys(restCountryData[0].currencies).forEach(element=> {
                    currency = element;
                })
                
                $("#country").html(`${restCountryData[0].name.common}`);
                $("#continent").html(`${restCountryData[0].continents[0]}`);
                $("#population").html((`${restCountryData[0].population}`).replace( /\d{1,3}(?=(\d{3})+(?!\d))/g , "$&,"));
                $("#languages").html(`${getLanguages(restCountryData[0].languages)}`);
                $("#currency").html(`${getCurrency(restCountryData[0].currencies)}`);

                // populate modals with information from API's
                getWeather(capitalName);
                getExchange(capitalName);
                getWiki(countryBounds);
                getEarthQuakes(countryBounds)
                
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus);
            console.log(errorThrown);
        }
    }); 
    
});

// AJAX FUNCTIONS

const countryPainter = (countryToFind) => {
    $.ajax({
        url: "libs/php/getCountryBorders.php",
        type: 'POST',
        dataType: 'json',
        data: {
            country: countryToFind
        },
        success: function(result) {
    
            if (result.status.name == "ok") {
                if(border){
                    map.removeLayer(border)
                }
                border = L.geoJSON(result, borderStyle).addTo(map);
                map.flyToBounds(border);

                countryBounds = border.getBounds();
                countryBounds.north = countryBounds._northEast.lat;
                countryBounds.east = countryBounds._northEast.lng;
                countryBounds.south = countryBounds._southWest.lat;
                countryBounds.west = countryBounds._southWest.lng;
                
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus);
            console.log(errorThrown);
        }
    }); 

}

const getWeather = (capital) => {
    $.ajax({
    url: "libs/php/getWeather.php",
    type: 'POST',
    dataType: 'json',
    data: {
        capital: capital
    },
    success: function(result) {
        if (result.status.name == "ok") {
            weather = result.weather;

            $("#capital").html(`${weather.name}`);
            $("#condition").html(`${weather.weather[0].description}`);
            $("#date").html(`${getDate()}`);
            $("#temp").html(`${weather.main.temp}&#8451`);
            $("#feelsLike").html(`${weather.main.feels_like}&#8451`);
            $("#tempMin").html(`${weather.main.temp_min}&#8451;`);
            $("#tempMax").html(`${weather.main.temp_max}&#8451;`);
            $("#pressure").html(`${weather.main.pressure}`);
            $("#humidity").html(`${weather.main.humidity}&#37;`);
            $("#weatherImage").attr("src", `libs/images/weather-conditions/${result.weather.weather[0].icon}.png`);

        }
    
    },
    error: function(jqXHR, textStatus, errorThrown) {
        console.log(textStatus);
        console.log(errorThrown);
    }
    });
}

const getExchange = (capitalName) => {
    $.ajax({
        url: "libs/php/getExchangeRate.php",
        type: 'POST',
        dataType: 'json',
        data: {
            capital: capitalName
        },
        success: function(result) {

            if (result.status.name == "ok") {
                $("#exchange").html(`1 USD = ${result.currency.rates[currency]} ${currency}`);
            }

        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus);
            console.log(errorThrown);
        }
    });
};

const getWiki = (countryBounds) => {
    $.ajax({
        url: "libs/php/getWiki.php",
        type: 'POST',
        dataType: 'json',
        data: {
            north: countryBounds.north,
            south: countryBounds.south,
            east: countryBounds.east,
            west: countryBounds.west
        },
        success: function(result) {
            if (result.status.name == "ok") {
                let wiki = result.wiki;
                createMarkers(wiki);
            }
        
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus);
            console.log(errorThrown);
        }
    });
};

const getEarthQuakes = (countryBounds) => {
    $.ajax({
        url: "libs/php/getEarthQuakes.php",
        type: 'POST',
        dataType: 'json',
        data: {
            north: countryBounds.north,
            south: countryBounds.south,
            east: countryBounds.east,
            west: countryBounds.west
        },
        success: function(result) {
            if (result.status.name == "ok") {

                let earthquakes = result.earthquakes;
                createEarthQuakes(earthquakes);  
                              
            }
        
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus);
            console.log(errorThrown);
        }
    });
};

// HELPER FUNCTIONS

const getLanguages = (target) => {

    let newLanguages = "";
    let max = Object.keys(target).length;

    Object.keys(target).forEach((element, index) => {

        if(index === 0 ){
            newLanguages += `${target[element]}`;
        } else if (index === max - 1 || max === 1){
            newLanguages += ` and ${target[element]}.`;
        } else {
            newLanguages += `, ${target[element]}`;
        }
    });

    return newLanguages;

};

const getCurrency = (target) =>{
    let currency;
    Object.keys(target).forEach(element => {
        currency = target[element].name;
    })
    return currency;
};

const getDate = () => {
    
    let newDate = new Date;
    let options = { weekday: 'long', day: 'numeric', month: 'long' };
    let todaysDate = newDate.toLocaleDateString("en-GB", options).replace(/,/, '');
    return todaysDate;

};

const createMarkers = (wiki) => {

    for (let i = 0; i < wiki.length; i++) {

        if(countryISO === wiki[i].countryCode){
            let wikiTitle = wiki[i].title;
            let wikiSummary = wiki[i].summary;
            let wikipediaUrl = wiki[i].wikipediaUrl;

            marker = L.marker([wiki[i].lat, wiki[i].lng], {
                icon: mapPinIcon
            }).on("click", createModal);

            function createModal(e){

                $("#wikiTitle").html(`${wikiTitle}`);
                $("#wikiSummary").html(`${wikiSummary}`);
                $("#wikiURL").html(`<a href="https://${wikipediaUrl}">Read more...<a>`);

                $("#myWikiModal").modal("show");
            };

            marker.addTo(markerCluster);
            map.addLayer(markerCluster);

        } else {
            continue; 
        }
    }
};

const createEarthQuakes = (array) => {

    for (let i = 0; i < array.length; i++) {
        
        let quakeMagnitude = array[i].magnitude;
        let htmlDate = array[i].datetime.slice(0, 10).replace(/-/g, ",");
        let options = { day: 'numeric', month: 'long', year: 'numeric' };
        let newDate = new Date(htmlDate);
        let quakeDate = newDate.toLocaleDateString("en-GB", options);
        let quakeDepth = array[i].depth;

        marker = L.marker([array[i].lat, array[i].lng], {
            icon: earthQuakeIcon
        }).on("click", createModal);

        function createModal(e){

            $("#quakeMagnitude").html(`${quakeMagnitude} M<sub>L</sub>`);
            $("#quakeDate").html(`${quakeDate}`);
            $("#quakeDepth").html(`${quakeDepth}km`);

            $("#myQuakeModal").modal("show");
        };

        marker.addTo(markerCluster);
        map.addLayer(markerCluster);

    }
};


