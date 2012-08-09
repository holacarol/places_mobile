App.Data = (function(lng, app, undefined) {

	var _userPlaces = new Object();
	var _userFriends = new Object();
	var _userLocation = { latitude : 0, longitude: 0};

	var setUserPlaces = function (places) {
		App.Data.userPlaces = places;
		_toCache(places.myplaces,'id','place-');
		_toCache(places.friends,'id','place-');
		_toCache(places.recommended,'id','place-');
	}

	var setUserFriends = function (friends) {
		App.Data.userFriends = friends;
		_toCache(friends,'slug','friend-');
	}

	var setFriendPlaces = function (friend_slug, places) {
		lng.Data.Cache.set('friend-'+friend_slug+'-places',places);
	}

	var getFriendPlaces = function (friend_slug) {
		return lng.Data.Cache.get('friend-'+friend_slug+'-places');
	}

	var getPlaceFromCache = function (place_id) {
		return lng.Data.Cache.get('place-'+place_id);
	}

	var getFriendFromCache = function (friend_slug) {
		return lng.Data.Cache.get('friend-'+friend_slug);
	}

	var _toCache = function (array, field, prefix) {
		for (var i=0; i<array.length; i++) {
			lng.Data.Cache.set(prefix+array[i][field],array[i]);
		}
	}

	/**
	lng.Data.Sql.init({
	    name: 'places.mobile',
	    version: '0.5',
	    schema: [
	        {
	            name: 'myplaces',
	            drop: true,
	            fields: {
	              id: 'INTEGER PRIMARY KEY',
	              name: 'TEXT',
	              description: 'TEXT',
	              type: 'STRING',
	              done: 'INTEGER DEFAULT 0',
	              created_at: 'DATETIME'
	            }
	        },
	        {
	            name: 'cache',
	            drop: false,
	            fields: {
	                id: 'INTEGER PRIMARY KEY',
	                name: 'TEXT'
	            }
	        }
	    ]
	});
	**/

    return {
		userPlaces : _userPlaces,
		userFriends : _userFriends,
		userLocation : _userLocation,
		setUserPlaces : setUserPlaces,
		setUserFriends : setUserFriends,
		setFriendPlaces : setFriendPlaces,
		getFriendPlaces : getFriendPlaces,
		getPlace : getPlaceFromCache,
		getFriend : getFriendFromCache,
    }

})(LUNGO, App);