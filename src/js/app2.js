//jQuery & Bootstrap 
var $ = require('jquery');
global.jQuery = require('jquery');
window.$ = $;
require('bootstrap');
require('bootstrap-table');

// require leaflet & plugins
var L = require('leaflet');
var esri = require('esri-leaflet');
var geocoding = require('esri-leaflet-geocoder');
require('leaflet-draw');
require('leaflet.locatecontrol');

// since leaflet is bundled into the browserify package it won't be able to detect where the images
// solution is to point it to where you host the the leaflet images yourself
//L.Icon.Default.imagePath = 'http://cdn.leafletjs.com/leaflet-0.7.3/images';
L.Icon.Default.imagePath = 'static/img/';


// require awesome markers
require('drmonty-leaflet-awesome-markers');


//*** Initial Configurations *** 
var config = {
	cartoDBusername : "sgrinschpun",
	cartoDBinsertfunction2 : "insert_crowd_mapping_data2",
	cartoDBtablename2 : "mappeig_dibuix",
	mapcenter: [41.396904, 2.120389],
	zoom: 15,
	drawOptions: {
				draw : {
					polygon : true,
					polyline : true,
					rectangle : true,
					/*Circles aren't supported by the GeoJSON spec, so won't get sent to the database properly. 
					*http://stackoverflow.com/a/16944309/4047679
					*/
					circle : false,
					marker: true
				},
				edit : false,
				remove: false
	}
};



//*** Draw map with data from Carto *** 

// Add Data from CartoDB using the SQL API
// Declare Variables
// Create Global Variable to hold CartoDB points

var cartoDBData2 = null;

// Write SQL Selection Query to be Used on CartoDB Table

var sqlQuery2 = "SELECT the_geom, comment, email, name, title FROM " + config.cartoDBtablename2;

// Create Leaflet map object

var map2 = L.map('map2', { center: config.mapcenter, zoom: config.zoom });

//var map = L.map('map').setView([41.396904, 2.120389], 15);

// Add Tile Layer basemap
// Find your own at https://leaflet-extras.github.io/leaflet-providers/preview/
var CartoDB_Positron = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://cartodb.com/attributions">CartoDB</a>',
	subdomains: 'abcd',
	maxZoom: 19
});

var OpenStreetMap_DE = L.tileLayer('https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png', {
	maxZoom: 18,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

var Esri_WorldStreetMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
});

var Esri_WorldStreetMap2 = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
});


Esri_WorldStreetMap2 .addTo(map2);

//CartoDB_Positron.addTo(map);
//OpenStreetMap_DE.addTo(map)
/*L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);*/

  //Leaflet.Locate
var lc = L.control.locate({
    position: 'topright',
    strings: {
        title: "Geolocalitza'm"
    },
    icon: 'fa fa-location-arrow'
}).addTo(map2);

//Fetches

var getData2 = "https://" + config.cartoDBusername + ".cartodb.com/api/v2/sql?format=GeoJSON&q=" + sqlQuery2;


function getGeoJSON2() {
	$.getJSON(getData2, function (data) {
		cartoDBData2 = L.geoJson(data, {
			onEachFeature: function (feature, layer) {
				layer.bindPopup('<strong>' + feature.properties.title + '</strong> '
					+ '<br><br>Afegit per  ' + unescape(feature.properties.name) + '<br><br>'+unescape(feature.properties.comment) );

			}
		}).addTo(map2);
	});
}


getGeoJSON2();


/// leaflet draw

 // FeatureGroup is to store editable layers
     var drawnItems = new L.FeatureGroup();
     //map2.addLayer(drawnItems);
     var drawControl = new L.Control.Draw(config.drawOptions);
     map2.addControl(drawControl);

	map2.on('draw:created', function (e) {
		var layer = e.layer;
		map2.addLayer(drawnItems);
		drawnItems.addLayer(layer);
		console.log("drawn");
		//dialog.dialog("open");
	});

//*** Send data to Carto ****

function setData2() {
			drawnItems.eachLayer(function (layer) {
			//Convert the drawing to a GeoJSON to pass to the CartoDB sql database
				var drawing = "'" + JSON.stringify(layer.toGeoJSON().geometry) + "'",
				  //Construct the SQL query to insert data from the three parameters: the drawing, the input username, and the input description of the drawn shape
					sql = "SELECT " + config.cartoDBinsertfunction2 + "(";
					sql += drawing;
					sql += "," + "'" + escape($('#comment2').val())+ "'";
					sql += "," + "'" + escape($('#email2').val())+ "'";
					sql += "," + "'" + escape($('#name2').val())+ "'";
					sql += "," + "'" + escape($('#title2').val())+ "'";
					sql += ");";
				console.log(drawing);
				console.log(sql);
				//Sending the data
				$.ajax({
					type: 'POST',
					url: 'https://' + config.cartoDBusername + '.cartodb.com/api/v2/sql',
					crossDomain: true,
					data: {"q": sql},
					dataType: 'json',
					success: function (responseData, textStatus, jqXHR) {
						console.log("Data saved");
						getGeoJSON2();
					},
					error: function (responseData, textStatus, errorThrown) {
						console.log("Problem saving the data");
					}
				});
				/* 
				* Transfer submitted drawing to the CartoDB layer, this results in the user's data appearing on the map without
				* requerying the database (see the refreshLayer() function for an alternate way of doing this) 
				*/
/*				var newData = layer.toGeoJSON();
				newData.properties.description = description.value;
				newData.properties.name = username.value;
				cartoDBData.addData(newData);*/

			});
			
}

$('#desa2').click(function (e) {
	e.preventDefault();
	setData2();
});

//////////bootstrap-table