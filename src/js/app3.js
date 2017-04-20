//jQuery & Bootstrap 
var $ = require('jquery');
global.jQuery = require('jquery');
window.$ = $;
require('bootstrap');

$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})

// require leaflet & plugins
var L = require('leaflet');
var esri = require('esri-leaflet');
var geocoding = require('esri-leaflet-geocoder');

require('leaflet.locatecontrol');
require('leaflet-easybutton');
require('leaflet.markercluster');

// since leaflet is bundled into the browserify package it won't be able to detect where the images
// solution is to point it to where you host the the leaflet images yourself
//L.Icon.Default.imagePath = 'http://cdn.leafletjs.com/leaflet-0.7.3/images';
L.Icon.Default.imagePath = 'static/img/';


// require awesome markers
require('drmonty-leaflet-awesome-markers');


//*** Initial Configurations *** 
var config = {
	cartoDBusername : "sgrinschpun",
	cartoDBinsertfunction : "insert_emoji_data",
	cartoDBupdatefunction : "update_emoji_data",
	cartoDBtablename : "emoticona",
	cartoDBapikey: "ccf08eda5c1ee54b2f70735a568d5e358c84c54b",
	mapcenter: [41.396904, 2.120389],
	zoom: 15
};

var emoticona = {
	menamora : 1,
	memprenya : 2,
	nomhopuccreure : 3,
	podriemmillorar: 4
};


//***  Define icons  ***/
// consider changing to fa, more icons

//from db
var house = L.AwesomeMarkers.icon({
	prefix: 'fa',
    icon: 'home',
    markerColor: 'blue',
    spin: false
});

var apartment = L.AwesomeMarkers.icon({
	prefix: 'fa',
    icon: 'clone',
    markerColor: 'blue',
    spin: false
});

var building = L.AwesomeMarkers.icon({
	prefix: 'fa',
    icon: 'building-o',
    markerColor: 'blue',
    spin: false
});

var solar = L.AwesomeMarkers.icon({
	prefix: 'fa',
    icon: 'square',
    markerColor: 'blue',
    spin: false
});


var add = L.AwesomeMarkers.icon({
	prefix: 'fa',
	icon: 'asterisk',
    markerColor: 'red',
    spin: false
});


var EmojiIcon = L.Icon.extend({
    options: {
        iconSize:     [30, 30],
        shadowSize:   [0, 0],
        iconAnchor:   [20, 20],
        shadowAnchor: [0, 0],
        popupAnchor:  [-3, -20]
    }
});

var menamora = new EmojiIcon({iconUrl: '../static/img/1f60d.svg'}),
    memprenya = new EmojiIcon({iconUrl: '../static/img/1f621.svg'}),
    nomhopuccreure = new EmojiIcon({iconUrl: '../static/img/1f631.svg'}),
    podriemmillorar = new EmojiIcon({iconUrl: '../static/img/1f914.svg'});




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
var sqlQuery = "SELECT cartodb_id, the_geom, emoji, comment, thumbsup, thumbsdown FROM " + config.cartoDBtablename;


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

var Esri_WorldStreetMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
});

var Esri_WorldStreetMap2 = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
});

Esri_WorldStreetMap.addTo(map);

//CartoDB_Positron.addTo(map);
//OpenStreetMap_DE.addTo(map)
/*L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);*/



//Leaflet.Locate
/*L.Control.MyLocate = L.Control.Locate.extend({
   _drawMarker: function(latlng) {
     // override to customize the marker
 	marker = L.marker(latlng, {icon: add, draggable: true})
			.addTo(map)
			.animateDragging();
   }
/*});*/
/*var lc = new L.Control.MyLocate({
    position: 'topright',
    strings: {
        title: "Geolocalitza'm"
    },
    icon: 'fa fa-location-arrow',
    drawCircle: false,
    showPopup: false
}).addTo(map);
*/

var lc = L.control.locate({
    position: 'topright',
    strings: {
        title: "Geolocalitza'm"
    },
    icon: 'fa fa-location-arrow',
    drawCircle: false,
    showPopup: false,
    //drawMarker: false
}).addTo(map);

//Leaflet easy button
//http://danielmontague.com/projects/easyButton.js/v1/examples/
L.easyButton('fa-times', function(){
    if (marker) { // check
    	 marker.clearLayers();
    	 var marker_latlng ;
	}
}).addTo( map );



