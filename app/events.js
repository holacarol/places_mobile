App.Events = (function(lng, app, undefined) {

	lng.dom('section#login a').tap(function(event) {
    	App.Services.initUser();
	});

	lng.dom('a.mapbutton').tap(function(event) {
    	App.Services.loadMap();
	});

	lng.dom('a.friendbutton').tap(function(event) {
    	App.Services.loadUserFriends();
	});

	lng.dom('#place-comments .switch').tap(function(event) {
		App.View.switchComments('#place-comments');
	});

	var createPlacesTapEvents = function () {
		console.error('Create Places Tap Events');
		lng.dom('section#place-list li').tap(function(event) {
			var place = lng.dom(this);
			console.error(place);
			App.Services.loadPlaceInformation(place.attr('id'));
			App.View.createPlaceView(App.Data.getPlace(place.attr('id')));
		})
	};

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
    	createPlacesTapEvents : createPlacesTapEvents
    }

})(LUNGO, App);