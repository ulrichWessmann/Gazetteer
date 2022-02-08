let capitalPopup;
let currency;
let countryBounds;
let countryISO;
let newDate = new Date;

let defaultView = [51.505, -0.09];
let map = L.map('map').setView(defaultView, 4);
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
})
.addTo(map);


// MARKERS
let markers;
var markerCluster = L.markerClusterGroup({
    maxClusterRadius: 30
});
var mapPinIcon = L.ExtraMarkers.icon({
    shape: 'square',
    markerColor: 'yellow',
    prefix: 'fa',
    icon: 'fa-star',
    iconColor: '#fff',
});

var mapCameraIcon = L.ExtraMarkers.icon({
    shape: 'square',
    markerColor: 'red',
    prefix: 'fa',
    icon: 'fa-video',
    iconColor: '#fff',
  });
var earthQuakeIcon = L.ExtraMarkers.icon({
    shape: 'square',
    markerColor: 'black',
    prefix: 'fa',
    icon: 'fa-house-damage',
    iconColor: '#fff',
});

var myIcon = L.ExtraMarkers.icon({
    shape: 'square',
    markerColor: 'white',
    prefix: 'fa',
    icon: 'fa-city',
    iconColor: '#000',
});

let border;
let borderStyle = {
    "color": "red",
    "weight": 7,
    "opacity": 0.15,
    "fillColor": "black",
    "fillOpacity": 0.3
};

// EASY BUTTONS //

L.easyButton( '<i class="fas fa-info"></i>', function(){
    $("#myModal").modal("show")
  }).addTo(map);

L.easyButton( '<i class="fas fa-cloud-sun"></i>', function(){
$("#myModalWeather").modal("show")
}).addTo(map);

L.easyButton( '<i class="fas fa-calendar-alt"></i>', function(){
$("#myCaleandarModal").modal("show")
}).addTo(map);

L.easyButton( '<i class="fas fa-camera"></i>', function(){
$("#myPhotoModal").modal("show")
}).addTo(map);

L.easyButton( '<i class="fas fa-virus"></i>', function(){
$("#myCoronaModal").modal("show")
}).addTo(map);
let newsbutton;

// L.easyButton( '<i class="fas fa-newspaper"></i>', function(){
// $("#myNewsModal").modal("show")
// }).addTo(map);

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
                
                capitalPopup = L.popup()
                .setLatLng(capitalLatLng)
                .setContent(`<p ${inlineStyle}>${result.data[0].capital[0]}</p><p ${inlineStyle}>${capitalLat}, ${capitalLng}</span></p>`)
                .openOn(map);

                    markers.bindPopup(capitalPopup).openPopup();

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
                getWeather(capitalLatLng, capitalName);
                // exchange api exhausted
                // getExchange(capitalName);
                getWiki(countryBounds);
                getEarthQuakes(countryBounds)
                getWindyCameras(countryISO)
                getHolidays(countryISO)
                getCountryPhotos(restCountryData[0].name.common.replace(/ +/g, ""))
                getCovidData()
                getNews()
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

