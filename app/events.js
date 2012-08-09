App.Events = (function(lng, app, undefined) {

	lng.dom('section#login a').tap(function(event) {
		var email = lng.dom('#login input[name=email]').val();
		var password = lng.dom('#login input[name=password]').val();
		App.Services.signin(email,password);
    	// App.Services.initUser();
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

	lng.dom('li.place.selectable').tap(function(event) {
		var place = lng.dom(this);
		// console.error(place);
		var id = place.attr('id').replace('place-','');
		App.Services.loadPlaceInformation(id);
		App.View.createPlaceView(App.Data.getPlace(id));
	});

	lng.dom('a.event.like').tap(function(event) {
		var place = lng.dom(this).parent().parent();
		// console.error(place);
		var id = place.attr('id').replace('place-','');
		// console.error("likes place "+id);
	});

	lng.dom('li.friend.selectable').tap(function(event) {
		var friend = lng.dom(this);
		var slug = friend.attr('id').replace('user-','');
		App.Services.loadFriendPlaces(slug);
		App.View.createFriendPlacesView(App.Data.getFriend(slug));
	})

    return {
    	/**
    	createPlacesTapEvents : createPlacesTapEvents,
    	createLikeTapEvents : createLikeTapEvents,
    	**/
    }

})(LUNGO, App);