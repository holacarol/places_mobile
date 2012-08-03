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

    return{

    }

})(LUNGO, App);