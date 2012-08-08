App.View = (function(lng, app, undefined) {

	/** MAP CONTROLLER OBJECT **/
	var Map = (function(lng, app, undefined) {

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

	    var renderApplicationMap = function()
		{
		    lng.Sugar.GMap.init({
		            el: '#map-fullview',
		            zoom: 14,
		            //type: 'HYBRID',
		            center: App.Data.userLocation,
		            overviewMapControl: true
		    });

			_placeMarkers(App.Data.userPlaces.myplaces,"user");
			_placeMarkers(App.Data.userPlaces.friends,"friends");
			_placeMarkers(App.Data.userPlaces.recommended,"recommended");
		}

		var renderPlaceMap = function(place)
		{
			console.error("Initializing map...");
			lng.Sugar.GMap.init({
		            el: '#map-placeview',
		            zoom: 14,
		            minZoom: 14,
		            maxZoom: 14,
		            //type: 'HYBRID',
		            center: place,
		            draggable: false,
		            disableDoubleClickZoom: true,

		    });
			console.error("Placing markers...");
			_placeMarker(place,"user");
		}

		var _placeMarkers = function (places, marker) {
		    for (var i=0; i<places.length; i++) {
				place = places[i];
				_placeMarker(place,markers[marker]);
				/*
				lng.Sugar.GMap.addMarker(
					{ latitude : place.latitude,
					  longitude : place.longitude },
					marker,
					false
				);
				*/
			};
		}

		var _placeMarker = function (place, marker) {
			lng.Sugar.GMap.addMarker(place,markers[marker],false);
		}

		return{
			renderApplicationMap : renderApplicationMap,
			renderPlaceMap : renderPlaceMap,
		}

	})(LUNGO, App);

	/** TEMPLATES **/
	/** 
	  *  Template for Places in the list 
	  */
	lng.View.Template.create('place-in-list',
		'<li id="place-{{id}}" class="place selectable" data-icon="pushpin">\
			<div class="onleft icon pushpin"></div>\
			<div class="onright"><a href="#" class="event like"><span class="icon star gray bigicon"></span></a></div>\
			<div><strong>{{title}}</strong>\
				<small>{{address.locality}}. {{address.country}}</small>\
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
		'<div id="place-{{id}}">\
			<div class="onright"><a class="event like">href="#"><span class="icon star yellow bigicon"></span></a></div>\
			<div class="onleft" class="icon pushpin smallicon"><span class="icon pushpin smallicon"></span></div>\
			<div class="place field">\
				<p>\
				{{address.streetAddress}}<br>\
				{{address.postalCode}}, {{address.locality}}. {{address.country}}\
			</div>\
			<div class"place field">\
				<span class="icon phone smallicon"></span><small>{{phone_number}}. {{url}}</small>\
			</div>\
		</div>'
	);

	/**
	 *  Function to create the place view to render in the 'place-view' section of the app.
	 *  parameter place the Place Object as returned as JSON from the server or retrieved from Cache
	 */
	var createPlaceView = function (place) {
		/** Change the title **/
		lng.dom('section#place-view header span.title').html(place.title);
		/** Remove old comments */
		lng.dom('#place-comments .list ul').html('');
		/** Render the description template **/
		lng.View.Template.render('section#place-view article#place-description .info', 'place-description', place);
		/** Render the small map for the place **/
		Map.renderPlaceMap(place);
		/** Mark if the place is liked or not **/
		markPlaceAsLiked(place.id,place.is_liked,'section#place-view div.info');
		/** Change view to the section 'place-view' **/
		lng.Router.section('place-view');
	}

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
	}

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
		var star = lng.dom(prefix+'li#place-'+place_id+' span.icon.star');
		if (like) {
			star.removeClass('gray').addClass('yellow');
		} else {
			star.removeClass('yellow').addClass('gray');
		}
	}

    return{
    	createPlaceView : createPlaceView,
    	switchComments : switchComments,
    	markPlaceAsLiked : markPlaceAsLiked,
    	markPlacesListAsLiked : markPlacesListAsLiked,
    	Map : Map
    }

})(LUNGO, App);