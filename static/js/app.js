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


//https://github.com/Esri/esri-leaflet-browserify-example
//https://esri.github.io/esri-leaflet/examples/geocoding-control.html

// create map
var map = L.map('map').setView([41.396904, 2.120389], 15);

var marker;

// add basemap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

// add search control
var searchControl = geocoding.geosearch({
	position : 'topleft',
	zoomToResult: 'false',
	collapseAfterResult: 'false',
	expanded: 'true',
	allowMultipleResults: 'false',
	placeholder: 'Busca Adreces',
	title: 'Cercador d\'Adreces'
	}).addTo(map);

var results = L.layerGroup().addTo(map);

  searchControl.on('results', function(data){
  	if (marker) { // check
    map.removeLayer(marker); // remove
	}
    
    results.clearLayers();
    
    for (var i = data.results.length - 1; i >= 0; i--) {
      results.addLayer(L.marker(data.results[i].latlng));
    }
  });

// reverse geocoding
//https://esri.github.io/esri-leaflet/examples/reverse-geocoding.html

var geocodeService = geocoding.geocodeService();



map.on('click', function(e) {
	if (results) { // check
    results.clearLayers();; // remove
	}
	if (marker) { // check
    map.removeLayer(marker); // remove
	}
	geocodeService.reverse().latlng(e.latlng).run(function(error, result) {
	 $('#lat').val(result.latlng.lat);
	 $('#lon').val(result.latlng.lng);
	 $('#address1').val(result.address.Match_addr);
	  marker = L.marker(result.latlng);
	  marker.addTo(map).bindPopup(result.address.Match_addr).openPopup();

	 

  
});
});