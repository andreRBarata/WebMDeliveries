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
	"use strict";

	var mapElement;

	var view = {
		alert: function (message, type) {
			return $.mobile.activePage.find('.messages')
				.append(
					$('<div data-role="popup" class="alert alert-' +
						(type || 'danger') + '">' +
							'<a href="#" class="close" data-dismiss="alert">&times;</a>' +
							message +
						'</div>'
					).alert()
				);
		},
		changepage: function (page, option) {
			console.log('Change to page ' + page);

			$.mobile.pageContainer
				.pagecontainer('change', $(page), option);
		},
		modalinput: function (page, ele) {
			var input = $(page)
				.find('[role=inputreturn]');

			view.changepage(page);
			input.val($(ele).val());

			return $(page).find('[role=inputsubmit]')
				.one('click', function () {
					var value = input.val();
					console.log($(ele), ele);
					$(ele).val(value);
					$(page).dialog('close');
				});
		}
	};

	var transform = {
		geo: function (data) {
			var coords = data.split(', ')
				.map(parseFloat);

			return {
				lat: coords[0],
				lng: coords[1]
			};
		}
	};

	var api = {
		call: function (method, func, form) {
			function formData(form) {
				var toReturn = {};
				var serielized = $(form).find('[name]')
					.each(function (i, ele) {
						var data = $(ele).val();

						if ($(ele).attr('data-transform')) {
							data = transform[$(ele)
								.attr('data-transform')](data);

							if (data instanceof Object) {
								$.each(data, function (name, value) {
									toReturn[
										$(ele).attr('name') + '_' + name
									] = value;
								});

								return;
							}
						}

						return toReturn[$(ele).attr('name')] = data;
					});


				return toReturn;
			}

			return new Promise(function (resolve, reject) {
				console.log('Sending');
				$.ajax({
					url: HOST + '/api/' + func + '/',
					type: method,
					data: formData(form),
					beforeSend: function (xhr) {

						if (Cookies.get('csrftoken')) {
							xhr.setRequestHeader(
								'X-CSRFToken',
								Cookies.get('csrftoken')
							);
						}
						if (localStorage.token) {
							xhr.setRequestHeader(
								'Authorization',
								localStorage.token
							);
						}
					},
					dataType: 'json'
				}).done(resolve)
					.fail(function (err) {
						var obj = err.responseJSON;

						reject(
							(obj)? obj.detail:
								err.responseText
						);
					});
			});
		},
		register: function (form) {
			return api.call(
				'post', 'user', form
			).then(function(res) {
				view.alert('Account created', 'success');

				form.reset();
			}).catch(function (err) {
				view.alert(err ||
					'Could not create account'
				);
			});
		},
		login: function (form) {

			return api.call(
				'post', 'login', form
			).then(function(res) {
				localStorage.setItem('token', res.token);
				localStorage.setItem('username', form.username.value);

				form.reset();
				view.changepage('#main-page');
			}).catch(function (err) {
				view.alert(err ||
					'Could not login'
				);
			});
		},
		delivery: {
			create: function (form) {
				return api.call(
					'post', 'delivery', form
				).then(function (res) {
					view.alert('Delivery has been created', 'success');

					form.reset();
				}).catch(function (err) {
					view.alert(err ||
						'Could not create delivery'
					);
				})
			},
			list: function () {
				return api.call(
					'get', 'delivery'
				)
			}
		},
		logout: function () {
			localStorage.removeItem('token');

			view.changepage('#login-page');
		}
	};

	var map = (function () {
		var point;

		return {
			makeBasicMap: function () {
				mapElement = L.map('map-var', {
					center: [53.350140, -6.266155],
    				zoom: 13
				});

				L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
					useCache: true
				}).addTo(mapElement);

				$('#leaflet-copyright').html('Leaflet | Map Tiles &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors');

				return mapElement;
			},
			getCurrentlocation: function () {
				var myLatLon;
				var myPos;

				return new Promise(
					function (resolve, reject) {
						navigator.geolocation.getCurrentPosition(
							function (pos) {
								resolve(L.latLng(
									pos.coords.latitude,
									pos.coords.longitude
								));
							},
							reject,
							{
								enableHighAccuracy: true
								// maximumAge: 60000,
								// timeout: 5000
							}
						);
					}
				);
			},
			gotoCurrentPosition() {
				return map.getCurrentlocation()
					.then(function (coords) {
						map.setTick(coords);
					});
			},
			setTick(coords) {
				if (!point) {
					point = L.marker(coords)
						.addTo(mapElement);
				}
				else {
					point.setLatLng(coords);
				}

				$('#map-page')
					.find('#map-coords')
					.val(coords.lat + ', ' + coords.lng);
			}
		};
	})();

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

			if (!localStorage.token) {
				view.changepage('#login-page');
			}
			else if ($.mobile.activePage.attr('id') === 'login-page') {
				view.changepage('#main-page');
			}

			this.receivedEvent('deviceready');

			$(document).on('pageshow', '#main-page',
				function (event) {
					console.log(event, $('#sp-username'));
					$('#sp-username')
						.html(localStorage.username);
				}
			)

			$(document).on('pagecreate', '#map-page',
				function (event) {
					console.log('In pagecreate. Target is ' + event.target.id + '.');

					$('#map-page').enhanceWithin();

					mapElement = map.makeBasicMap();

					mapElement.invalidateSize();
					mapElement.on('click', function (ev) {
						console.log('Click in map');
						var latlng = mapElement
							.mouseEventToLatLng(ev.originalEvent);

						map.setTick(latlng);
					});

				}
			);

			$(document).on('pageshow', '#deliveries-page',
				function (event) {
					var body = $('#deliveries-page table tbody')
						.html('');

						api.delivery.list()
							.then(function (deliveries) {
								deliveries.features
									.forEach(function (row) {
										body.append(
											$('<tr><td>'
												+ row.properties.date +
											'</td></tr>')
										);
									});
							});
				}
			);

			$(document).on('pageshow',
				function (event, data) {
					if (!localStorage.token) {
						if (['login-page', 'register-page'].indexOf(data.prevPage.attr('id')) === -1) {
							view.changepage('#login-page');
						}
					}
				}
			);

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
