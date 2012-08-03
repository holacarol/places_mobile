App.View = (function(lng, app, undefined) {

	/** Template for Places in the list **/
	
	lng.View.Template.create('place-in-list',
		'<li id="{{id}}" class="selectable" data-icon="pushpin">\
			<div class="onleft icon pushpin"></div>\
			<div class="onright"><a href="#"><span class="icon star"></span><br>You like this place</a></div>\
			<div><strong>{{title}}</strong>\
				<small>{{address.locality}}. {{address.country}}</small>\
			</div>\
		 </li>'
	);

    return{

    }

})(LUNGO, App);