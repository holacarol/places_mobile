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

    var _initAjaxSettings = function ()
    {
    	$$.ajaxSettings.error = _genericAjaxError;
    }

    var signin = function (email, password) {
    	var url = PLACES_API_URL + 'users/sign_in.json';
    	var data = "user[email]="+email+"&user[password]="+password;
    	// data = JSON.stringify(data);

    	$$.post(url, data, function(response, xhr) {
    		console.error(url);
			console.error(response);
			App.Services.initUser();
		}, "application/json");
    }

    var signout = function () {
    	var url = PLACES_API_URL + 'users/sign_out.json';
    	var data = "_method=DELETE";

    	$$.post(url, 
    			data, 
    			function(response, xhr) { 
    				console.error(xhr);
    				App.View.requestLogin();
    			},
    			"application/json");	
    }

	var initUser = function ()
	{
		loadUserPlaces();
		requestUserLocation();

	}

	var loadUserPlaces = function ()
	{
		// var url = 'http://127.0.0.1:8000/myplaces/server/user.places.get.json';
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

			// App.Events.createPlacesTapEvents('section#place-list article.list');
			// App.Events.createLikeTapEvents('section#place-list article.list');
			// App.Events.createLikeTapEvents();

		});
	};

	var loadUserFriends = function ()
	{
		// var url = 'http://127.0.0.1:8000/myplaces/server/user.places.get.json';
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
		// var url = 'http://127.0.0.1:8000/myplaces/server/user.places.get.json';
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
/**
			App.View.createPlaceView(place);
**/
			if ((comments != undefined) && (comments.length>0)) {
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

	var doLike = function (place_id)
	{
		var place = App.Data.getPlace(place_id);
		var post_activity_id = place.post_activity_id;
		var url = PLACES_API_URL + 'activities/'+post_activity_id+'/like.json';
		var data = {};

		$$.post(url, data, function(response) {
			console.error("like done");
		}, "application/json");
	};

	var undoLike = function (place_id)
	{
		var place = App.Data.getPlace(place_id);
		var post_activity_id = place.post_activity_id;
		var url = PLACES_API_URL + 'activities/'+post_activity_id+'/like.json';
		var data = "_method=delete";

		$$.post(url, data, function(response) { console.error("unlike done"); }, "application/json");	
	};

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
	}

	var _setUserLocationError = function (error) 
	{
		console.error(error);
	} 

	var _genericAjaxError = function (message, xhr) {
		if (xhr.status == 401) {
			App.View.requestLogin();
		}
	}

	/** Initialization **/
	_initAjaxSettings();
	initUser();


	return {
		signin : signin,
		signout : signout,
		initUser : initUser, 
		loadUserPlaces : loadUserPlaces,
		loadUserFriends : loadUserFriends,
		requestUserLocation : requestUserLocation,
		loadPlaceInformation : loadPlaceInformation,
		loadFriendPlaces : loadFriendPlaces,
		doLike : doLike,
		undoLike : undoLike,
	}

})(LUNGO, App);