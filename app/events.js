App.Events = (function(lng, app, undefined) {

	/**
		Element: Login Button @ Login Page
		Event: tap
		Action: Sign In the user to enter.
	*/
	lng.dom('section#login a').tap(function(event) {
		var email = lng.dom('#login input[name=email]').val();
		var password = lng.dom('#login input[name=password]').val();
		App.Services.signin(email,password);
	});

	/**
		Element: Signout Button @ Place List
		Event: tap
		Action: Signout
	*/
	lng.dom('section#place-list a.button.logout').tap(function(event) {
		App.Services.signout();
	});
	
	/**
		Element: Map Button @ Place List
		Event: tap
		Action: Render the Map of the current place list.
	*/
	lng.dom('section#place-list a.mapbutton').tap(function(event) {
		App.View.Map.renderPlaceListMap(App.Data.userLocation,App.Data.userPlaces);
	});

	/**
		Element: Map Button @ Friend View
		Event: tap
		Action: Render the Map of the friends places.
	*/
	lng.dom('section#friend-view a.mapbutton').tap(function(event) {
		var slug = lng.dom(this).parent('section').attr('friend-slug');
		App.View.Map.renderPlaceListMap(App.Data.userLocation,App.Data.getFriendPlaces(slug),'friends');
	});

	/**
		Element: Small Map Frame @ Place View
		Event: tap
		Action: Render the full Map with navigational control
	*/
	lng.dom('.map.small.actionable').tap(function(event) {
		var id = lng.dom(this).parent('section').attr('place-id');
		App.View.Map.renderPlaceNavigationalMap(App.Data.getPlace(id));
		lng.Router.section('map');
	});

	/**
		Element: Friend Button @ Place List
		Event: tap
		Action: Go to Friends Section loading friends
	*/
	lng.dom('a.friendbutton').tap(function(event) {
		App.Services.loadUserFriends();
	});

	/**
		Element: Switch link @ Place Comments
		Event: tap
		Action: Switch between friends comments and all comments
	*/
	lng.dom('.place.comments .switch').tap(function(event) {
		App.View.switchComments('.place.comments');
	});

	/**
		Element: Places List Items (from server) @ Any Place List
		Event: tap
		Action: Go to Place View Section (loading information)
	*/
	lng.dom('li.place.selectable:not(.origin-google) .selectable').tap(function(event) {
		var place = lng.dom(this).parent('li.place');
		var id = place.attr('id').replace('place-','');
		App.View.createPlaceView(App.Data.getPlace(id));
		App.Services.loadPlaceInformation(id);
	});

	/**
		Element: Places List items (from Google) @ Any Place List
		Event: tap
		Action: Load information from Google.
	*/
	lng.dom('li.place.selectable.origin-google').tap(function(event) {
		var place = lng.dom(this);
		var id = place.attr('id').replace('place-','');
		App.Services.loadGooglePlaceInformation(id);
	});

	/**
		Element: Event Like
		Event: tap
		Action: Like / Unlike Place
	*/
	lng.dom('a.event.like').tap(function(event) {
		/** We identify if it's like or undo like depending on the color class */
		var is_like_action = lng.dom(this).children('.icon.star').hasClass('gray');
		var place = lng.dom(this).parent('.place');
		var id = place.attr('id').replace('place-','');
		if (is_like_action) {
			App.Services.doLike(id);
		} else {
			App.Services.doDislike(id);
		}
	});

	/**
		Element: Friends List Items @ Friends List
		Event: tap
		Action: Load Friends Places and go to Friend Places View
	*/
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
		if (search_query.length > 3) {
			EventSynchronizer.init('search-query', function() {
				console.error("Searching for "+search_query);
				App.Services.searchPlaces(search_query);
			},{ timeout : 1000 });
			lng.dom(this).addClass('blue');
		} else {
			EventSynchronizer.destroy('search-query');
			App.View.switchFromTo('#place-search #search-results','#place-search #nearby-results');
			lng.dom(this).addClass('red');
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

	/**
		Element: Textarea for comments
		Event: keyup
		Action: Change number of rows automatically

		We need to create it as function, as keyboard events in LUNGO are not automatically added to non existing elements.
	*/
	var addTextAreaKeyboardEvent = function (textarea) {
		lng.dom(textarea).on('keypress',function (event) {
			var element = lng.dom(this);
			/* Removing 10 px because of the existing padding (5 + 5) */
			element[0].style.height = (element[0].scrollHeight -10) + 'px';
			/* If the key pressed is the Enter */
			if (event.which == 13) {
				/* Disabling it to avoid future changes */
				element[0].disabled = true;
				/* Detecting the post_activity_id */
				var id = lng.dom(this).parent('section').attr('place-id');
				var post_activity_id = App.Data.getPlace(id).post_activity_id;
				/* Adding the comment (server request) */
				App.Services.addComment(post_activity_id, element.val());
				/* Returning false to avoid the Enter Character */
				return false;
			}
		});
	}

	/**
	 *
	 *  EVENT SYNCHRONIZER UTILITY 
	 *
	 *  Utility that helps to synchronize various events based on an id.
	 *  This way, you can configure a timer to trigger the function of a specific event and overwrite it
	 *  with the following calls if it has not been triggered.
	 *
	 **/
	var EventSynchronizer = (function(lng,app,undefined) {

		var _ongoing = [];

		/** Default configuration for the Synchronizer object **/
		var DEFAULT_CONFIG = {
			timeout : 0,
		};

		/**
		 *  When a new parameter is initialized, the previous ones with the same id are destroyed.
		 *  parameter event_id : the identifier of the event that allows to control
		 *                       future events of the same type
		 *  parameter call : the method to call
		 *  config : the configuration. Available options: timeout
		 */
		var init = function (event_id,call,config)
		{
			// Destroy previous requests with the same id
			destroy(event_id);
			// Build configuration object
			config = $$.mix(DEFAULT_CONFIG,config);
			// Build request synchronizer
			_ongoing[event_id] = {
				id : event_id,
				timer : setTimeout(call, config.timeout),
			};
		};

		/**
		 *  When the event is destroyed, the associated timers are cleared.
		 *  parameter event_id : the identifier of the event to destroy 
		 */
		var destroy = function (event_id)
		{
			var synchronizer = getSynchronizer(event_id);
			if (synchronizer != undefined) {
				clearTimeout(synchronizer.timer);
				_ongoing[event_id] = undefined;
			}
		};

		/**
		 *	parameter event_id : the identifier of the event to get the synchronizer
		 */
		var getSynchronizer = function (event_id)
		{
			return _ongoing[event_id];
		}

		return {
			init : init,
			destroy : destroy,
			synchronizer : getSynchronizer
		};

	})(LUNGO,App);
	
	return {
		addTextAreaKeyboardEvent : addTextAreaKeyboardEvent,
		EventSynchronizer : EventSynchronizer
	};

})(LUNGO, App);