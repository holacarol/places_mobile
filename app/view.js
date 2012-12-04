App.View = (function(lng, app, undefined) {

	/** MAP CONTROLLER OBJECT **/
	var Map = (function(lng, app, undefined) {

		var DEFAULT_MARKER = "user";

		var markers =
		{
			me: {
				url:'assets/images/bluedot.png',
				size: {x: 16, y: 16},
				anchor: {x: 8, y: 8}
			},
			user: {
				//url: 'assets/images/mapmarker22x32.png',
				url: 'assets/images/blue4.png',
				size: {x: 24, y: 33},
				anchor: {x: 12, y: 33}
			},
			friends: {
				//url: 'assets/images/greenmarker22x32.png',
				url: 'assets/images/green4.png',
				size: {x: 24, y: 33},
				anchor: {x: 12, y: 33}
			},
			recommended: {
				//url: 'assets/images/orangemarker22x32.png',
				url: 'assets/images/red4.png',
				size: {x: 24, y: 33},
				anchor: {x: 12, y: 33}
			},
			shadow: {
				url: 'assets/images/shadow.png',
				size: {x:32, y:33},
				anchor: {x:12, y:33}
			}
		};

		// Create a single instance of the InfoWindow object which will be shared
		// by all Map objects to display information to the user.
		var	infoWindow = new google.maps.InfoWindow();

		var renderPlaceListMap = function(center, places, type)
		{
			lng.Sugar.GMap.init({
					el: '#map-fullview',
					zoom: 14,
					//type: 'HYBRID',
					center: center,
					overviewMapControl: true
			});

			// Make the info window close when clicking anywhere on the map.
			google.maps.event.addListener(lng.Sugar.GMap.instance(), 'click', _closeInfoWindow);

			//Place a marker at my own position
			//_placeMarker(center,'me',false);
			var marker = lng.Sugar.GMap.addMarker(center,_getMarker('me'),null,false);

			//Draw an accuracy circle around my position
			var circle = new google.maps.Circle({
				center: new google.maps.LatLng(center.latitude, center.longitude),
				radius: App.Data.userLocation.accuracy,
				map: lng.Sugar.GMap.instance(),
				fillColor: "#1464FC",
				fillOpacity: 0.1,
				strokeColor: "#1464FC",
				strokeOpacity: 0.6,
				strokeWeight: 2
			});

			if (lng.Core.toType(places) == 'object') {
				_placeMarkers(places.myplaces,"user");
				_placeMarkers(_filterPlaces(places.friends, places.myplaces),"friends");
				_placeMarkers(_filterPlaces(places.recommended, places.friends),"recommended");
			}

			if (lng.Core.toType(places) == 'array') {
				_placeMarkers(places,type);
			}
		};

		var renderPlaceNavigationalMap = function(place) {
			lng.Sugar.GMap.init({
					el: '#map-fullview',
					zoom: 14,
					center: place,
					overviewMapControl: true
			});

			// Make the info window close when clicking anywhere on the map.
			google.maps.event.addListener(lng.Sugar.GMap.instance(), 'click', _closeInfoWindow);

			_placeMarker(place,'user',true);

		};

		var renderPlaceMap = function(place)
		{
			lng.Sugar.GMap.init({
					el: '#map-placeview',
					zoom: 14,
					minZoom: 14,
					maxZoom: 14,
					center: place,
					draggable: false,
					disableDoubleClickZoom: true

			});
			_placeMarker(place,'user',false);
		};

		var _placeMarkers = function (places_array, marker) {
			for (var i=0; i<places_array.length; i++) {
				var place = places_array[i];
				_placeMarker(place,marker,true);
			}
		};

		var _placeMarker = function (place, marker_type, enable_infowindow)
		{
			var marker = lng.Sugar.GMap.addMarker(place,_getMarker(marker_type), _getMarker('shadow'),false);

			if (enable_infowindow) {
				// Register event listeners to each marker to open a shared info
				// window displaying the marker's position when clicked or dragged.
				google.maps.event.addListener(marker, 'click', function() {
					_openInfoWindow(marker, place);
				});
			}
		};


		/**
		 * Filter places not being in other array. This is used to show only
		 * friends' places not being in user's and recommended no being
		 * in friends'
		 */
		var _filterPlaces = function(places_array, filter_array) {
			return places_array.filter(function(p) {
				for(var i = 0; i < filter_array.length; i++) {
					if (filter_array[i].id === p.id) {
						return false;
					}
				}
				return true;
			});
		};

		var _getMarker = function (type)
		{
			type = (type===undefined)?"user":type;
			marker_type = (markers[type]!==undefined)?markers[type]:markers[DEFAULT_MARKER];
			return marker_type;
		};

		/**
		* Called when clicking anywhere on the map and closes the info window.
		*/
		var _closeInfoWindow = function() {
			infoWindow.close();
		};

		/**
		* Opens the shared info window, anchors it to the specified marker, and
		* displays the marker's position as its content.
		*/
		var _openInfoWindow = function(marker, place) {
			infoWindow.setContent([
				lng.View.Template.markup('place-infowindow', place)
			].join(''));
			infoWindow.open(lng.Sugar.GMap.instance(), marker);
		};


		return{
			renderPlaceListMap : renderPlaceListMap,
			renderPlaceMap : renderPlaceMap,
			renderPlaceNavigationalMap : renderPlaceNavigationalMap
		};

	})(LUNGO, App);

	/** TEMPLATES **/
	/**
	  *  Template for Places in the list 
	  */
	lng.View.Template.create('place-in-list',
		'<li id="place-{{id}}" class="place selectable">\
			<div class="onright"><a href="#" class="event like"><span class="icon star gray bigicon"></span></a></div>\
			<div class="selectable">\
				<div class="onleft icon placepin"></div>\
				<div><strong>{{title}}</strong>\
					<small>{{address.locality}}. {{address.country}}</small>\
				</div>\
			</div>\
		 </li>'
	);

	/** 
	  *  Template for Places in nearby list (where the distance appears) 
	  */
	lng.View.Template.create('place-nearby-in-list',
		'<li id="place-{{id}}" class="place selectable origin-{{origin}}">\
			<div class="selectable">\
				<div class="onleft icon pushpin"></div>\
				<div><strong>{{title}}</strong>\
					<small>{{address.streetAddress}}. ({{distance.formatted}})</small>\
				</div>\
			</div>\
		 </li>'
	);

	/** 
	  *  Template for friends in the list 
	  */
	lng.View.Template.create('friend-in-list',
		'<li id="user-{{slug}}" class="friend selectable">\
			<div class="onright"><span class="icon right"></span></div>\
			<img src="{{image.thumb}}" class="thumbnail"></img>\
			<strong>{{name}}</strong>\
			<small>{{slug}}</small>\
		 </li>'
	);

	/**
	 *  Template for comment box
	 */
	lng.View.Template.create('comments-box',
		'<div class="right-aligned">\
				<span class="message loading">Loading comments...</span>\
				<span class="message none hidden">This place has no comments</span>\
				<a href="#" class="link switch friends hidden">See only friends comments</a>\
			</div>\
			<div id="list" class="list comments indented">\
				<ul>\
					<li class="comment add">\
						<textarea placeholder="Type your comment" class="textarea"></textarea>\
					</li>\
				</ul>\
			 </div>'
	);

	/** 
	  *  Template for comments in a place 
	  */
	lng.View.Template.create('comment',
		'<li class="comment {{type}}">\
			<img src="{{thumb}}" class="thumbnail"></img>\
			<small>{{author.name}}</small>\
			<span class="text">"{{text}}"</span>\
		 </li>'
	);

	/** 
	  *  Template for description of a place 
	  */
	lng.View.Template.create('place-description',
		'<div id="place-{{id}}" class="place">\
			<div class="onright"><a class="event like"><span class="icon star yellow bigicon"></span></a></div>\
			<div>\
				<div class="address info text">\
					<div class="onleft iconset"><span class="icon pushpin bigicon"></span></div>\
					<div>\
						<p>\
						{{address.streetAddress}}<br>\
						{{address.postalCode}}, {{address.locality}}. {{address.country}}\
					</div>\
				</div>\
				<div class="contact info text">\
					<div class="onleft iconset"><span class="icon phone bigicon"></span></div>\
					<div>\
						<p>\
						{{phone_number}}<br>\
						<a href="{{url}}">{{url_pretty}}</a>\
					</div>\
				<div>\
			</div>\
		</div>'
	);

	/**
	 * Template for infowindow on marker click
	 */
	lng.View.Template.create('place-infowindow',
		'<div class="list"><ul>\
			<li id="place-{{id}}" class="place selectable">\
				<div class="selectable">\
					<div><strong>{{title}}</strong>\
						<small>{{address.streetAddress}}</small>\
					</div>\
				</div>\
			 </li>\
		 </ul></div>'
	);

	/**
	 *  Placeholder for things required to be initialized for the proper viewing.
	 */
	var _initView = function () {
	}

	var requestLogin = function (error) {
		/** Show the login form **/
		lng.dom('#login div.form').show();
		/** Redirect to login view **/
		lng.Router.back('login');
		/** Display error message if adequate **/
		if (error != undefined && error != '') {
			lng.dom('#login .message.error').html(error);
			lng.dom('#login .message.error').removeClass('no-display');
		} else {
			lng.dom('#login .message.error').addClass('no-display');
		}
	}

	/**
	 *  Function to create the place view to render in the 'place-view' section of the app.
	 *  parameter place the Place Object as returned as JSON from the server or retrieved from Cache
	 */
	var createPlaceView = function (place) {
		/** Change the title **/
		lng.dom('section#place-view header span.title').html(place.title);
		/** Identifying the place **/
		lng.dom('section#place-view').attr('place-id',place.id);
		/** Comments capacities */
		if (place.comments_disabled) {
			/** Clean the comments area from previous places */
			lng.dom('section#place-view article#place-description .comments').html('');
		} else {
			/** Remove old comments and reset view */
			lng.View.Template.render('section#place-view article#place-description .comments', 'comments-box', {});
			/** Add the events to the text area */
			App.Events.addTextAreaKeyboardEvent('section#place-view article#place-description .comments textarea');
		}
		/** Render the description template **/
		if (place.url.indexOf('plus.google.com')>0) {
			place.url_pretty = 'Google+ site';
		}
		else if (place.url.length > 35) {
			place.url_pretty = place.url.substring(0,35) + '...';
		} else {
			place.url_pretty = place.url;
		}
		lng.View.Template.render('section#place-view article#place-description .info', 'place-description', place);
		/** Render the small map for the place **/
		Map.renderPlaceMap(place);
		/** Mark if the place is liked or not **/
		markPlaceAsLiked(place.id,place.is_liked,'section#place-view div.info');
		/** Change view to the section 'place-view' **/
		lng.Router.section('place-view');
	};

	/**
	 *  Function to switch the view of comments from 'friends' to 'all'
	 *  parameter container the selector for the container where the comments are.
	 */
	var switchComments = function (container) 
	{

		var switcher = lng.dom(container+' a.switch');
		if (switcher.hasClass('friends')) {
			lng.dom(container+' .list li.other').hide();
			switcher.removeClass('friends').addClass('all');
			switcher.html('See all comments');
		}
		else {
			lng.dom(container+' .list li.other').show();
			switcher.removeClass('all').addClass('friends');
			switcher.html('See only friends comments');
		}
	};

	/**
	 *  Function to switch from one view to another inside the same article
	 */
	var switchFromTo = function (view_from, view_to)
	{
		lng.dom(view_from).hide();
		lng.dom(view_to).show();
	};

	/**
	 *  To clear a comments text area, basically it renders it again.
	 *  TOCHANGE: It's a little bit dirty to do it directly without template.
	 */
	var clearTextArea = function (container)
	{
		lng.dom(container).html('<textarea placeholder="Type your comment" class="textarea"></textarea>');
	};

	/**
	 *  Function to mark the "i like" stars of an array of places.
	 *  parameter places the array of Place objects.
	 *  container the selector for the container
	 */
	var markPlacesListAsLiked = function (places, container) 
	{
		for (var i=0; i<places.length; i++) {
			var place = places[i];
			if (place.is_liked) {
				markPlaceAsLiked(place.id,true,container);
			}
		}
	}

	/**
	 *  Function to mark the "i like" star of one single place.
	 *  parameter place_id the id for the place that will identify where is the star
	 *  parameter like true if its the place is liked, false otherwise
	 *  container the selector for the container
	 */
	var markPlaceAsLiked = function (place_id, like, container) 
	{
		var prefix = '';
		if (container) { prefix = container + ' '; }
		// console.error(prefix+'li#place-'+place_id+' span.icon.star');
		var star = lng.dom(prefix+'#place-'+place_id+' .icon.star');
		if (like) {
			star.removeClass('gray').addClass('yellow');
		} else {
			star.removeClass('yellow').addClass('gray');
		}
	}

	/**
	 *  Function to create the list of places of a friend.
	 *  parameter user the User Object of one of the friends.
	 */
	var createFriendPlacesView = function (user)
	{
		/** Change the title of the page **/
		lng.dom('section#friend-view header span.title').html('Places '+user.name+' likes');
		/** Identify the friend slug (for the rest of the identification purposes) **/
		lng.dom('section#friend-view').attr('friend-slug',user.slug);
		/** Remove old information */
		lng.dom('#friend-places-list ul').html('');
		/** Change view to the section 'place-view' **/
		lng.Router.section('friend-view');
	}

	var addPlaceToList = function (place, list) {
		/** Set the list possibilities **/
		if (list !== undefined && (list == 'friends' || list == 'recommended')) { 
			list = '#list-'+list;
		} else {
			list = '#list-mine';
		}
		var exists = (lng.dom(list+' #place-'+place.id).length>0);
		/** If it doesnt exist we append the new element**/
		if (!exists) {
			lng.View.Template.List.append({
				el: list,
				template: "place-in-list",
				data: [place]
			});
		}
	}

	/** INITIALIZATION **/
	_initView();

	return{
		requestLogin : requestLogin,
		createPlaceView : createPlaceView,
		switchComments : switchComments,
		switchFromTo : switchFromTo,
		clearTextArea : clearTextArea,
		markPlaceAsLiked : markPlaceAsLiked,
		markPlacesListAsLiked : markPlacesListAsLiked,
		createFriendPlacesView : createFriendPlacesView,
		addPlaceToList : addPlaceToList,
		Map : Map
	}

})(LUNGO, App);