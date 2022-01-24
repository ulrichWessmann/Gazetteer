// create map

var map = L.map('map').setView([51.505, -0.09], 13);
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
                console.log(result.data)

				console.log(JSON.stringify(result));

				if (result.status.name == "ok") {

					console.log(result.data)

				}
			
			},
			error: function(jqXHR, textStatus, errorThrown) {
				// your error code
			}
		}); 
        
    });

})