//Fetches
var getData = "https://" + config.cartoDBusername + ".cartodb.com/api/v2/sql?format=GeoJSON&q=" + sqlQuery;
var emojis = L.markerClusterGroup();

function getGeoJSON(emoti=1) {
	var getData2 = getData + " WHERE emoji=" + "'" + String(emoti)+ "'";
	$.getJSON(getData2, function (data) {
		var cartoDBData = L.geoJson(data, {

				pointToLayer: function(feature, latlng) {
					if (feature.properties.emoji == '1'){
	        		return new L.marker(latlng, {icon: menamora});
	        		} else if (feature.properties.emoji == '2'){
	        		return new L.marker(latlng, {icon: memprenya})
	        		} else if (feature.properties.emoji == '3'){
	        		return new L.marker(latlng, {icon: nomhopuccreure})
	        		}  else if (feature.properties.emoji == '4'){
	        		return new L.marker(latlng, {icon: podriemmillorar})
	        		}
	    		},
				onEachFeature: function (feature, layer) {
					
					var cartodb_id= feature.properties.cartodb_id;

					// Create an element to hold all your text and markup
					var container = $('<div />');

					// Delegate all event handling for the container itself and its contents to the container
					container.on('click', '.thumbup', function() {
					    
					    updateThumbsup(feature.properties.emoji, cartodb_id, feature.properties.thumbsup +1)

					});

					container.on('click', '.thumbdown', function() {
					 
					    updateThumbsdown(feature.properties.emoji, cartodb_id, feature.properties.thumbsdown +1)
					});

					// Insert whatever you want into the container, using whichever approach you prefer
					container.html('<h5>Comentari:</h5>'+
									'<h6>' + unescape(feature.properties.comment) + '</h6><br><br>'
										+ '<img src="../static/img/1f44d.svg" class="img-responsive hvr-grow thumbup"  width="30" data-switch="ON">' 
										+ unescape(feature.properties.thumbsup) + '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'
										+ '<img src="../static/img/1f44e.svg" class="img-responsive hvr-grow thumbdown" width="30" data-switch="ON">'
										+ unescape(feature.properties.thumbsdown));
					layer.bindPopup(container[0],{ maxWidth : 200, minWidth: 200, autoClose: false, closeOnClick: false});

				}
		})
		
		emojis.addLayer(cartoDBData);
		map.addLayer(emojis);
	});
}


//http://stackoverflow.com/questions/13698975/click-link-inside-leaflet-popup-and-do-javascript

//getGeoJSON();


//*** GeoCoding Control + Reverse geocoding from ESRI ****
//https://github.com/Esri/esri-leaflet-browserify-example
//https://esri.github.io/esri-leaflet/examples/geocoding-control.html

var marker= L.layerGroup().addTo(map);
var marker_latlng;


// add search control
var searchControl = geocoding.geosearch({
	position : 'topleft',
	zoomToResult: true,
	collapseAfterResult: true,
	expanded: false,
	allowMultipleResults: false,
	placeholder: 'Busca Adreces',
	title: 'Cercador d\'Adreces'
	}).addTo(map);

