App.Data = (function(lng, app, undefined) {

	var Place = function (place) {

		var _original = place;

		var _getAddress = function ()
		{
			if (_isGoogle()) {
				var address = {
					country : "",
					formatted : (_original.vicinity!==undefined)?_original.vicinity:_original.formatted_address,
					locality : "",
					postalCode : "",
					region : "",
					streetAddress : (_original.vicinity!==undefined)?_original.vicinity:_original.formatted_address
				};
				if (_hasDetails()) {
					for (var i = 0; i < _original.address_components.length; i++ ) {
						var component = _original.address_components[i].types[0];
						var component_value = _original.address_components[i].long_name;
						if (component == "postal_code") {
							address.postalCode = component_value;
						} else if (component == "locality") {
							address.locality = component_value;
						} else if (component == "administrative_area_level_1" || component == "administrative_area_level_2") {
							address.region = component_value;
						}
					}

					address.country = _parseCountry(_original.formatted_address);
					address.formatted = _original.formatted_address;
					address.streetAddress = _parseStreetAddress(_original.formatted_address,address.locality,address.postalCode);
				}
				return address;
			} else {
				return _original.address;
			}
		};

		var _parseCountry = function (formatted_address) {
		    var lastComma = formatted_address.lastIndexOf(", ");
		    if (lastComma == -1) {
		    	lastComma = -2;
		    }
		    return formatted_address.substring(lastComma + 2);
		};

		var _parseStreetAddress = function (formatted_address,locality,postalcode)
		{
			var city = formatted_address.lastIndexOf(locality);
			var postal = formatted_address.lastIndexOf(postalcode);
			var cutindex;
			if (postal == -1 || city < postal) {
				cutindex = city;
			} else {
				cutindex = postal;
			}
			return formatted_address.substring(0, cutindex - 2);
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

		var equals = function (place) {
			return ((title == place.title) && 
					(	(address.streetAddress.indexOf(place.address.streetAddress)>=0) ||
						(place.address.streetAddress.indexOf(address.streetAddress)>=0)
					));
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
		var origin = (_isGoogle())?"google":"myplaces";
		var has_details = _hasDetails();
		var comments_disabled = (_isGoogle())?true:false;

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
			reference : reference,
			origin : origin,
			equals : equals,
			has_details : has_details,
			comments_disabled : comments_disabled
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

	var putPlacesInCache = function (places_array) {
		_toCache(places_array,'id','place-');
	}

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
		putPlaces : putPlacesInCache,
		getFriend : getFriendFromCache,
		Place : Place
	};

})(LUNGO, App);