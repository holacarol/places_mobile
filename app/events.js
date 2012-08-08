App.Events = (function(lng, app, undefined) {

	lng.dom('section#login a').tap(function(event) {
    	App.Services.initUser();
	});

	lng.dom('a.mapbutton').tap(function(event) {
    	App.View.Map.renderPlaceListMap(App.Data.userLocation,App.Data.userPlaces);
	});

	lng.dom('.map.small.actionable').tap(function(event) {
		console.error("tap on .map.small.actionable");
		var place = lng.dom(this).siblings('.place.info').children().first();
		console.error(place);
		var id = place.attr('id').replace('place-','');
		console.error(id);
    	App.View.Map.renderPlaceNavigationalMap(App.Data.getPlace(id));
    	console.error('Routing to map');
    	lng.Router.section('map');
    	console.error('tap ended');
	});


	lng.dom('a.friendbutton').tap(function(event) {
    	App.Services.loadUserFriends();
	});

	lng.dom('#place-comments .switch').tap(function(event) {
		App.View.switchComments('#place-comments');
	});

	lng.dom('section#place-list li').tap(function(event) {
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

/**
	var createPlacesTapEvents = function (container) {
		var prefix = '';
		if (container) { prefix = container + ' '; }
		console.error('Create Places Tap Events');
		lng.dom(prefix + 'li').tap(function(event) {
			var place = lng.dom(this);
			console.error(place);
			var id = place.attr('id').replace('place-','');
			App.Services.loadPlaceInformation(id);
			App.View.createPlaceView(App.Data.getPlace(id));
		})
	};

	var createLikeTapEvents = function (container) {
		var prefix = '';
		if (container) { prefix = container + ' '; }
		lng.dom(prefix+'a.event.like').tap(function(event) {
			var place = lng.dom(this).parent().parent();
			console.error(place);
			var id = place.attr('id').replace('place-','');
			console.error("likes place "+id);
		})
	}
**/
/**
	var createFriendsTapEvents = function () {
		console.error('Create Places Tap Events');
		lng.dom('section#friend-list li').tap(function(event) {
			var friend = lng.dom(this);
			console.error(friend);
			App.Services.load
			App.View.createPlaceView(place.attr('id'));
			lng.Router.section("place-view");
		})
	};
**/

    return {
    	/**
    	createPlacesTapEvents : createPlacesTapEvents,
    	createLikeTapEvents : createLikeTapEvents,
    	**/
    }

})(LUNGO, App);