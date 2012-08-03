App.Data = (function(lng, app, undefined) {

	var _userPlaces = new Object();
	var _userFriends = new Object();
	var _userLocation = { latitude : 0, longitude: 0};

    return {
		userPlaces : _userPlaces,
		userFriends : _userFriends,
		userLocation : _userLocation,
    }

})(LUNGO, App);