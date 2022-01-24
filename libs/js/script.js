// create map

var map = L.map('map').setView([51.505, -0.09], 2);
        var  Esri_WorldStreetMap = 
            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
            })
            .addTo(map);

let geojsonFeature;
let polygon;
const myStyle = {
    "color": "#f00",
    "weight": 5,
    "opacity": 0.65
};

$(function(){
    // Onload drop down creation
    $.ajax({
        url: "libs/php/getCountryNames.php",
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

    // get country polygon

    $("#countrySelection").on("change", ()=>{
        $.ajax({
			url: "libs/php/getCountrypolygon.php",
			type: 'POST',
			dataType: 'json',
			data: {
				country: $('#countrySelection').val()
			},
			success: function(result) {
                console.log(result)

				if (result.status.name == "ok") {
                    countries = result.data
                    index = 0;
                    if($(".leaflet-interactive")){
                        $(".leaflet-interactive").remove();
                    }
                    for(let i=0; i < countries.features.length; i++){
                        if(countries.features[i].properties.iso_a2 === $('#countrySelection').val()) {
                            index = i;
                        }
                    }
                    
                    L.geoJSON(countries.features[index], {
                        style:  {
                            "color": "#ff7800",
                            "weight": 5,
                            "opacity": 0.65
                        }
                    }).addTo(map);
				}
			
			},
			error: function(jqXHR, textStatus, errorThrown) {
				// your error code
			}
		}); 
        
    });

    $("#countrySelection").on("change", ()=> {
        $.ajax({
			url: "libs/php/getOpenCageInfo.php",
			type: 'POST',
			dataType: 'json',
			data: {
				country: $('#countrySelection').val(),
			},
			success: function(result) {

				console.log(JSON.stringify(result));

				if (result.status.name == "ok") {

					

				}
			
			},
			error: function(jqXHR, textStatus, errorThrown) {
				// your error code
			}
		}); 
    });

}) // end of document function


// AJAX template
// $.ajax({
//     url: "libs/php/getCountryInfo.php",
//     type: 'POST',
//     dataType: 'json',
//     data: {
//         country: $('#selCountry').val(),
//         lang: $('#selLanguage').val()
//     },
//     success: function(result) {

//         console.log(JSON.stringify(result));

//         if (result.status.name == "ok") {

//             $('#txtContinent').html(result['data'][0]['continent']);
//             $('#txtCapital').html(result['data'][0]['capital']);
//             $('#txtLanguages').html(result['data'][0]['languages']);
//             $('#txtPopulation').html(result['data'][0]['population']);
//             $('#txtArea').html(result['data'][0]['areaInSqKm']);

//         }
    
//     },
//     error: function(jqXHR, textStatus, errorThrown) {
//         // your error code
//     }
// }); 
