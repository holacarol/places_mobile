App.Services = (function(lng, app, undefined) {

	var _initAjaxSettings = function ()
	{
		$$.ajaxSettings.error = _genericAjaxError;
	};

	/**
	 *  INITIALIZATION and LOGIN
	 *  We are going to provide functionalities to:
	 *  - signin: login the user
	 *  - signout: log out the user (not mapped to a UI event)
	 *  - initUser: to initialize the user automatically if there's previous cookie.
	 */

	var signin = function (email, password) {
		var url = App.Config.PLACES_API_URL + 'users/sign_in.json';
		var data = "user[email]="+email+"&user[password]="+password;
		// data = JSON.stringify(data);

		$$.post(url, data, function(response, xhr) {
			console.error(url);
			console.error(response);
			App.Services.initUser();
		}, "application/json");
	};

	var signout = function () {
		var url = App.Config.PLACES_API_URL + 'users/sign_out.json';
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

	/**
	 *  LOADING USER PLACES
	 *
	 */

	var loadUserPlaces = function ()
	{
		var url = App.Config.PLACES_API_URL + 'places.json';
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


	/**
	 *  LOADING NEARBY PLACES #search-place section
	 *  Consists of 4 main methods:
	 *  - loadNearbyPlaces: the main one
	 *  - _loadNearbyPlacesFromServer: private, only for server ones
	 *  - _loadNearbyGooglePlaces: private, only for Google ones
	 *  - _gatherPlaces: callback function to gather places from both queries.
	 */
	var loadNearbyPlaces = function ()
	{
		App.Services.RequestSynchronizer.init('nearby_places',2, function (response) {
			_showNearByResults(_combinePlaces(response));
		});
		var callbackFunction = App.Services.RequestSynchronizer.callback('nearby_places');
		_loadNearbyPlacesFromServer(callbackFunction);
		_loadNearbyGooglePlaces(callbackFunction);
	};

	var _loadNearbyPlacesFromServer = function (callback)
	{
		var url = App.Config.PLACES_API_URL + 'places/nearby.json';
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

	var _combinePlaces = function (response)
	{
		console.error(response);
		var places_array = [];
		var indexes = [];
		var place_i = {};
		var place_o = {};
		for (var ia = 0; ia < response.length; ia++) {
			for (var ip = 0; ip < response[ia].length; ip++) {
				place_i = new App.Data.Place(response[ia][ip]);
				var do_push = true;
				if (indexes[place_i.title] !== undefined) {
					for (var ii = 0; ii < indexes[place_i.title].length; ii ++){
						place_o = places_array[indexes[place_i.title][ii]];
						if (place_i.equals(place_o)) {
							/* Substitute in the array only if it's preferred duplicate */
							if (place_o.origin == 'google' && place_i.origin == 'myplaces') {
								places_array[indexes[place_i.title][ii]] = place_i;
							} 
							/* Do not do push to avoid duplicates */
							do_push = false;
						} 						
					}
				}
				/* Put in the array if it's not a duplicate */
				if (do_push) {
					places_array.push(place_i);
					/* and include the index in the indexes table */
					if (indexes[place_i.title]===undefined) {
						indexes[place_i.title]=[];
					}
					indexes[place_i.title].push(places_array.length-1);
				}
			}
		}
		return places_array;		
	};

	var _showNearByResults = function (places_array)
	{
		console.error(places_array);
		App.Data.putPlaces(places_array);
		lng.View.Template.List.create({
			el: "#place-search #nearby-results",
			template: "place-nearby-in-list",
			data: places_array,
			order: {
				field: 'distance.amount',
				type: 'asc'
			}
		});
		App.View.switchFromTo('#place-search #search-results','#place-search #nearby-results');
		lng.View.Scroll.init('nearby-results');
	};

	/**
	 *  SEARCHING PLACES #search-place section
	 *  Consists of 4 main methods:
	 *  - searchPlaces: the main one
	 *  - _searchPlacesFromServer: private, only for server ones
	 *  - _searchGooglePlaces: private, only for Google ones
	 *  - _gatherPlaces: callback function to gather places from both queries.
	 */

	var searchPlaces = function (query)
	{
		App.Services.RequestSynchronizer.init('search_places',2, function (response) {
			_showSearchResults(_combinePlaces(response));
		},{onthefly:false});
		var callbackFunction = App.Services.RequestSynchronizer.callback('search_places');
		_searchPlacesFromServer(query,callbackFunction);
		_searchGooglePlaces(query,callbackFunction);
	};

	var _searchPlacesFromServer = function (query, callback)
	{
		var url = App.Config.PLACES_API_URL + 'search.json';
		var data = { q : query, mode : 'place_search' };

		console.error(url + "query=" + query);
		$$.json(url, data, callback);
	};

	var _searchGooglePlaces = function (query, callback)
	{
		var request = {
			query : query,
			location : new google.maps.LatLng(App.Data.userLocation.latitude,App.Data.userLocation.longitude),
			radius : 10000
		};

		var places_service = new google.maps.places.PlacesService($$('#google-places-search')[0]);
		places_service.textSearch(request, callback);
	};

	var _showSearchResults = function (places_array)
	{
		console.error(places_array);

		App.Data.putPlaces(places_array);
		lng.View.Template.List.create({
			el: "#place-search #search-results",
			template: "place-nearby-in-list",
			data: places_array
			// order: {
			// 	field: 'distance.amount',
			// 	type: 'asc'
			// }
		});
		App.View.switchFromTo('#place-search #nearby-results','#place-search #search-results');
		lng.View.Scroll.init('search-results');
	};

	/**
	 *  LOADING USER FRIENDS.
	 *  Consists mainly in two methods
	 *  - loadUserFriends : to get the friend list
	 *  - loadFriendPlaces : to get the places of a friend.
	 *
	 */

	var loadUserFriends = function ()
	{
		var url = App.Config.PLACES_API_URL + 'contacts.json';
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
		var url = App.Config.PLACES_API_URL + 'users/' + user_slug + '/places.json';
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
		var url = App.Config.PLACES_API_URL + 'places/'+place_id+".json";
		var data = {};

		$$.json(url, data, function(response) {
			console.error(response);

			var place = response.place;
			var comments = response.comments;
			if ((comments !== undefined) && (comments.length>0)) {
				App.View.switchFromTo(".place.comments .message.loading",".place.comments .switch.friends");
				lng.View.Template.List.append({
					el: ".place.comments .list",
					template: "comment",
					data: comments
				});
				lng.View.Scroll.init('place-description');
			} else {
				App.View.switchFromTo(".place.comments .message.loading",".place.comments .message.none");
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
			var url = App.Config.PLACES_API_URL + 'activities/'+post_activity_id+'/like.json';
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
		var url = App.Config.PLACES_API_URL + 'activities/'+post_activity_id+'/like.json';
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
		var url = App.Config.PLACES_API_URL + "places.json";
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

	var addComment = function (post_activity_id, comment)
	{
		console.error(post_activity_id);
		console.error(comment);
		var url = App.Config.PLACES_API_URL + "comments.json";
		var data = {
			comment : {
				_activity_parent_id : post_activity_id,
				text : comment
			}
		};

		console.error(url);
        $$.ajax({
            type: 'POST',
            url: url,
            data: JSON.stringify(data),
            success: function (response) {
				App.View.clearTextArea(".place.comments .add.comment");
				lng.View.Template.List.append({
					el: ".place.comments .list",
					template: "comment",
					data: response.comment
				});
				lng.View.Scroll.init('place-description');
            },
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
			/** A new place doesnt have any comments */
			App.View.switchFromTo(".place.comments .message.loading",".place.comments .message.none");
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

	/**
	 *
	 *  REQUEST SYNCHRONIZER UTILITY 
	 *
	 *  Utility that helps to synchronize various AJAX requests based on an id.
	 *  If more than one request should call the same callback function, the Synchronizer helps to
	 *  gather the temporal results before calling the final callback function.
	 *
	 *
	 **/
	var RequestSynchronizer = (function(lng,app,undefined) {

		var _ongoing = [];

		/** Default configuration for the Synchronizer object **/
		var DEFAULT_CONFIG = {
			mix : false,
			onthefly : false
		};

		var init = function (request_id,count,callback,config)
		{
			// Destroy previous requests with the same id
			destroy(request_id);
			// Build configuration object
			config = $$.mix(DEFAULT_CONFIG,config);
			// Build request synchronizer
			_ongoing[request_id] = {
				id : request_id,
				count : count,
				callback : callback,
				response : [],
				mix : config.mix,
				onthefly : config.onthefly,
				enabled : true,
			};
		};

		var destroy = function (request_id)
		{
			var synchronizer = getSynchronizer(request_id);
			if (synchronizer != undefined) {
				synchronizer.enabled = false;
				_ongoing[request_id] = undefined;
			}
		};

		var getCallback = function (request_id)
		{
			var synchronizer = _ongoing[request_id];
			if (_ongoing[request_id] !== undefined){
				return function (response) {
					if (synchronizer.enabled) {
						if (synchronizer.mix) {
							/** TODO: mix response with existing one **/
						} else {
							synchronizer.response.push(response);
						}
						if (synchronizer.response.length == synchronizer.count) {
							synchronizer.callback(synchronizer.response);
							RequestSynchronizer.destroy(synchronizer.id);
						} else if (synchronizer.onthefly) {
							synchronizer.callback(synchronizer.response);
						}
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
		searchPlaces : searchPlaces,
		loadUserFriends : loadUserFriends,
		requestUserLocation : requestUserLocation,
		loadPlaceInformation : loadPlaceInformation,
		loadGooglePlaceInformation : loadGooglePlaceInformation,
		loadFriendPlaces : loadFriendPlaces,
		doLike : doLike,
		doDislike : doDislike,
		doCreateAndLike : doCreateAndLike,
		addComment : addComment,
		RequestSynchronizer : RequestSynchronizer
	};

})(LUNGO, App);