
// create map

var map = L.map('map').setView([51.505, -0.09], 2);
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
})
.addTo(map);

let markers;
let border;
let test;


$(function(){

    // Onload drop down creation // first item to load

    $.ajax({
        url: "libs/php/getDataFromFile.php",
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
        // console.log(userLatitude, userLongitude)

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

                // console.log(JSON.stringify(result));
                // console.log(result)

                if (result.status.name == "ok") {
                    let countryCode = result.data[0].properties.components;
                    countryPainter(countryCode["ISO_3166-1_alpha-2"]); // creates a polygon around the users country
                    // map.flyTo([JSON.stringify(userLatitude), JSON.stringify(userLongitude)], 8, true) //fly to users location
                    markers = L.marker([userLatitude, userLongitude]).addTo(map);
                    test = L.popup()
                        .setLatLng([userLatitude, userLongitude])
                        .setContent(`<p>Hello there!<br />It appears that you are in ${countryCode["country"]}.</p>`)
                        .openOn(map);

                    markers.bindPopup(test).openPopup()
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
			url: "libs/php/getRestCountries.php",
			type: 'POST',
			dataType: 'json',
			data: {
				country: $('#countrySelection').val(),
			},
			success: function(result) {

				console.log((result));
                

				if (result.status.name == "ok") {
                    // remove any markers
                    if(markers){
                        map.removeLayer(markers);
                    }
                    // mark capitals
                    const countryCapital = [result.data[0].capitalInfo.latlng[0], result.data[0].capitalInfo.latlng[1]]
                    markers = L.marker(countryCapital).addTo(map);
                      // creates a marker on users location

                    test = L.popup()
                    .setLatLng(countryCapital)
                    .setContent(`<p>${result.data[0].capital[0]} is the capital of ${result.data[0].name.common}!</p>`)
                    .openOn(map);

                    markers.bindPopup(test).openPopup()
                    

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
        url: "libs/php/getDataFromFile.php",
        type: 'POST',
        dataType: 'json',
        data: {
            country: countryToFind
        },
        success: function(result) {
            // console.log(result)
    
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

                map.flyToBounds(border)
            }
        
        },
        error: function(jqXHR, textStatus, errorThrown) {
            // your error code
        }
    }); 

}

