let capitalPopup;
let cityMarkers;
let currency;
let exchange;
let countryBounds;
let countryISO;

var myIcon = L.icon({
    iconUrl: 'libs/images/castle.png',
    iconSize: [80, 80],
    popupAnchor: [0, -22],
});

let defaultView = [51.505, -0.09];
let markers;
let border;
let borderStyle = {
    "color": "black",
    "weight": 3,
    "opacity": 0.20
}

var map = L.map('map').setView(defaultView, 4);
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
})
.addTo(map);

var shelterMarkers = L.featureGroup();
    map.addLayer(shelterMarkers);

const fontAwesomeIcon = L.divIcon({
    html: '<i class="fas fa-map-marker"></i>',
    className: 'myDivIcon'
});

// easy button

L.easyButton( '<i class="fas fa-info"></i>', function(){
    $("#myModal").modal("show")
  }).addTo(map);

L.easyButton( '<i class="fas fa-sun"></i>', function(){
$("#myModalWeather").modal("show")
}).addTo(map);


$(function(){

    // Onload drop down creation // first item to load
    $.ajax({
        url: "libs/php/getCountryNames.php",
        type: 'POST',
        dataType: 'json',
        success: function(result) {  

            if (result.status.name == "ok") {
            let countriesObject = [];
            for(let i = 0; i < result.data.features.length; i++){
            countriesObject.push({
                "name": `${result.data.features[i].properties.name}`, 
                "iso_a2": `${result.data.features[i].properties.iso_a2}`
                });
            };
            countriesObject.sort( function( a, b ) {
                a = a.name.toLowerCase();
                b = b.name.toLowerCase();

                return a < b ? -1 : a > b ? 1 : 0;
            });
            for(let i= countriesObject.length -1; i >= 0; i--){
                $("#countrySelection").prepend(`<option value="${countriesObject[i].iso_a2}">${countriesObject[i].name}</option>`);
                }
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus);
            console.log(errorThrown)
        }
    });

    // get users lat and long from browser
    navigator.geolocation.getCurrentPosition((results)=>{
        // Grab and reassign variable names
        ({ latitude: userLatitude, longitude: userLongitude } = results.coords)
        // get country name from lat long
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
                    let currentISO = countryCode["ISO_3166-1_alpha-2"]
                    countryPainter(currentISO); // creates a polygon around the users country
                    $("#countrySelection").val(currentISO).change();
                }
            
            },
            error: function(jqXHR, textStatus, errorThrown) {
                // your error code
            }
        }); 
    })

    

    // drop down menu border creation
    $("#countrySelection").on("change", ()=>{ 
        countryPainter($('#countrySelection').val()); 
    });



    // retrieve country info and fly to country
    // create marker for capitals
    $("#countrySelection").on("change", ()=> {
        let wiki;
        // get countries lat and from from country code
        $.ajax({
			url: "libs/php/getRestCountry.php",
			type: 'POST',
			dataType: 'json',
			data: {
				country: $('#countrySelection').val(),
			},
			success: function(result) {
                
                let capitalName = result.data[0].capital[0];
                let restCountryData = result.data
                let weather;

				if (result.status.name == "ok") {
                    
                    // remove any markers
                    if(markers){
                        map.removeLayer(markers);
                    }
                    // mark capitals
                    const capitalLatLng = [result.data[0].capitalInfo.latlng[0], result.data[0].capitalInfo.latlng[1]]
                    markers =  L.marker(capitalLatLng, {icon: myIcon}).addTo(map);

                    // creates a marker on users location
                    countryISO = result.data[0].cca2
                    
                    if(countryISO === "GB" || countryISO === "US" || countryISO === "NL"){
                        capitalPopup = L.popup()
                        .setLatLng(capitalLatLng)
                        .setContent(`<p>${result.data[0].capital[0]} is the capital of the ${result.data[0].name.common}!<br/><span style="display: block; text-align: center">${capitalLatLng}</span></p>`)
                        .openOn(map);

                        markers.bindPopup(capitalPopup).openPopup()    
                    } else {
                        capitalPopup = L.popup()
                        .setLatLng(capitalLatLng)
                        .setContent(`<p>${result.data[0].capital[0]} is the capital of ${result.data[0].name.common}!<br/><span style="display: block; text-align: center">${capitalLatLng}</span></p>`)
                        .openOn(map);

                        markers.bindPopup(capitalPopup).openPopup()   
                    }

                    // get countries currency
                    Object.keys(restCountryData[0].currencies).forEach(element=> {
                        currency = element
                    })
                   
                    $("#country").html(`${restCountryData[0].name.common}`)
                    $("#continent").html(`${restCountryData[0].continents[0]}`)
                    $("#population").html(`${restCountryData[0].population}`)
                    $("#languages").html(`${getLanguages(restCountryData[0].languages)}`)
                    $("#currency").html(`${getCurrency(restCountryData[0].currencies)}`)
                    
                    // get weather
                    $.ajax({
                        url: "libs/php/getWeather.php",
                        type: 'POST',
                        dataType: 'json',
                        data: {
                            capital: capitalName
                        },
                        success: function(result) {
                            
                            if (result.status.name == "ok") {
                                weather = result.weather;

                                $("#capital").html(`${weather.name}`)
                                $("#condition").html(`${weather.weather[0].description}`)
                                $("#date").html(`${getDate()}`)
                                $("#temp").html(`${weather.main.temp}&#8451`)
                                $("#feelsLike").html(`${weather.main.feels_like}&#8451`)
                                $("#tempMin").html(`${weather.main.temp_min}&#8451;`)
                                $("#tempMax").html(`${weather.main.temp_max}&#8451;`)
                                $("#pressure").html(`${weather.main.pressure}`)
                                $("#humidity").html(`${weather.main.humidity}&#37;`)
                               
                            }
                        
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            // your error code
                        }
                    });

                    //get Wiki
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
                                wiki = result.wiki;
                                createMarkers(wiki);
                            }
                        
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            // your error code
                        }
                    });

                    $.ajax({
                        url: "libs/php/getExchangeRate.php",
                        type: 'POST',
                        dataType: 'json',
                        data: {
                            capital: capitalName
                        },
                        success: function(result) {
                            
                            if (result.status.name == "ok") {
                                $("#exchange").html(`1 USD = ${result.currency.rates[currency]} ${currency}`)
                            }
                        
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            // your error code
                        }
                    });
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				// your error code
			}
		}); 
        
    });

})