const getWeather = (capital, capitalName) => {
    $.ajax({
    url: "libs/php/getWeather.php",
    type: 'POST',
    dataType: 'json',
    data: {
        capitalLat: capital[0],
        capitalLng: capital[1],

    },
    success: function(result) {
        
        if (result.status.name == "ok") {
            weather = result.weather.daily;
            let today = new Date();

            // conditional check for main container
            if($("#weatherForecast")){
                $("#weatherForecast").remove();
            }
            
            // create container for following 4 day weather information
            $("#weatherContainer").append('<div class="container-fluid"><div class="row" id="weatherForecast"></div></div>');

            // daily only
            $("#weatherDate").html(`${getDate(today, { weekday: 'long', day: 'numeric', month: 'long' })}`);
            $("#capital").html(`${capitalName}`);
            $("#weatherImage").attr("src", `libs/images/weather-conditions/${weather[0].weather[0].icon}.png`);
            $("#condition").html(`${weather[0].weather[0].description}`);
            $("#tempMin").html(`${Math.round(weather[0].temp.max)}&deg;`);
            $("#tempMax").html(`${Math.round(weather[0].temp.min)}&deg;`);

            let fourday = weather.slice(1, 5)

            fourday.forEach(element => {
                let unixTimestamp = element.dt;
                let date = new Date(unixTimestamp * 1000);
                let prettyDate = getDate(date, { weekday: 'long' });
                // set day
                $("#weatherForecast").append(`
                <div class="col-sm border rounded m-1 text-center">
                    <p class="text-center fw-bold">${prettyDate}</p>
                    <p class="text-centre">${Math.round(element.temp.max)}&deg;</p>
                    <p class="text-centre">${Math.round(element.temp.min)}&deg;</p>
                </div>
                `);
            });

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

const getWindyCameras = () => {
    $.ajax({
        url: "libs/php/getWindyCameras.php",
        type: 'POST',
        dataType: 'json',
        data: {
            country: countryISO,
            
        },
        success: function(result) {
        
            if (result.status.name == "ok") {

                let cameras = result.cameras.result.webcams;
                for (let i = 0; i < cameras.length; i++) {

                    marker = L.marker([cameras[i].location.latitude, cameras[i].location.longitude], {icon: mapCameraIcon}).addTo(markerCluster);
                    context = L.popup()
                    .setLatLng([[cameras[i].location.latitude, cameras[i].location.longitude]])
                    .setContent(`<p><b>${cameras[i].title}</b></p><p><iframe src="${cameras[i].player.day.embed}" ></p>`)
                    marker.bindPopup(context, {
                        minWidth: 320
                        })
                    map.addLayer(markerCluster)
                }
            }
        
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus);
            console.log(errorThrown);
        }
    });
}

const getHolidays = () => {
    $.ajax({
        url: "libs/php/getHolidays.php",
        type: 'POST',
        dataType: 'json',
        data: {
            country: countryISO,
            
        },
        success: function(result) {
            
            if (result.status.name == "ok") {
                let holidays = result.holidays.holidays
                if($("#holidayName")){
                    $("#holidayName").remove()
                }
                $("#getTable").prepend('<tbody id="holidayName"></tbody class="">')

                holidays.forEach(element => {
                    if(element.public === true){
                        date = new Date(element.date)
                        let elementName = `<tr><td><b>${element.name}</b></td>`
                        let elementDate = `<td>${getDate(date, { weekday: 'short', day: 'numeric', month: 'short' })}</td></tr>`
                        $("#holidayName").append(elementName + elementDate)
                    }
                });

            }
        
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus);
            console.log(errorThrown);
        }
    });
}
const getCountryPhotos = (capitalName) => {
    $.ajax({
        url: "libs/php/getCountryPhotos.php",
        type: 'POST',
        dataType: 'json',
        data: {
            capital: capitalName,
            
        },
        success: function(result) {
            
            if (result.status.name == "ok") {

                let images = result.images.results
                $("#photo1").attr({
                    src: `${images[0].urls.small}`,
                    alt: `${images[0].alt_description}`,
                });
                $("#photo2").attr({
                    src: `${images[1].urls.small}`,
                    alt: `${images[1].alt_description}`,
                });
                $("#photo3").attr({
                    src: `${images[2].urls.small}`,
                    alt: `${images[2].alt_description}`,
                });
                $("#photo4").attr({
                    src: `${images[3].urls.small}`,
                    alt: `${images[3].alt_description}`,
                });
                $("#photo5").attr({
                    src: `${images[4].urls.small}`,
                    alt: `${images[4].alt_description}`,
                });

                $("#photo6").attr({
                    src: `${images[5].urls.small}`,
                    alt: `${images[5].alt_description}`,
                });
            }
        
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus);
            console.log(errorThrown);
        }
    });
}
const getCovidData = () => {
    $.ajax({
        url: "libs/php/getCovidData.php",
        type: 'POST',
        dataType: 'json',
        data: {
            country: countryISO,
        },
        success: function(result) {

            // let result.covid.data = covid;
            if (result.status.name == "ok") {
                let covid = result.covid.data;
                
                $("#totalDeaths").html(covid.latest_data.deaths)
                $("#todayDeaths").html(covid.today.confirmed)
                $("#totalConfirmed").html(covid.latest_data.confirmed)
                $("#todayConfirmed").html(covid.today.confirmed)
                $("#totalRecovered").html(covid.latest_data.recovered)
                $("#perMillion").html(covid.latest_data.calculated.cases_per_million_population)
                $("#deathRate").html(covid.latest_data.calculated.death_rate.toString().slice(0,4))
                $("#recoveryRate").html(covid.latest_data.calculated.recovery_rate.toString().slice(0,5))
            }
        
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus);
            console.log(errorThrown);
        }
    });
}
const getNews = () => {
    $.ajax({
        url: "libs/php/getNews.php",
        type: 'POST',
        dataType: 'json',
        data: {
            country: countryISO,
        },
        success: function(result) {

            if (result.status.name == "ok") {
                let news = result.news.articles
                // add news dynamically
                if($("#firstRow")){
                    $("#firstRow").remove()
                    $("#secondRow").remove()
                }
                if(result.news.totalResults === 0 || result.news.status === "error"){

                   if(newsbutton){
                       map.removeControl(newsbutton)
                   }

                } else {
                    // remove old button and create new instance
                    if(newsbutton){
                        map.removeControl(newsbutton)
                    }
                    newsbutton = L.easyButton( '<i class="fas fa-newspaper"></i>', function(){
                        $("#myNewsModal").modal("show")
                        })

                    newsbutton.addTo(map);
                    // create containers dynamically
                    $("#newsArticles").append('<div class="row" id="firstRow"></div>')
                    $("#newsArticles").append('<div class="row" id="secondRow"></div>')
                    // first card
                    $("#firstRow").append(
                        `<div class="col-lg p-2 m-2 d-flex">
                        <div class="card">
                          <img class="card-img-top" ${checkForImage(news[0])}">
                          <div class="card-body d-flex flex-column justify-content-between" >
                            <p class="card-title fw-bold ">${news[0].title}</p>
                            <p class="card-text link"><small class="text-muted"><a href=""${news[0].url}" target="_blank">Read more</a></small></p>
                          </div>
                        </div>
                      </div>`)

                    $("#firstRow").append(
                        `<div class="col-lg p-2 m-2 d-flex">
                        <div class="card">
                          <img class="card-img-top" ${checkForImage(news[1])}">
                          <div class="card-body d-flex flex-column justify-content-between" >
                            <p class="card-title fw-bold">${news[1].title}</p>
                            <p class="card-text link"><small class="text-muted"><a href=""${news[1].url}" target="_blank">Read more</a></small></p>
                          </div>
                        </div>
                      </div>`)

                    $("#firstRow").append(
                        `<div class="col-lg p-2 m-2 d-flex">
                        <div class="card">
                          <img class="card-img-top" ${checkForImage(news[2])}">
                          <div class="card-body d-flex flex-column justify-content-between" >
                            <p class="card-title fw-bold">${news[2].title}</p>
                            <p class="card-text link"><small class="text-muted"><a href=""${news[2].url}" target="_blank">Read more</a></small></p>
                          </div>
                        </div>
                      </div>`)
                        // second column
                    $("#secondRow").append(
                        `<div class="col p-2 m-2 d-flex">
                        <div class="card">
                          <img class="card-img-top" ${checkForImage(news[3])}">
                          <div class="card-body d-flex flex-column justify-content-between" >
                            <p class="card-title fw-bold">${news[3].title}</p>
                            <p class="card-text link"><small class="text-muted"><a href=""${news[3].url}" target="_blank">Read more</a></small></p>
                          </div>
                        </div>
                      </div>`)

                    $("#secondRow").append(
                        `<div class="col p-2 m-2 d-flex">
                        <div class="card">
                          <img class="card-img-top" ${checkForImage(news[4])}">
                          <div class="card-body d-flex flex-column justify-content-between" >
                            <p class="card-title fw-bold">${news[4].title}</p>
                            <p class="card-text link"><small class="text-muted"><a href=""${news[4].url}" target="_blank">Read more</a></small></p>
                          </div>
                        </div>
                      </div>`)

                    $("#secondRow").append(
                        `<div class="col p-2 m-2 d-flex">
                        <div class="card">
                          <img class="card-img-top" ${checkForImage(news[5])}">
                          <div class="card-body d-flex flex-column justify-content-between" >
                            <p class="card-title fw-bold">${news[5].title}</p>
                            <p class="card-text link"><small class="text-muted"><a href=""${news[5].url}" target="_blank">Read more</a></small></p>
                          </div>
                        </div>
                      </div>`)
                }
            }
        
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus);
            console.log(errorThrown);
        }
    });
}

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

