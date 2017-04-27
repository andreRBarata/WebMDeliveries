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

var HOST = 'http://192.168.1.36';

var app = (function () {
	var mapElement;

	var view = {
		alert: function (message, type) {
			return $('<div data-role="popup" class="alert alert-' +
					(type || 'danger') + '">' +
						'<a href="#" class="close" data-dismiss="alert">&times;</a>' +
						message +
					'</div>'
				).alert();
		},
		modalinput: function (page, ele) {
			$.mobile.navigate(page);

			$(page).find('[role=inputsubmit]')
				.one('click', function () {
					var value = $(page)
						.find('[role=inputreturn]')
						.val();

					$(ele).val(value);
					$(page).dialog('close');
				});
		}
	};

	var api = {
		call: function (method, func, form) {
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

			return $.ajax({
				url: HOST + '/api/' + func + '/',
				type: method,
				data: formData(form),
				headers: {
					'X-CSRFToken': Cookies.get('csrftoken'),
					'Authorization': localStorage.token
				},
				dataType: 'json'
			});
		},
		login: function (form) {
			return api.call(
				'post', 'login', form
			).done(function(res) {
				localStorage.setItem('token', res.token);

				$.mobile.navigate('#page-main');
			}).fail(function () {
				$('#login-page .messages').append(
					view.alert('Username or password incorrect')
				);
			});
		},
		delivery: function (form) {
			return api.call(
				'post', 'delivery', form
			);
		},
		logout: function () {
			localStorage.removeItem('token');

			$.mobile.navigate('#login-page');
		}
	};

	var map = {
		makeBasicMap: function () {
			mapElement = L.map('map-var', {
				zoomControl: true,
				zoomLevel: 18,
				attributionControl: false
			}).fitWorld();

			L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				useCache: true
			}).addTo(mapElement);

			$('#leaflet-copyright').html('Leaflet | Map Tiles &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors');

			return mapElement;
		},
		getCurrentlocation: function () {
			var myLatLon;
			var myPos;

			navigator.geolocation.getCurrentPosition(
				function (pos) {
					var myLatLon = L.latLng(
						pos.coords.latitude,
						pos.coords.longitude
					);

					L.marker(myLatLon)
						.addTo(mapElement);
				},
				function (err) {
				},
				{
					enableHighAccuracy: true
					// maximumAge: 60000,
					// timeout: 5000
				}
			);
		}
	};

	return {
		// Application Constructor
		initialize: function() {
			document.addEventListener(
				'deviceready',
				this.onDeviceReady.bind(this),
				false
			);

		},

		// deviceready Event Handler
		//
		// Bind any cordova events here. Common events are:
		// 'pause', 'resume', etc.
		onDeviceReady: function() {
			$('form').attr('action', 'javascript: ');

			if (!localStorage.getItem('token')) {
				$.mobile.navigate('#login-page');
			}
			else if ($.mobile.activePage.attr('id') === 'login-page') {
				$.mobile.navigate('#main-page');
			}

			this.receivedEvent('deviceready');

			$(document).on('pagecreate', '#map-page',
				function (event) {
					console.log('In pagecreate. Target is ' + event.target.id + '.');

					$('#map-page').enhanceWithin();

					mapElement = map.makeBasicMap();
				}
			);

			$(document).on('pageshow',
				function (event) {
					if (!localStorage.token) {
						$.mobile.navigate('#login-page');
					}
				}
			);

			$(document).on('pageshow', '#map-page', function () {
				mapElement.invalidateSize();
			});

			$('div[data-role="page"]').page();
			$('#calendar').datetimepicker({
				inline: true,
				sideBySide: true,
				format: 'YYYY-MM-DD HH:mm'
			});
		},

		api: api,
		map: map,
		view: view,

		// Update DOM on a Received Event
		receivedEvent: function(id) {

		}
	};

})();