// functions:
// create country borders
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
                countries = result.data
                index = 0;
               
                
                for(let i=0; i < countries.features.length; i++){
                    if(countries.features[i].properties.iso_a2 === countryToFind) {
                        index = i;
                    }
                }

                if(border){
                    map.removeLayer(border)
                }
                
                border = L.geoJSON(countries.features[index], borderStyle).addTo(map);

                map.flyToBounds(border)

                countryBounds = border.getBounds()
                // country bounding box
                countryBounds.north = countryBounds._northEast.lat
                countryBounds.east = countryBounds._northEast.lng
                countryBounds.south = countryBounds._southWest.lat
                countryBounds.west = countryBounds._southWest.lng
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            // your error code
        }
    }); 

}


const getLanguages = (target) => {

    let newLanguages = "";
    let max = Object.keys(target).length;

    Object.keys(target).forEach((element, index) => {

        if(index === 0 ){
            newLanguages += `${target[element]}`
        } else if (index === max - 1 || max === 1){
            newLanguages += ` and ${target[element]}.`
        } else {
            newLanguages += `, ${target[element]}`
        }
    });

    return newLanguages;

};

const getCurrency = (target) =>{
    let currency;
    Object.keys(target).forEach(element => {
        currency = target[element].name
    })
    return currency;
};

const getDate = () => {
    
    let newDate = new Date;
    let options = { weekday: 'long', day: 'numeric', month: 'long' }
    let todaysDate = newDate.toLocaleDateString("en-GB", options).replace(/,/, '')
    return todaysDate;

}

const createMarkers = (wiki) => {
    if(shelterMarkers){
            shelterMarkers.clearLayers();
        }
    for (let i = 0; i < wiki.length; i++) {
        if(countryISO === wiki[i].countryCode){
            
            marker = L.marker([wiki[i].lat, wiki[i].lng], {icon: fontAwesomeIcon}).addTo(shelterMarkers);
            context = L.popup()
            .setLatLng([wiki[i].lat, wiki[i].lng])
            .setContent(`<p><b>${wiki[i].title}</b></p><p>Summary:</p><p>${wiki[i].summary}</p><p><a href="https://${wiki[i].wikipediaUrl}">Read more...<a></p><p></p>`)
            marker.bindPopup(context)
            

        } else {
            continue; 
        }
    }
}




