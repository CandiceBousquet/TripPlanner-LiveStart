

var $hotelSelect = $("#hotel-choices");
var $restaurantSelect = $("#restaurant-choices");
var $activitiesSelect = $("#activity-choices");

hotels.forEach(function(hotel){
	$('<option>').attr("data-lat", hotel.place.location[0]).attr("data-lng", hotel.place.location[1]).val(hotel.name).text(hotel.name).appendTo($hotelSelect);
});
restaurants.forEach(function(restaurant){
	$('<option>').attr("data-lat", restaurant.place.location[0]).attr("data-lng", restaurant.place.location[1]).val(restaurant.name).text(restaurant.name).appendTo($restaurantSelect);
});
activities.forEach(function(activity){
	$('<option>').attr("data-lat", activity.place.location[0]).attr("data-lng", activity.place.location[1]).val(activity.name).text(activity.name).appendTo($activitiesSelect);
});

$(".add-btn").on("click", function(event) {
	let dataType = $(this).attr("data-type");
	let selectedOption = $("#"+dataType+"-choices option:selected");
	let selectedName = selectedOption.val();

	if(days[currentDay-1][dataType].find(({ name }) => name === selectedName)) return null;
	let lat = selectedOption.attr('data-lat')
	let lng = selectedOption.attr('data-lng')
	let marker = drawMarker(dataType, [lat, lng]);
	const index = days[currentDay-1][dataType].push({name : selectedName, marker }) - 1;
	addSelectedItem(dataType, selectedName, marker, index);
});

$(".list-group").on("click", ".remove.btn-circle", function(event) {
	let index = $(this).data('index');
	let type = $(this).data('type');
	$(this).data('marker').setMap(null);
	$(this).parent().remove();
	days[currentDay-1][type].splice(index, 1);
	updateMapBounds();
});

$("#day-add").on("click", function(event) {
	days.push({
		hotel: [],
		activity: [],
		restaurant: [],
	})
	addDays();
});

$(".day-buttons span").on("click", '.day-btn', function(event) {
	boundsObj = new google.maps.LatLngBounds();
	removeContent()
	let day = $(this).text();
	currentDay = Number(day);
	applyCurrentDayClass();
	loadSelectedContent();
	updateDayTitle();
});

$("#remove-day").on("click", function(event) {
	removeContent();
	days.splice(currentDay-1, 1);
	if(!days[currentDay-1]) currentDay--
	addDays();
	loadSelectedContent()
	updateDayTitle()
})

let currentDay = 1

const days = [{
	hotel: [],
	activity: [],
	restaurant: [],
}];
function addDays() {
	const buttons = $('.day-buttons span').empty();
	days.forEach((day, i) => {
		buttons.append($('<button class="btn btn-circle day-btn">').text(i + 1));
	})
	applyCurrentDayClass();

}

function applyCurrentDayClass() {
	let buttons = $(".day-buttons span").children().removeClass('current-day');
	$(buttons[currentDay-1]).addClass("current-day");
	if(currentDay === 1) {
		$('#remove-day').hide()
	} else {
		$('#remove-day').show()
	}
}

function removeContent(){
	$('.list-group').empty()
	iterateOverCurrentDay(place => place.marker.setMap(null))
}

function addSelectedItem(type, name, marker, index) {
	let newSelection = $('<div class="itinerary-item">')
		.append($('<span class="title">').text(name))
		.append($('<button class="btn btn-xs btn-danger remove btn-circle">').text("x").data({'marker': marker, index, type}));
	$('#' + type + '-list').append(newSelection);
	boundsObj.extend(marker.position);
	currentMap.fitBounds(boundsObj);
}

function loadSelectedContent() {
	iterateOverCurrentDay((place, i, key) => {
		place.marker.setMap(currentMap);
		addSelectedItem(key, place.name, place.marker, i);
	})
}

function updateDayTitle() {
	$("#day-title span").text("Day " + currentDay);
}

function updateMapBounds() {
	boundsObj = new google.maps.LatLngBounds();
	iterateOverCurrentDay(item => boundsObj.extend(item.marker.position))
	currentMap.fitBounds(boundsObj);
}

function iterateOverCurrentDay(fn) {
	Object.keys(days[currentDay - 1]).forEach(type => {
		days[currentDay-1][type].forEach((elem, i)=>fn(elem, i, type))
	})
}

addDays();




