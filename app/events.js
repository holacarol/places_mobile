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

	var createPlacesTapEvents = function () {
		console.error('Create Places Tap Events');
		lng.dom('section#place-list li').tap(function(event) {
			var place = lng.dom(this);
			console.error(place);
			lng.dom('section#place-view header span.title').html(place.attr('id'));
			lng.Router.section("place-view");
		})
	};

    return {
    	createPlacesTapEvents : createPlacesTapEvents
    }

})(LUNGO, App);