const getDate = (date, options) => {

    let todaysDate = date.toLocaleDateString("en-GB", options).replace(/,/, '');
    return todaysDate;

};

const createMarkers = (wiki) => {

    for (let i = 0; i < wiki.length; i++) {

        if(countryISO === wiki[i].countryCode){

            marker = L.marker([wiki[i].lat, wiki[i].lng], {icon: mapPinIcon}).addTo(markerCluster);
            context = L.popup()
            .setLatLng([wiki[i].lat, wiki[i].lng])
            .setContent(`<p><b>${wiki[i].title}</b></p><p></p><p>${wiki[i].summary}</p><p><a href="https://${wiki[i].wikipediaUrl}" target="_blank">Read more...<a></p><p></p>`)
            marker.bindPopup(context)
            map.addLayer(markerCluster)

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
            }).addTo(markerCluster);
            context = L.popup()
            .setLatLng([array[i].lat, array[i].lng])
            .setContent(`<p><b>Strength:</b> ${quakeMagnitude}</b>M<sub>L</p><p><b>Depth:</b> ${quakeDepth}km</p><p>${quakeDate}</p>`)
            marker.bindPopup(context)
            map.addLayer(markerCluster)
    }
};

const checkForImage = (array) => {
    imageTag = ""
    if(array.urlToImage) {
        imageTag = `src="${array.urlToImage}" alt="${array.description}"`;
    } else {
        imageTag = 'src="libs/images/placeholder.jpg" alt="Place holder image"';
    }
    return imageTag;
};