//var results = L.layerGroup().addTo(map);

  searchControl.on('results', function(data){
  	if (marker) { // check
   	marker.clearLayers();// remove
	}
    
    //results.clearLayers();
    marker.addLayer(L.marker(data.results[0].latlng, {icon: add,draggable: true}).animateDragging()  );
    marker_latlng = data.results[0].latlng;
    console.log(marker_latlng);
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
      
	  return this.on('dragend', function (e) {
	    this._icon.style.marginTop = iconMargin + 'px';
	    this._shadow.style.marginLeft = shadowMargin + 'px';
		
		marker_latlng = e.target.getLatLng();
		console.log(marker_latlng);
	   });
    };


map.on('click', function(e) {
/*	if (results) { // check
    	results.clearLayers(); // remove
	}*/
	if (marker) { // check
    	marker.clearLayers();  // remove
	}
	marker.addLayer(L.marker(e.latlng, {icon: add, draggable: true}).animateDragging()  );
	marker_latlng = e.latlng;

});


$('.emoji').click(function (e) {
	e.preventDefault();
	var emo = e.currentTarget.id;
	var id = '#' + e.currentTarget.id;

	if (jQuery.isEmptyObject(marker._layers)) {
		if (emojis) { // check
		 emojis.clearLayers(); // remove
		}
		getGeoJSON(emoticona[e.currentTarget.id]);
		
	}
	else {
		var modal_id = id + '_modal';
		$(modal_id).modal('show');
		var button_id = id + '_a'
		$(button_id).click(function (e) {
			e.preventDefault();
			var comment = $(modal_id + ' textarea').val();
			setData(emoticona[emo],marker_latlng, comment);
			$(modal_id).modal('hide');

		});

	}    
});


//*** Send data to Carto ****
function setData(emoti, marker_latlng, comment) {
//Construct the geometry
var the_geom = {"type":"Point","coordinates":[marker_latlng.lng,marker_latlng.lat]}

//Construct the SQL query to insert data
		sql = "SELECT " + config.cartoDBinsertfunction + "(";
		sql += "'" + JSON.stringify(the_geom) + "'";
		sql += "," + "'" + emoti + "'";
		sql += "," + "'" + escape(comment)+ "'";
		sql += "," + "0";
		sql += "," + "0";
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
				if (emojis) { // check
					emojis.clearLayers(); // remove
				}
/*				if (results) { // check
					results.clearLayers(); // remove
				}*/
				if (marker) { // check
					marker.clearLayers();// remove
				}

				getGeoJSON(emoti);
			},
			error: function (responseData, textStatus, errorThrown) {

				console.log("Problem saving the data");
			}
		});

}


//https://carto.com/blog/faster-data-updates-with-cartodb


// https://{account}.cartodb.com/api/v2/sql?q=UPDATE test_table SET column_name = 'my new string value' WHERE cartodb_id = 1 &api_key={Your API key}
// 'https://'+'config.cartoDBusername + '.cartodb.com/api/v2/sql?q=UPDATE'+ cartoDBtablename +  'SET thumbsup = _thumbsup WHERE cartodb_id = _cartodb_id &api_key=' + cartoDBapikey

//*** Send data to Carto ****
function updateThumbsup(emoti, _cartodb_id, _thumbsup) {
var update_url = 'https://'+ config.cartoDBusername + '.cartodb.com/api/v2/sql?q=UPDATE '+ config.cartoDBtablename +  ' SET thumbsup =' + _thumbsup +' WHERE cartodb_id ='+ _cartodb_id+'&api_key=' + config.cartoDBapikey
//Sending the data
		$.ajax({
			type: 'POST',
			url: update_url,
			crossDomain: true,
			dataType: 'json',
			success: function (responseData, textStatus, jqXHR) {
				console.log("Data saved");
					// refresh map
				//console.log('https://' + config.cartoDBusername + '.cartodb.com/api/v2/'+ sql);
				if (emojis) { // check
					emojis.clearLayers(); // remove
				}
/*				if (results) { // check
					results.clearLayers(); // remove
				}*/
				if (marker) { // check
					marker.clearLayers();// remove
				}

				getGeoJSON(emoti);
			},
			error: function (responseData, textStatus, errorThrown) {

				console.log("Problem saving the data");
			}
		});

}

function updateThumbsdown(emoti, _cartodb_id, _thumbsdown) {
var update_url = 'https://'+ config.cartoDBusername + '.cartodb.com/api/v2/sql?q=UPDATE '+ config.cartoDBtablename +  ' SET thumbsdown =' + _thumbsdown +' WHERE cartodb_id ='+ _cartodb_id+'&api_key=' + config.cartoDBapikey
//Sending the data
		$.ajax({
			type: 'POST',
			url: update_url,
			crossDomain: true,
			dataType: 'json',
			success: function (responseData, textStatus, jqXHR) {
				console.log("Data saved");
					// refresh map
				//console.log('https://' + config.cartoDBusername + '.cartodb.com/api/v2/'+ sql);
				if (emojis) { // check
					emojis.clearLayers(); // remove
				}
/*				if (results) { // check
					results.clearLayers(); // remove
				}*/
				if (marker) { // check
					marker.clearLayers();// remove
				}

				getGeoJSON(emoti);
			},
			error: function (responseData, textStatus, errorThrown) {

				console.log("Problem saving the data");
			}
		});

}