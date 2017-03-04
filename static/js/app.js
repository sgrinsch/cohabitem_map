//***  Require & Imports for bundle *** 

//jQuery & Bootstrap 
var $ = require('jquery');
global.jQuery = require('jquery');
window.$ = $;
require('bootstrap');

// require leaflet
var L = require('leaflet');
var esri = require('esri-leaflet');
var geocoding = require('esri-leaflet-geocoder');

// since leaflet is bundled into the browserify package it won't be able to detect where the images
// solution is to point it to where you host the the leaflet images yourself
//L.Icon.Default.imagePath = 'http://cdn.leafletjs.com/leaflet-0.7.3/images';
L.Icon.Default.imagePath = 'static/img/';


// require awesome markers
require('drmonty-leaflet-awesome-markers');


// Allow tabbed navigation bootstrap
$('#myTabs a').click(function (e) {
  e.preventDefault()
  $(this).tab('show')
})



//*** Initial Configurations *** 
var config = {
	cartoDBusername : "sgrinschpun",
	cartoDBinsertfunction : "insert_crowd_mapping_data",
	cartoDBtablename : "mappeig",
	mapcenter: [41.396904, 2.120389],
	zoom: 15,
};



//***  Define icons  ***/
// consider changing to fa, more icons

//from db
var house = L.AwesomeMarkers.icon({
    icon: 'home',
    markerColor: 'blue',
    spin: true
});

var apartment = L.AwesomeMarkers.icon({
    icon: 'th-large',
    markerColor: 'blue',
    spin: true
});

var building = L.AwesomeMarkers.icon({
    icon: 'th',
    markerColor: 'blue',
    spin: true
});

var solar = L.AwesomeMarkers.icon({
    icon: 'align-justify',
    markerColor: 'blue',
    spin: true
});


var add = L.AwesomeMarkers.icon({
    markerColor: 'red',
    spin: true
});

//*** Function for animateddragging ***
L.Marker.prototype.animateDragging = function () {
      
      var iconMargin, shadowMargin;
      
      this.on('dragstart', function () {
        if (!iconMargin) {
          iconMargin = parseInt(L.DomUtil.getStyle(this._icon, 'marginTop'));
          shadowMargin = parseInt(L.DomUtil.getStyle(this._shadow, 'marginLeft'));
        }
      
        this._icon.style.marginTop = (iconMargin - 15)  + 'px';
        this._shadow.style.marginLeft = (shadowMargin + 8) + 'px';
      });
      
      return this.on('dragend', function () {
        this._icon.style.marginTop = iconMargin + 'px';
        this._shadow.style.marginLeft = shadowMargin + 'px';
      });
    };



//*** Draw map with data from Carto *** 

// Add Data from CartoDB using the SQL API
// Declare Variables
// Create Global Variable to hold CartoDB points
var cartoDBData = null;

// Write SQL Selection Query to be Used on CartoDB Table
var sqlQuery = "SELECT the_geom, description, name FROM " + config.cartoDBtablename;

// Create Leaflet map object
var map = L.map('map', { center: config.mapcenter, zoom: config.zoom});

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

CartoDB_Positron.addTo(map);
//OpenStreetMap_DE.addTo(map)
/*L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);*/

//Fetches
var getData = "https://" + config.cartoDBusername + ".cartodb.com/api/v2/sql?format=GeoJSON&q=" + sqlQuery;

function getGeoJSON() {
	$.getJSON(getData, function (data) {

		cartoDBData = L.geoJson(data, {
			pointToLayer: function(feature, latlng) {
        		return new L.marker(latlng, {icon: house});
    		},
			onEachFeature: function (feature, layer) {
				layer.bindPopup('' + unescape(feature.properties.description) + '<br>Submitted by ' + unescape(feature.properties.name) + '');
			}
		}).addTo(map);
	});
}

getGeoJSON();

//*** GeoCoding Control + Reverse geocoding from ESRI ****
//https://github.com/Esri/esri-leaflet-browserify-example
//https://esri.github.io/esri-leaflet/examples/geocoding-control.html

var marker;

// add basemap


// add search control
var searchControl = geocoding.geosearch({
	position : 'topleft',
	zoomToResult: true,
	collapseAfterResult: false,
	expanded: true,
	allowMultipleResults: false,
	placeholder: 'Busca Adreces',
	title: 'Cercador d\'Adreces'
	}).addTo(map);

