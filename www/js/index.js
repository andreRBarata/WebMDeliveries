/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var HOST = 'http://localhost';

var app = (function () {

	function formData(form) {
		var serielized = $(form).serializeArray();
		var data = {};
		var i;

		for (i in serielized) {
			var ele = serielized[i];

			data[ele.name] = ele.value;
		}

		return data;
	}

	var view = {
		alert: function (message, type) {
			return $('<div data-role="popup" class="alert alert-' +
					(type || 'danger') + '">' +
						'<a href="#" class="close" data-dismiss="alert">&times;</a>' +
						message +
					'</div>'
				).alert();
		}
	};

	var api = {
		login: function (form) {
			return $.ajax({
				url: HOST + '/api/login/',
				type: 'post',
				data: formData(form),
				headers: {
					'X-CSRFToken': Cookies.get('csrftoken')
				},
				dataType: 'json'
			}).done(function(res) {
				localStorage.setItem('token', res.token);

				$.mobile.navigate('#page-main');
			}).fail(function () {
				$('#login-page .messages').append(
					view.alert('Username or password incorrect')
				);
			});
		},
		logout: function () {
			localStorage.removeItem('token');

			$.mobile.navigate('#login-page');
		}
	};

	var map = {
		makeBasicMap: function () {
			mapElement = L.map("map-var", {
				zoomControl: false,
				attributionControl: false
			}).fitWorld();

			L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				useCache: true
			}).addTo(mapElement);

			$("#leaflet-copyright").html("Leaflet | Map Tiles &copy; <a href='http://openstreetmap.org'>OpenStreetMap</a> contributors");

			return mapElement;
		},
		getCurrentlocation: function () {
			var myLatLon;
			var myPos;

			navigator.geolocation.getCurrentPosition(
				function (pos) {
					// myLatLon = L.latLng(pos.coords.latitude, pos.coords.longitude);
					myPos = new myGeoPosition(pos);
					localStorage.lastKnownCurrentPosition = JSON.stringify(myPos);

					setMapToCurrentLocation();
					updatePosition();
				},
				function (err) {
				},
				{
					enableHighAccuracy: true
					// maximumAge: 60000,
					// timeout: 5000
				}
			);
		},
	};

	return {
		// Application Constructor
		initialize: function() {
			document.addEventListener(
				'deviceready',
				this.onDeviceReady.bind(this),
				false
			);

			$('form').attr('action', 'javascript: ');
		},

		// deviceready Event Handler
		//
		// Bind any cordova events here. Common events are:
		// 'pause', 'resume', etc.
		onDeviceReady: function() {
			var mapElement;

			if (!localStorage.getItem('token')) {
				$.mobile.navigate('#login-page');
			}
			else if ($.mobile.activePage.attr('id') === 'login-page') {
				$.mobile.navigate('#main-page');
			}

			this.receivedEvent('deviceready');

			$(document).on("pagecreate", "#map-page",
				function (event) {
			        console.log("In pagecreate. Target is " + event.target.id + ".");

			        // $("#goto-currentlocation").on("touchstart", function () {
			        //     getCurrentlocation();
			        // });

			        $("#map-page").enhanceWithin();

			        mapElement = map.makeBasicMap();
			        // getCurrentlocation();
			    }
			);

		    $(document).on("pageshow",
				function (event) {
			        console.log("In pageshow. Target is " + event.target.id + ".");
			        if (!localStorage.token) {
			            $.mobile.navigate("#login-page");
			        }
			    }
			);

		    $(document).on("pageshow", "#map-page", function () {
		        console.log("In pageshow / #map-page.");
		        mapElement.invalidateSize();
		    });

		    $('div[data-role="page"]').page();
		},

		api: api,
		map: map,

		// Update DOM on a Received Event
		receivedEvent: function(id) {

		}
	};

})();
