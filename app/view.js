App.View = (function(lng, app, undefined) {

	/** Template for Places in the list **/
	
	lng.View.Template.create('place-in-list',
		'<li id="{{id}}" class="place selectable" data-icon="pushpin">\
			<div class="onleft icon pushpin"></div>\
			<div class="onright"><a href="#"><span class="icon star yellow bigicon"></span></a></div>\
			<div><strong>{{title}}</strong>\
				<small>{{address.locality}}. {{address.country}}</small>\
			</div>\
		 </li>'
	);

	lng.View.Template.create('friend-in-list',
		'<li id="{{slug}}" class="friend selectable">\
			<div class="onright"><span class="icon right"></span></div>\
			<img src="{{image.thumb}}" class="thumbnail"></img>\
			<strong>{{name}}</strong>\
			<small>{{slug}}</small>\
		 </li>'
	);

	lng.View.Template.create('comment',
		'<li class="comment {{type}}">\
			<img src="{{thumb}}" class="thumbnail"></img>\
			<small>{{author.name}}</small>\
			<span class="text">"{{text}}"</span>\
		 </li>'
	);

	lng.View.Template.create('place-description',
		'<div class="onright"><a href="#"><span class="icon star yellow bigicon"></span></a></div>\
		<div class="onleft" class="icon pushpin smallicon"><span class="icon pushpin smallicon"></span></div>\
		<div class="place field">\
			<p>\
			{{address.streetAddress}}<br>\
			{{address.postalCode}}, {{address.locality}}. {{address.country}}\
		</div>\
		<div class"place field">\
			<span class="icon phone smallicon"></span><small>{{phone_number}}. {{url}}</small>\
		</div>'
	);

	var createPlaceView = function (place) {
		lng.dom('section#place-view header span.title').html(place.title);
		lng.dom('#place-comments .list ul').html('');
		lng.View.Template.render('section#place-view article#place-description .info', 'place-description', place);
		App.Services.renderPlaceMap(place);
		lng.Router.section("place-view");
	}

	var switchComments = function (container) {
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

    return{
    	createPlaceView : createPlaceView,
    	switchComments : switchComments
    }

})(LUNGO, App);