var results = L.layerGroup().addTo(map);

  searchControl.on('results', function(data){
  	if (marker) { // check
    map.removeLayer(marker); // remove
	}
    
    results.clearLayers();
    results.addLayer(L.marker(data.results[0].latlng, {icon: add,draggable: true}).animateDragging()  );
    //console.log(data.results[0]);
    $('#lat').val(data.results[0].latlng.lat);
	$('#lon').val(data.results[0].latlng.lng);
    $('#Address').val(data.results[0].properties.StAddr);
    $('#Postal').val(data.results[0].properties.Postal);
	$('#City').val(data.results[0].properties.City);
	$('#Region').val(data.results[0].properties.Region);
/*    for (var i = data.results.length - 1; i >= 0; i--) {
      results.addLayer(L.marker(data.results[i].latlng));
    }*/
  });

// reverse geocoding
//https://esri.github.io/esri-leaflet/examples/reverse-geocoding.html

var geocodeService = geocoding.geocodeService();

//*** Function for animateddragging ***
L.Marker.prototype.animateDragging = function () {
      
      var iconMargin, shadowMargin;
      
      this.on('dragstart', function () {
        if (!iconMargin) {
          iconMargin = parseInt(L.DomUtil.getStyle(this._icon, 'marginTop'));
          shadowMargin = parseInt(L.DomUtil.getStyle(this._shadow, 'marginLeft'));
        }
      
        this._icon.style.marginTop = (iconMargin - 15)  + 'px';
        this._shadow.style.marginLeft = (shadowMargin + 8) + 'px';
      });
      
      return this.on('dragend', function (e) {
        this._icon.style.marginTop = iconMargin + 'px';
        this._shadow.style.marginLeft = shadowMargin + 'px';
        geocodeService.reverse().latlng(e.target.getLatLng()).run(function(error, result) {
			 $('#lat').val(result.latlng.lat);
			 $('#lon').val(result.latlng.lng);
			 $('#Address').val(result.address.Address);
			 $('#Postal').val(result.address.Postal);
			 $('#City').val(result.address.City);
			 $('#Region').val(result.address.Region);
			map.removeLayer(marker);
		 	marker = L.marker(result.latlng, {icon: add, draggable: true})
	  			.addTo(map)
	  			.bindPopup(result.address.Match_addr)
	  			.openPopup()
	  			.animateDragging();
	});



      });
    };


map.on('click', function(e) {
	if (results) { // check
    	results.clearLayers(); // remove
	}
	if (marker) { // check
    	map.removeLayer(marker); // remove
	}
	geocodeService.reverse().latlng(e.latlng).run(function(error, result) {
		//console.log (result);
		 $('#lat').val(result.latlng.lat);
		 $('#lon').val(result.latlng.lng);
		 $('#Address').val(result.address.Address);
		 $('#Postal').val(result.address.Postal);
		 $('#City').val(result.address.City);
		 $('#Region').val(result.address.Region);
		 marker = L.marker(result.latlng, {icon: add, draggable: true})
		  			.addTo(map)
		  			.bindPopup(result.address.Match_addr)
		  			.openPopup()
		  			.animateDragging();
    });

});


//*** Send data to Carto ****
function setData() {
//Construct the geometry
var the_geom = {"type":"Point","coordinates":[$('#lon').val(),$('#lat').val()]}

//Construct the SQL query to insert data
		sql = "SELECT " + config.cartoDBinsertfunction + "(";
		sql += "'" + JSON.stringify(the_geom) + "'";
		sql += "," + "'" + escape($('#Address').val())+ "'";
		sql += "," + "'" + escape($('#Address').val())+ "'";
		sql += ");";

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
			},
			error: function (responseData, textStatus, errorThrown) {

				console.log("Problem saving the data");
			}
		});
// refresh map
//console.log('https://' + config.cartoDBusername + '.cartodb.com/api/v2/'+ sql);
cartoDBData.clearLayers();
results.clearLayers();
map.removeLayer(marker);
getGeoJSON();
}

$('#desa').click(function (e) {
	e.preventDefault();
	setData();
});

//http://stackoverflow.com/questions/1531093/how-do-i-get-the-current-date-in-javascript




