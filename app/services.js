App.Services = (function(lng, app, undefined) {

	/** Demonstration Server URL **/
    // var PLACES_API_URL = 'http://192.168.1.129:3000/';
    /** Local Server URL **/
    var PLACES_API_URL = "server/";

	var initUser = function ()
	{
		loadUserPlaces();
		requestUserLocation();

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

			App.View.markPlacesListAsLiked(response.myplaces,'section#place-list');
			App.View.markPlacesListAsLiked(response.friends,'section#place-list');
			App.View.markPlacesListAsLiked(response.recommended,'section#place-list');

			// App.Events.createPlacesTapEvents('section#place-list article.list');
			// App.Events.createLikeTapEvents('section#place-list article.list');
			// App.Events.createLikeTapEvents();

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
			lng.View.Template.render('section#place-view article#place-description .comments', 'comments-box', {});
			lng.View.Template.List.create({
				el: ".place.comments .list",
				template: "comment",
				data: comments
			});

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
		var data = {_method : "delete"};

		$$.ajax({
			type: "POST",
        	url: url,
        	data: { _method : "delete"},
        	success: function(response) { console.error("unlike done"); },
        	dataType: "application/json",
        	contentType: "application/x-www-form-urlencoded"
        	// headers: {'X_METHODOVERRIDE': 'DELETE'}
        });	
	};

	var requestUserLocation = function ()
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


	return {
		initUser : initUser, 
		loadUserPlaces : loadUserPlaces,
		loadUserFriends : loadUserFriends,
		requestUserLocation : requestUserLocation,
		loadPlaceInformation : loadPlaceInformation,
		doLike : doLike,
		undoLike : undoLike,
	}

})(LUNGO, App);