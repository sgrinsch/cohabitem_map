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

// since leaflet is bundled into the browserify package it won't be able to detect where the images
// solution is to point it to where you host the the leaflet images yourself
//L.Icon.Default.imagePath = 'http://cdn.leafletjs.com/leaflet-0.7.3/images';
L.Icon.Default.imagePath = 'static/img/';


// require awesome markers
require('drmonty-leaflet-awesome-markers');


//*** Initial Configurations *** 
var config = {
	cartoDBusername : "sgrinschpun",
	cartoDBinsertfunction : "insert_crowd_mapping_data",
	cartoDBinsertfunction2 : "insert_crowd_mapping_data2",
	cartoDBtablename : "mappeig_2",
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
	icon: 'asterisk',
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
var cartoDBData2 = null;

// Write SQL Selection Query to be Used on CartoDB Table
var sqlQuery = "SELECT the_geom, address, address2, catastral, city, comment, email, name, postal, region, type FROM " + config.cartoDBtablename;
var sqlQuery2 = "SELECT the_geom, comment, email, name, title FROM " + config.cartoDBtablename2;

// Create Leaflet map object
var map = L.map('map', { center: config.mapcenter, zoom: config.zoom});
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

var Esri_WorldStreetMap = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
});

var Esri_WorldStreetMap2 = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
});

Esri_WorldStreetMap.addTo(map);
Esri_WorldStreetMap2 .addTo(map2);

//CartoDB_Positron.addTo(map);
//OpenStreetMap_DE.addTo(map)
/*L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);*/

//Fetches
var getData = "https://" + config.cartoDBusername + ".cartodb.com/api/v2/sql?format=GeoJSON&q=" + sqlQuery;
var getData2 = "https://" + config.cartoDBusername + ".cartodb.com/api/v2/sql?format=GeoJSON&q=" + sqlQuery2;

function getGeoJSON() {
	$.getJSON(getData, function (data) {
		cartoDBData = L.geoJson(data, {
			pointToLayer: function(feature, latlng) {
				if (feature.properties.type == 'Pis'){
        		return new L.marker(latlng, {icon: apartment});
        		} else if (feature.properties.type == 'Casa'){
        		return new L.marker(latlng, {icon: house})
        		} else if (feature.properties.type == 'Edifici'){
        		return new L.marker(latlng, {icon: building})
        		}  else if (feature.properties.type == 'Solar'){
        		return new L.marker(latlng, {icon: solar})
        		}
    		},
			onEachFeature: function (feature, layer) {
				layer.bindPopup('<strong>' + feature.properties.type + '</strong>  a  ' + unescape(feature.properties.address) 
					+ '<br><br>Afegit per  ' + unescape(feature.properties.name) + '');

			}
		}).addTo(map);
	});
}

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


getGeoJSON();
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

//*** GeoCoding Control + Reverse geocoding from ESRI ****
//https://github.com/Esri/esri-leaflet-browserify-example
//https://esri.github.io/esri-leaflet/examples/geocoding-control.html

var marker;



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
		sql += "," + "'" + escape($('#address2').val())+ "'";
		sql += "," + "'" + escape($('#catastral').val())+ "'";
		sql += "," + "'" + escape($('#City').val())+ "'";
		sql += "," + "'" + escape($('#comment').val())+ "'";
		sql += "," + "'" + escape($('#email').val())+ "'";
		sql += "," + "'" + escape($('#name').val())+ "'";
		sql += "," + "'" + escape($('#Postal').val())+ "'";
		sql += "," + "'" + escape($('#Region').val())+ "'";
		sql += "," + "'" + escape($('#type').val())+ "'";
		sql += ");";

		//console.log(sql);

//Sending the data
		$.ajax({
			type: 'POST',
			url: 'https://' + config.cartoDBusername + '.cartodb.com/api/v2/sql',
			crossDomain: true,
			data: {"q": sql},
			dataType: 'json',
			success: function (responseData, textStatus, jqXHR) {
				console.log("Data saved");
					// refresh map
				//console.log('https://' + config.cartoDBusername + '.cartodb.com/api/v2/'+ sql);
				if (cartoDBData) { // check
					cartoDBData.clearLayers(); // remove
				}
				if (results) { // check
					results.clearLayers(); // remove
				}
				if (marker) { // check
					map.removeLayer(marker);// remove
				}

				getGeoJSON();
			},
			error: function (responseData, textStatus, errorThrown) {

				console.log("Problem saving the data");
			}
		});

}

$('#desa').click(function (e) {
	e.preventDefault();
	setData();
});

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
						getGeoJSON();
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