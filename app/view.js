App.View = (function(lng, app, undefined) {

	/** MAP CONTROLLER OBJECT **/
	var Map = (function(lng, app, undefined) {

		var DEFAULT_MARKER = "user";

		var markers = 
		{
			user: {
				url: 'assets/images/mapmarker22x32.png',
				size: {x: 22, y: 37},
				anchor: {x: 11, y: 37}
			},
			friends: {
				url: 'assets/images/greenmarker22x32.png',
				size: {x: 22, y: 37},
				anchor: {x: 11, y: 37}
			},
			recommended: {
				url: 'assets/images/orangemarker22x32.png',
				size: {x: 22, y: 37},
				anchor: {x: 11, y: 37}
			}
		};

		var renderPlaceListMap = function(center, places, type)
		{
			lng.Sugar.GMap.init({
					el: '#map-fullview',
					zoom: 14,
					//type: 'HYBRID',
					center: center,
					overviewMapControl: true
			});

			if (lng.Core.toType(places) == 'object') {
				_placeMarkers(places.myplaces,"user");
				_placeMarkers(places.friends,"friends");
				_placeMarkers(places.recommended,"recommended");
			}

			if (lng.Core.toType(places) == 'array') {
				_placeMarkers(places,type);
			}
		}

		var renderPlaceNavigationalMap = function(place) {
			lng.Sugar.GMap.init({
					el: '#map-fullview',
					zoom: 14,
					center: place,
					overviewMapControl: true
			});
			_placeMarker(place,'user');
		}

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
			_placeMarker(place,"user");
		}

		var _placeMarkers = function (places_array, marker) {
			for (var i=0; i<places_array.length; i++) {
				place = places_array[i];
				_placeMarker(places_array,marker);
			};
		}

		var _placeMarker = function (place, marker) 
		{
			lng.Sugar.GMap.addMarker(place,_getMarker(marker),false);
		}

		var _getMarker = function (type) 
		{
			type = (type==undefined)?"user":type;
			marker = (markers[type]!=undefined)?markers[type]:markers[DEFAULT_MARKER];
			return marker;
		}

		return{
			renderPlaceListMap : renderPlaceListMap,
			renderPlaceMap : renderPlaceMap,
			renderPlaceNavigationalMap : renderPlaceNavigationalMap,
		}

	})(LUNGO, App);

	/** ERROR MESSAGES */
	var ERROR_MESSAGES = {

		unauthorized : "",
		invalid : "Wrong username and password. Please try again."

	};

	/** TEMPLATES **/
	/** 
	  *  Template for Places in the list 
	  */
	lng.View.Template.create('place-in-list',
		'<li id="place-{{id}}" class="place selectable">\
			<div class="onright"><a href="#" class="event like"><span class="icon star gray bigicon"></span></a></div>\
			<div class="selectable">\
				<div class="onleft icon pushpin"></div>\
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
						<a href="{{url}}">{{url}}</a>\
					</div>\
				<div>\
			</div>\
		</div>'
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
			var message = ERROR_MESSAGES[error];
			if (message != undefined && message != '') {
				lng.dom('#login .message.error').html(message);
				lng.dom('#login .message.error').removeClass('no-display');
			}
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