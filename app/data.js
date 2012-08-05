App.Data = (function(lng, app, undefined) {

	var _userPlaces = new Object();
	var _userFriends = new Object();
	var _userLocation = { latitude : 0, longitude: 0};

	var setUserPlaces = function (places) {
		App.Data.userPlaces = places;
		_toCache(places.myplaces,'id','place_');
		_toCache(places.friends,'id','place_');
		_toCache(places.recommended,'id','place_');
	}

	var setUserFriends = function (friends) {
		App.Data.userFriends = friends;
		_toCache(friends,'slug','friend_');
	}

	var getPlaceFromCache = function (place_id) {
		return lng.Data.Cache.get('place_'+place_id);
	}

	var getFriendFromCache = function (friend) {
		return lng.Data.Cache.get('friend_'+friend);
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
		getPlace : getPlaceFromCache
    }

})(LUNGO, App);