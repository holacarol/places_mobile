App.Events = (function(lng, app, undefined) {

	lng.dom('section#login a').tap(function(event) {
    	App.Services.initUser();
	});

	lng.dom('a.mapbutton').tap(function(event) {
    	App.Services.loadMap();
	});

    return {

    }

})(LUNGO, App);