

let defaultView = [51.505, -0.09];
let markers;
let border;
let capitalPopup;
let cityMarkers;
let currency;


var myIcon = L.icon({
    iconUrl: './images/castle.png',
    iconSize: [80, 80],
    popupAnchor: [0, -22],
});


var map = L.map('map').setView(defaultView, 2);
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
})
.addTo(map);


$(function(){

    $.ajax({
        url: "./php/getDataFromFile.php",
        type: 'POST',
        dataType: 'json',
        success: function(result) {  

            if (result.status.name == "ok") {

            $("#countrySelection").prepend("<option hidden>Select Country</option>")
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
            url: "./php/getOpenCageByLatLng.php",
            type: 'POST',
            dataType: 'json',
            data: {
                lat: userLatitude,
                lng: userLongitude
            },
            success: function(result) {

                if (result.status.name == "ok") {
                    let countryCode = result.data[0].properties.components;
                    let countryISO = countryCode["ISO_3166-1_alpha-2"]
                    countryPainter(countryISO); // creates a polygon around the users country
                    

                    if(countryISO === "GB" || countryISO === "US" || countryISO === "NL"){ // check if "the" needs to be added for syntactic sugar
                        markers = L.marker([userLatitude, userLongitude]).addTo(map);
                        test = L.popup()
                        .setLatLng([userLatitude, userLongitude])
                        .setContent(`<p>Hello there!<br />It appears that you are in the ${countryCode["country"]}.</p>`)
                        .openOn(map);

                        markers.bindPopup(test).openPopup()
                    } else {
                        markers = L.marker([userLatitude, userLongitude]).addTo(map);
                        test = L.popup()
                        .setLatLng([userLatitude, userLongitude])
                        .setContent(`<p>Hello there!<br />It appears that you are in ${countryCode["country"]}.</p>`)
                        .openOn(map);

                        markers.bindPopup(test).openPopup()
                    }
                    
                }
            
            },
            error: function(jqXHR, textStatus, errorThrown) {
                // your error code
            }
        }); 
    })

    

    // drop down menu border creation
    $("#countrySelection").on("change", ()=>{ 

        countryPainter($('#countrySelection').val()); //grabs the country iso and creates border   

    });


















    // retrieve country info and fly to country
    // create marker for capitals

    $("#countrySelection").on("change", ()=> {
        // get countries lat and from from country code
        $.ajax({
			url: "./php/getDisplayInfo.php",
			type: 'POST',
			dataType: 'json',
			data: {
				country: $('#countrySelection').val(),
			},
			success: function(result) {

                let capitalName = result.data[0].capital[0];
                let firstCallResults = result.data

				if (result.status.name == "ok") {
                    
                    // remove any markers
                    if(markers){
                        map.removeLayer(markers);
                    }
                    // mark capitals
                    const capitalLatLng = [result.data[0].capitalInfo.latlng[0], result.data[0].capitalInfo.latlng[1]]
                    markers =  L.marker(capitalLatLng, {icon: myIcon}).addTo(map);

                    // creates a marker on users location
                    let countryISO = result.data[0].cca2
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

                    Object.keys(firstCallResults[0].currencies).forEach(element=> {
                        currency = element
                    })

                    console.log(currency)
                   


                    $.ajax({
                        url: "./php/getModalInfo.php",
                        type: 'POST',
                        dataType: 'json',
                        data: {
                            capital: capitalName
                        },
                        success: function(result) {
                            
                            if (result.status.name == "ok") {
                                let wiki = result.wiki;
                                let weather = result.weather;

                                //   display weather data in modal //

                                // country info
                                $("#country").html(`${firstCallResults[0].name.common}`)
                                $("#continent").html(`${firstCallResults[0].continents[0]}`)
                                $("#population").html(`${firstCallResults[0].population}`)
                                $("#languages").html(`${getLanguages(firstCallResults[0].languages)}`)
                                $("#currency").html(`${getCurrency(firstCallResults[0].currencies)}`)
                                $("#exchange").html(`1 USD = ${result.currency.rates[currency]} ${currency}`)
                               

                                // // weather
                                $("#capital").html(`${weather.name}`)
                                $("#condition").html(`${weather.weather[0].description}`)
                                $("#date").html(`${getDate()}`)
                                $("#temp").html(`${weather.main.temp}&#8451`)
                                $("#feelsLike").html(`${weather.main.feels_like}&#8451`)
                                $("#tempMin").html(`${weather.main.temp_min}&#8451;`)
                                $("#tempMax").html(`${weather.main.temp_max}&#8451;`)
                                $("#pressure").html(`${weather.main.pressure}`)
                                $("#humidity").html(`${weather.main.humidity}&#37;`)

                                // wiki
                                $("#wikiTitle").html(`${weather.name} Wiki`)
                                $("#wikiOneTitle").html(`${wiki[0].title}`)
                                $("#wikiOneLink").html(`<a href="https://${wiki[0].wikipediaUrl}">${wiki[0].wikipediaUrl}</a>`)
                                $("#wikiTwoTitle").html(`${wiki[1].title}`)
                                $("#wikiTwoLink").html(`<a href="https://${wiki[1].wikipediaUrl}">${wiki[1].wikipediaUrl}</a>`)
                                $("#wikiThreeTitle").html(`${wiki[2].title}`)
                                $("#wikiThreeLink").html(`<a href="https://${wiki[2].wikipediaUrl}">${wiki[2].wikipediaUrl}</a>`)
                                
                                // show data in modal
                                $(".modal-body.text-white").show();
                                $("#myModal").modal("show")
                            }
                        
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            // your error code
                        }
                    });

                    // not working

                    // result.data[1].forEach(element => {
                    //     cityMarkers = L.marker([element.lat, element.lng]).addTo(map);
                    //     cityMarkers.bindPopup(`<p>${element.name}</p>`);
                    //     console.log(element.name)
                    // })
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				// your error code
			}
		}); 
    });

    















}) // end of function



// global functions:

// create country borders
const countryPainter = (countryToFind) => {

    $.ajax({
        url: "./php/getDataFromFile.php",
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
                
                border = L.geoJSON(countries.features[index], {
                    style:  {
                        "color": "red",
                        "weight": 5,
                        "opacity": 0.20
                    }
                }).addTo(map);

                map.flyToBounds(border, {paddingTopLeft: [0,50]})
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




