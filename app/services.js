App.Services = (function(lng, app, undefined) {

	/** Demonstration Server URL **/
    // var PLACES_API_URL = 'http://192.168.1.132:3000/';
    /** Local Server URL **/
    var PLACES_API_URL = "server/";

	var markers = {
	                user: {
	                    url: 'assets/images/ikwb-p-as.png',
	                    size: {x: 22, y: 37},
	                    anchor: {x: 11, y: 37}
	                },
	                friends: {
	                    url: 'assets/images/ikwb-p-ss.png',
	                    size: {x: 22, y: 37},
	                    anchor: {x: 11, y: 37}
	                },
	                recommended: {
	                    url: 'assets/images/ikwb-p-ns.png',
	                    size: {x: 22, y: 37},
	                    anchor: {x: 11, y: 37}
	                }
	            };

	var initUser = function ()
	{
		loadUserPlaces();
		getUserLocation();

	}

	var loadUserPlaces = function ()
	{
		// var url = 'http://127.0.0.1:8000/myplaces/server/user.places.get.json';
		var url = PLACES_API_URL + 'places.json';
		var data = {callback : '?'};

		$$.json(url, data, function(response) {
			console.error(response);

			App.Data.setUserPlaces(response);

			lng.View.Template.List.create({
				el: "#list-friends",
				template: "place-in-list",
				data: response.friends
			});

			lng.View.Template.List.create({
				el: "#list-mine",
				template: "place-in-list",
				data: response.myplaces
			});

			lng.View.Template.List.create({
				el: "#list-recommended",
				template: "place-in-list",
				data: response.recommended
			});

			App.Events.createPlacesTapEvents();

		});
	};

	var loadUserFriends = function ()
	{
		// var url = 'http://127.0.0.1:8000/myplaces/server/user.places.get.json';
		var url = PLACES_API_URL + 'contacts.json';
		var data = {callback : '?'};

		$$.json(url, data, function(response) {
			console.error(response);

			App.Data.setUserFriends(response);

			lng.View.Template.List.create({
				el: "#friend-list-content",
				template: "friend-in-list",
				data: response
			});
		});
	};

	var loadPlaceInformation = function (place_id) 
	{
		var url = PLACES_API_URL + 'places/'+place_id+".json";
		var data = {callback : '?'};

		$$.json(url, data, function(response) {
			console.error(response);

			var place = response.place;
			var comments = response.comments;
/**
			App.View.createPlaceView(place);
**/

			lng.View.Template.List.create({
				el: "#place-comments .list",
				template: "comment",
				data: comments
			});

		});

	}

	var getUserLocation = function ()
	{
		//check if the geolocation object is supported, if so get position
		if (navigator.geolocation)
			navigator.geolocation.getCurrentPosition(_setUserLocation, _setUserLocationError);
		else
			console.error("Localization not supported");
	}

	var _setUserLocation = function (position) 
	{ 
		App.Data.userLocation = { latitude : position.coords.latitude, longitude : position.coords.longitude};
	}

	var _setUserLocationError = function (error) 
	{
		console.error(error);
	} 

	var loadMap = function()
	{
	    lng.Sugar.GMap.init({
	            el: '#fullmapview',
	            zoom: 14,
	            //type: 'HYBRID',
	            center: App.Data.userLocation,
	            overviewMapControl: true
	    });

		_placeMarkers(App.Data.userPlaces.myplaces,App.Services.markers.user);
		_placeMarkers(App.Data.userPlaces.friends,App.Services.markers.friends);
		_placeMarkers(App.Data.userPlaces.recommended,App.Services.markers.recommended);
	}

	var renderPlaceMap = function(place)
	{
		console.error("Initializing map...");
		lng.Sugar.GMap.init({
	            el: 'div#placemapview',
	            zoom: 14,
	            minZoom: 14,
	            maxZoom: 14,
	            //type: 'HYBRID',
	            center: place,
	            draggable: false,
	            disableDoubleClickZoom: true,

	    });
		console.error("Placing markers...");
		_placeMarker(place,App.Services.markers.user);
	}

	var _placeMarkers = function (places, marker) {
	    for (var i=0; i<places.length; i++) {
			place = places[i];
			_placeMarker(place,marker);
			/*
			lng.Sugar.GMap.addMarker(
				{ latitude : place.latitude,
				  longitude : place.longitude },
				marker,
				false
			);
			*/
		};
	}

	var _placeMarker = function (place, marker) {
		lng.Sugar.GMap.addMarker(place,marker,false);
	}

	return {
		initUser : initUser, 
		loadUserPlaces : loadUserPlaces,
		loadUserFriends : loadUserFriends,
		loadMap : loadMap,
		renderPlaceMap : renderPlaceMap,
		getUserLocation : getUserLocation,
		loadPlaceInformation : loadPlaceInformation,
		markers : markers
	}

})(LUNGO, App);