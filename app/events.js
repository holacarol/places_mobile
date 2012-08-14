App.Events = (function(lng, app, undefined) {

	lng.dom('section#login a').tap(function(event) {
		var email = lng.dom('#login input[name=email]').val();
		var password = lng.dom('#login input[name=password]').val();
		App.Services.signin(email,password);
	});

	lng.dom('section#place-list a.mapbutton').tap(function(event) {
		App.View.Map.renderPlaceListMap(App.Data.userLocation,App.Data.userPlaces);
	});

	lng.dom('section#friend-view a.mapbutton').tap(function(event) {
		var slug = lng.dom(this).parent('section').attr('friend-slug');
		App.View.Map.renderPlaceListMap(App.Data.userLocation,App.Data.getFriendPlaces(slug),'friends');
	});

	lng.dom('.map.small.actionable').tap(function(event) {
		var id = lng.dom(this).parent('section').attr('place-id');
		App.View.Map.renderPlaceNavigationalMap(App.Data.getPlace(id));
		lng.Router.section('map');
	});

	lng.dom('a.friendbutton').tap(function(event) {
		App.Services.loadUserFriends();
	});

	lng.dom('.place.comments .switch').tap(function(event) {
		App.View.switchComments('.place.comments');
	});

	lng.dom('li.place.selectable:not(.origin-google) .selectable').tap(function(event) {
		var place = lng.dom(this).parent('li.place');
		var id = place.attr('id').replace('place-','');
		App.View.createPlaceView(App.Data.getPlace(id));
		App.Services.loadPlaceInformation(id);
	});

	lng.dom('li.place.selectable.origin-google').tap(function(event) {
		var place = lng.dom(this);
		var id = place.attr('id').replace('place-','');
		App.Services.loadGooglePlaceInformation(id);
	});

	lng.dom('a.event.like').tap(function(event) {
		/** We identify if it's like or undo like depending on the color class */
		var is_like_action = lng.dom(this).children('.icon.star').hasClass('gray');
		var place = lng.dom(this).parent().parent();
		var id = place.attr('id').replace('place-','');
		if (is_like_action) {
			App.Services.doLike(id);
		} else {
			App.Services.doDislike(id);
		}
	});

	lng.dom('li.friend.selectable').tap(function(event) {
		var friend = lng.dom(this);
		var slug = friend.attr('id').replace('user-','');
		App.View.createFriendPlacesView(App.Data.getFriend(slug));
		App.Services.loadFriendPlaces(slug);
	});

	/**
		Element: Search Box @ Place Search
		Event: keyup
		Action: Filter list if more than 5 characters in the field
	*/
	lng.dom('#place-search input[type=search]').on('keyup',function (event) {
		var search_query = lng.dom(this).val();
		if (search_query.length > 4) {
			console.error("Searching for"+search_query);
		}
	});

	/**
		Element: Search for a Place button
		Event: tap
		Action: load nearby places
	*/
	lng.dom('a[href="#place-search"]').tap(function(event){
		App.Services.loadNearbyPlaces();
	});
	
	return {
	};

})(LUNGO, App);