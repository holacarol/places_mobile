App.Data = (function(lng, app, undefined) {

	var _userPlaces = {};
	var _userFriends = {};
	var _userLocation = { latitude : 0, longitude: 0};

	var setUserPlaces = function (places) {
		App.Data.userPlaces = places;
		_toCache(places.myplaces,'id','place-');
		_toCache(places.friends,'id','place-');
		_toCache(places.recommended,'id','place-');
	};

	var setUserFriends = function (friends) {
		App.Data.userFriends = friends;
		_toCache(friends,'slug','friend-');
	};

	var setFriendPlaces = function (friend_slug, places) {
		lng.Data.Cache.set('friend-'+friend_slug+'-places',places);
	};

	var getFriendPlaces = function (friend_slug) {
		return lng.Data.Cache.get('friend-'+friend_slug+'-places');
	};

	var getPlaceFromCache = function (place_id) {
		return lng.Data.Cache.get('place-'+place_id);
	};

	var putPlaceInCache = function (place) {
		lng.Data.Cache.set('place-'+place.id,place);
	};

	var getFriendFromCache = function (friend_slug) {
		return lng.Data.Cache.get('friend-'+friend_slug);
	};

	var _toCache = function (array, field, prefix) {
		for (var i=0; i<array.length; i++) {
			lng.Data.Cache.set(prefix+array[i][field],array[i]);
		}
	};

    return {
		userPlaces : _userPlaces,
		userFriends : _userFriends,
		userLocation : _userLocation,
		setUserPlaces : setUserPlaces,
		setUserFriends : setUserFriends,
		setFriendPlaces : setFriendPlaces,
		getFriendPlaces : getFriendPlaces,
		getPlace : getPlaceFromCache,
		putPlace : putPlaceInCache,
		getFriend : getFriendFromCache
    };

})(LUNGO, App);