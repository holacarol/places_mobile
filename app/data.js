App.Data = (function(lng, app, undefined) {

	var Place = function (place) {

		var _original = place;

		// address: Object
		// 	.country: "French Southern Territories"
		// 	.formatted: "70749 Wyman Light↵49131 East Candidoview (Colorado)↵French Southern Territories"
		// 	.id: 1
		// 	.locality: "East Candidoview"
		// 	.postalCode: "49131"
		// 	.region: "Colorado"
		// 	.streetAddress: "70749 Wyman Light"
		// id: 1
		// distance: 0.0993873022160798
		// is_liked: true
		// latitude: 30.6238
		// longitude: -91.4145
		// phone_number: "915 41 80 23"
		// post_activity_id: 3
		// title: "Kshlerin, Beahan and Ankunding"
		// url: "http://prosaccokerluke.info"

		var _getAddress = function ()
		{
			if (_isGoogle()) {
				var address = {
					country : "",
					formatted : _original.vicinity,
					locality : "",
					postalCode : "",
					region : "",
					streetAddress : _original.vicinity
				};
				if (_hasDetails()) {
					/** TODO: Check how the server is doing it **/
					address.country = _original.address_components[5];
					address.formatted = _original.formatted_address;
					address.locality = _original.address_components[2];
					address.postalCode = _original.address_components[6];
					address.region = _original.address_components[3];
					address.streetAddress = _original.address_components[1] + ", " + _original.address_components[0];
				}
				return address;
			} else {
				return _original.address;
			}
		};

		var _getDistance = function ()
		{
			var amount = 0;
			var formatted = "";
			if (_original.distance !== undefined) {
				amount = _original.distance;
				formatted = _formatDistance(amount);
			} else {
				amount = _calculateDistance(App.Data.userLocation.latitude,
											App.Data.userLocation.longitude,
											_getLatitude(),
											_getLongitude());
				formatted = _formatDistance(amount);
			}
			return {
				amount : amount,
				formatted : formatted
			};
		};

		var _isLiked = function ()
		{
			if (_original.is_liked) {
				return true;
			}
			return false;
		};

		var _getLatitude = function ()
		{
			if (_isGoogle()) {
				return _original.geometry.location.lat();
			} else {
				return _original.latitude;
			}
		};

		var _getLongitude = function ()
		{
			if (_isGoogle()) {
				return _original.geometry.location.lng();
			} else {
				return _original.longitude;
			}
		};

		var _getPhoneNumber = function ()
		{
			if (_hasDetails()) {
				return _original.formatted_phone_number;
			} else if (_isGoogle()) {
				return "";
			} else {
				return _original.phone_number;
			}
		};

		var _getURL = function ()
		{
			if (_hasDetails()) {
				return _original.url;
			} else if (_isGoogle()) {
				return "";
			} else {
				return _original.url;
			}
		};

		var _getPostId = function ()
		{
			if (_isGoogle()) {
				return -1;
			} else {
				return _original.post_activity_id;
			}
		};

		var _getTitle = function ()
		{
			if (_isGoogle()) {
				return _original.name;
			} else {
				return _original.title;
			}
		};

		var _getGoogleReference = function () {
			if (_isGoogle()) {
				return _original.reference;
			} else {
				return "";
			}
		}

		var _getId = function () {
			return _original.id;
		}

		var _calculateDistance = function (lat1,lng1,lat2,lng2)
		{
			var radlat1 = Math.PI * lat1/180;
			var radlat2 = Math.PI * lat2/180;
			var radlon1 = Math.PI * lng1/180;
			var radlon2 = Math.PI * lng2/180;
			var theta = lng1-lng2;
			var radtheta = Math.PI * theta/180;
			var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
			dist = Math.acos(dist);
			dist = dist * 180/Math.PI;
			dist = dist * 60 * 1.1515;
			dist = dist * 1.609344;
			return dist;
		};

		var _formatDistance = function (distance)
		{
			if (distance === undefined) {
				return "";
			}
			if (distance < 2) {
				return Math.round(distance * 1000) + ' meters';
			} else {
				return Math.round(distance) + ' km';
			}
		};

		var _isGoogle = function () {
			if (_original.reference !== undefined) {
				return true;
			}
			return false;
		};

		var _hasDetails = function () {
			if (_original.address_components !== undefined) {
				return true;
			}
			return false;
		};

		var address = _getAddress();
		var id = _getId();
		var distance = _getDistance();
		var is_liked = _isLiked();
		var latitude = _getLatitude();
		var longitude = _getLongitude();
		var phone_number = _getPhoneNumber();
		var post_activity_id = _getPostId();
		var title = _getTitle();
		var url = _getURL();
		var reference = _getGoogleReference();

		return {
			address : address,
			id : id,
			distance : distance,
			is_liked : is_liked,
			latitude: latitude,
			longitude : longitude,
			phone_number : phone_number,
			post_activity_id : post_activity_id,
			title : title,
			url : url,
			reference : reference
		};
	};

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
		getFriend : getFriendFromCache,
		Place : Place
    };

})(LUNGO, App);