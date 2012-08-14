App.Services = (function(lng, app, undefined) {

	/** Demonstration Server URL (@airecico) **/
	// var PLACES_API_URL = 'http://192.168.1.129:3000/';
	/** Demonstration Server URL (@DIT) **/
	// var PLACES_API_URL = 'http://lechuga.dit.upm.es:3000/';
	/** Proxy Server URL for lechuga **/
	var PLACES_API_URL = "/proxydit/";
	/** Proxy Server URL for airecico **/
	// var PLACES_API_URL = "/proxyair/";
	/** On Rails Server URL **/
	// var PLACES_API_URL = "/";

	var GOOGLE_API_URL = "/google/";

	var GOOGLE_API_KEY = "AIzaSyCGRJar96a3klge7MihfjEWYUAbgkoNKI4";


	var _initAjaxSettings = function ()
	{
		$$.ajaxSettings.error = _genericAjaxError;
	};

	var signin = function (email, password) {
		var url = PLACES_API_URL + 'users/sign_in.json';
		var data = "user[email]="+email+"&user[password]="+password;
		// data = JSON.stringify(data);

		$$.post(url, data, function(response, xhr) {
			console.error(url);
			console.error(response);
			App.Services.initUser();
		}, "application/json");
	};

	var signout = function () {
		var url = PLACES_API_URL + 'users/sign_out.json';
		var data = "_method=DELETE";

		$$.post(url,
				data,
				function(response, xhr) {
					console.error(xhr);
					app.View.requestLogin();
				},
				"application/json");
	};

	var initUser = function ()
	{
		loadUserPlaces();
		requestUserLocation();

	};

	var loadUserPlaces = function ()
	{
		var url = PLACES_API_URL + 'places.json';
		var data = {};

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

			App.View.markPlacesListAsLiked(response.myplaces,'section#place-list');
			App.View.markPlacesListAsLiked(response.friends,'section#place-list');
			App.View.markPlacesListAsLiked(response.recommended,'section#place-list');

			lng.Router.section('place-list');

		});
	};

	var loadNearbyPlaces = function ()
	{
		App.Services.RequestSynchronizer.init('nearby_places',2,_gatherPlaces);
		var callbackFunction = App.Services.RequestSynchronizer.callback('nearby_places');
		_loadNearbyPlacesFromServer(callbackFunction);
		_loadNearbyGooglePlaces(callbackFunction);
	};

	var _loadNearbyPlacesFromServer = function (callback)
	{
		var url = PLACES_API_URL + 'places/nearby.json';
		var data = { lat: App.Data.userLocation.latitude, lng : App.Data.userLocation.longitude };
		$$.json(url, data, callback);
	};

	var _loadNearbyGooglePlaces = function (callback)
	{
		var request = {
			location : new google.maps.LatLng(App.Data.userLocation.latitude,App.Data.userLocation.longitude),
			rankBy: google.maps.places.RankBy.DISTANCE,
			types: ["establishment","point_of_interest"]
		};

		var places_service = new google.maps.places.PlacesService($$('#google-places-search')[0]);
		places_service.search(request, callback);
	};

	var _gatherPlaces = function (response)
	{
		console.error(response);
		var places_array = [];
		for (var ia = 0; ia < response.length; ia++) {
			for (var ip = 0; ip < response[ia].length; ip++) {
				places_array.push(new App.Data.Place(response[ia][ip]));
			}
		}
		console.error(places_array);

		App.Data.putPlaces(places_array);

		lng.View.Scroll.init('search-results');

		lng.View.Template.List.create({
			el: "#place-search #search-results",
			template: "place-nearby-in-list",
			data: places_array,
			order: {
				field: 'distance.amount',
				type: 'asc'
			}
		});''

	};

	var loadUserFriends = function ()
	{
		var url = PLACES_API_URL + 'contacts.json';
		var data = {};

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

	var loadFriendPlaces = function (user_slug)
	{
		var url = PLACES_API_URL + 'users/' + user_slug + '/places.json';
		var data = {};

		$$.json(url, data, function(response) {
			App.Data.setFriendPlaces(user_slug, response);

			lng.View.Template.List.create({
				el: "#friend-places-list",
				template: "place-in-list",
				data: response
			});

			/** Mark if the place is liked or not **/
			App.View.markPlacesListAsLiked(response,'#friend-places-list');

		});
	};


	var loadPlaceInformation = function (place_id)
	{
		var url = PLACES_API_URL + 'places/'+place_id+".json";
		var data = {};

		$$.json(url, data, function(response) {
			console.error(response);

			var place = response.place;
			var comments = response.comments;
			if ((comments !== undefined) && (comments.length>0)) {
				lng.View.Template.render('section#place-view article#place-description .comments', 'comments-box', {});
				lng.View.Template.List.create({
					el: ".place.comments .list",
					template: "comment",
					data: comments
				});
			} else {
				lng.View.Template.render('section#place-view article#place-description .comments', 'no-comments', {});
			}

		});
	};

	var loadGooglePlaceInformation = function (place_id)
	{

		var place = App.Data.getPlace(place_id);

		if (place.has_details) {
			App.View.createPlaceView(place);
		} else {
			var request = {
				reference : place.reference
			};

			var places_service = new google.maps.places.PlacesService($$('#google-places-search')[0]);
			places_service.getDetails(request, function(response) {
				console.error(response);
				var place = new App.Data.Place(response);
				App.Data.putPlace(place);
				App.View.createPlaceView(place);
			});
		}
	};

	var doLike = function (place_id)
	{
		var place = App.Data.getPlace(place_id);
		var post_activity_id = place.post_activity_id;

		if (post_activity_id < 0 && place.origin == 'google') {
			doCreateAndLike(place);
		} else {
			var url = PLACES_API_URL + 'activities/'+post_activity_id+'/like.json';
			var data = {};

			$$.post(url, data, function(response) {
				/** Change place like in cache **/
				console.error(place);
				place.is_liked = true;
				App.Data.putPlace(place);
				/** We add the place first to then change the star **/
				App.View.addPlaceToList(place);
				App.View.markPlaceAsLiked(place.id,true);
			}, "json");
		}
	};

	var doDislike = function (place_id)
	{
		var place = App.Data.getPlace(place_id);
		var post_activity_id = place.post_activity_id;
		var url = PLACES_API_URL + 'activities/'+post_activity_id+'/like.json';
		var data = "_method=delete";

		$$.post(url, data, function(response) {
			console.error(place);
			place.is_liked = false;
			App.Data.putPlace(place);
			App.View.markPlaceAsLiked(place.id,false);
		}, "json");
	};

	var doCreateAndLike = function(place)
	{
		var url = PLACES_API_URL + "places.json";
		var data = {
			place : {
				address_attributes : place.address,
				title : place.title,
				latitude : place.latitude,
				longitude : place.longitude,
				phone_number : place.phone_number,
				url : place.url
			}
		};

		console.error(url);
        $$.ajax({
            type: 'POST',
            url: url,
            data: JSON.stringify(data),
            success: _newPlace,
            dataType: 'json',
            contentType: 'application/json'
        });
	};

	var _newPlace = function (response) {
		console.error(response);
		console.error(response.success);
		console.error(response.place);
		if (response.success) {
			var new_place = response.place;
			console.error(new_place);
			App.Data.putPlace(new_place);
			/** We make the view again with the final data of the place **/
			App.View.createPlaceView(new_place);
			/** We add the place first to then change the star **/
			App.View.addPlaceToList(new_place);
			App.View.markPlaceAsLiked(new_place.id,true);
		}
	}

	var requestUserLocation = function ()
	{
		//check if the geolocation object is supported, if so get position
		if (navigator.geolocation)
			navigator.geolocation.getCurrentPosition(_setUserLocation, _setUserLocationError);
		else
			console.error("Localization not supported");
	};

	var _setUserLocation = function (position)
	{
		App.Data.userLocation = { latitude : position.coords.latitude, longitude : position.coords.longitude};
	};

	var _setUserLocationError = function (error)
	{
		console.error(error);
	};

	var _genericAjaxError = function (message, xhr) {
		if (xhr.status == 401) {
			App.View.requestLogin();
		}
	};

	/** REQUEST SYNCHRONIZER UTILITY **/
	var RequestSynchronizer = (function(lng,app,undefined) {

		var _ongoing = [];

		var init = function (request_id,count,callback,mix)
		{
			_ongoing[request_id] = {
				id : request_id,
				count : count,
				callback : callback,
				response : [],
				mix : (mix!==undefined)?true:false
			};
		};

		var destroy = function (request_id)
		{
			_ongoing[request_id] = undefined;
		};

		var getCallback = function (request_id)
		{
			var synchronizer = _ongoing[request_id];
			if (_ongoing[request_id] !== undefined){
				return function (response) {
					if (synchronizer.mix) {
						/** TODO: mix response with existing one **/
					} else {
						synchronizer.response.push(response);
					}
					if (synchronizer.response.length == synchronizer.count) {
						synchronizer.callback(synchronizer.response);
						RequestSynchronizer.destroy(synchronizer.id);
					}
				};
			} else {
				return function (response) {
					console.error(response);
				};
			}
		};

		var getSynchronizer = function (request_id)
		{
			return _ongoing[request_id];
		}

		return {
			init : init,
			destroy : destroy,
			callback : getCallback,
			synchronizer : getSynchronizer
		};
	})(LUNGO,App);


	/** Initialization **/
	_initAjaxSettings();
	initUser();


	return {
		signin : signin,
		signout : signout,
		initUser : initUser,
		loadUserPlaces : loadUserPlaces,
		loadNearbyPlaces : loadNearbyPlaces,
		loadGooglePlaces : _loadNearbyGooglePlaces,
		loadUserFriends : loadUserFriends,
		requestUserLocation : requestUserLocation,
		loadPlaceInformation : loadPlaceInformation,
		loadGooglePlaceInformation : loadGooglePlaceInformation,
		loadFriendPlaces : loadFriendPlaces,
		doLike : doLike,
		doDislike : doDislike,
		doCreateAndLike : doCreateAndLike,
		RequestSynchronizer : RequestSynchronizer
	};

})(LUNGO, App);