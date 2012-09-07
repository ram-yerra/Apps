/**
 * Map
 * --------------------
 */
CakeFest.Positions = {
	cakefest: new google.maps.LatLng(41.893189109504746, -87.62567639350891),
	drink: [
		{
			name: 'J Bar',
			position: new google.maps.LatLng(41.89283770481599, -87.62555301189423)
		},
		{
			name: 'The Red Head Piano Bar',
			position: new google.maps.LatLng(41.89353252585539, -87.62875020503998)
		},
		{
			name: 'Fleming\'s Prime Steakhouse & Wine Bar',
			position: new google.maps.LatLng(41.89266998826028, -87.62707114219666)
		},
		{
			name: 'Jake Melnicks Corner Tap',
			position: new google.maps.LatLng(41.89558899211042, -87.62640058994293)
		}
	],
	food: [
		{
			name: 'Sushi Taiyo',
			position: new google.maps.LatLng(41.89342870250225, -87.62571930885315)
		},
		{
			name: 'Su Casa Mexican',
			position: new google.maps.LatLng(41.89317313660629, -87.62625575065613)
		},
		{
			name: 'Pizzeria Uno',
			position: new google.maps.LatLng(41.89235052693584, -87.62692630290985)
		},
		{
			name: 'Grande Luxe Cafe',
			position: new google.maps.LatLng(41.893213068844936, -87.62479662895203)
		},
		{
			name: 'Dunkin\' Donuts',
			position: new google.maps.LatLng(41.89281374533499, -87.62244164943695)
		},
		{
			name: 'Lawry\'s the Prime Rib',
			position: new google.maps.LatLng(41.89345665496009, -87.62505412101746)
		},
		{
			name: 'Oysy River North',
			position: new google.maps.LatLng(41.89179545908486, -87.62587487697601)
		},
		{
			name: 'Mary\'s Cafe',
			position: new google.maps.LatLng(41.89157183326382, -87.62200176715851)
		}
	],
	airport: [
		{
			name: 'Chicago O\'Hare International',
			position: new google.maps.LatLng(41.979145235130126, -87.9045295715332)
		}
	]
};

CakeFest.Views.EventMap = Ext.extend(Ext.Map, {
	setupMarkers: function(m) {
		new google.maps.Marker({
			map: m.map,
			position: CakeFest.Positions.cakefest,
			title: 'CakeFest 2010',
			icon: 'images/markers/cakephp.png',
			zIndex: 10
		});

		var food = CakeFest.Positions.food;
		for (var i = 0; i < food.length; i++) {
			new google.maps.Marker({
				map: m.map,
				position: food[i].position,
				title: food[i].name,
				icon: 'images/markers/food.png',
				zIndex: 1
			});
		}

		var drink = CakeFest.Positions.drink;
		for (var i = 0; i < drink.length; i++) {
			new google.maps.Marker({
				map: m.map,
				position: drink[i].position,
				title: drink[i].name,
				icon: 'images/markers/bar.png',
				zIndex: 1
			});
		}

		var airport = CakeFest.Positions.airport;
		for (var i = 0; i < airport.length; i++) {
			new google.maps.Marker({
				map: m.map,
				position: airport[i].position,
				title: airport[i].name,
				icon: 'images/markers/airport.png',
				zIndex: 1
			});
		}
	}
});

CakeFest.Views.Map = new CakeFest.Views.EventMap({
	title: 'Map',
	iconCls: 'map',
	mapOptions: {
		zoom: 16,
		center: CakeFest.Positions.cakefest,
		disableDoubleClickZoom: true,
		mapTypeControl: false
	}
});

CakeFest.Views.Map.on('activate', CakeFest.Views.Map.setupMarkers);

