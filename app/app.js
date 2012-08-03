var App = (function(lng, undefined) {

    //Define your LungoJS Application Instance
    lng.App.init({
        name: 'MyPlaces',
        version: '1.2',
        resources: {
            sections: [
            	'place.list.html',
            	'place.view.html',
            	'map.html',
            	'place.search.html',
            	'place.new.html',
            	'friend.list.html',
            	'friend.view.html']
        }
    });

    return {

    };

})(LUNGO);