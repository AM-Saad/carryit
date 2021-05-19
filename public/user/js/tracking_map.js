/*jslint browser: true*/
/*global console, alert, $, jQuery*/
const shipmentId = $('#shipmentId').val()




const markerStore = {};

const myLatlng = new google.maps.LatLng(30.005493, 31.477898);
const myOptions = {
    zoom: 23,
    enableHighAccuracy: true,
    center: myLatlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
}
const map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);



const socket = io('/map', { reconnect: true })

socket.emit("start", shipmentId);

socket.on("notreadytomove", () => {
    $('#map_canvas').addClass('none')
    $('#not_ready').removeClass('none')
});

socket.on("readytomove", () => {
    $('#map_canvas').removeClass('none')
    $('#not_ready').addClass('none')
});


socket.on("move", (data) => {
    console.log('Driver Moving');
    moveMarker(data)
});
socket.on("shipment-closed", data => {
    $('#map_canvas').addClass('none')
    $('#not_ready').removeClass('none')
    $('#not_ready').find('h3').html('تم ايقاف الرحله من جانب المندوب')
});


// window.onbeforeunload = () => {
//     socket.emit("offline", name);
// };


function moveMarker(data) {
    //Do we have this marker already?
    let lat = data.lat
    let lng = data.long
    if (markerStore.hasOwnProperty(shipmentId)) {
        console.log('one');
        markerStore[shipmentId].setPosition(new google.maps.LatLng(data.lat, data.long));
        map.setCenter({ lat: lat, lng: lng });
    } else {
        console.log('two');

        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(data.lat, data.long),
            title: 'Ahmed',
            map: map
        });
        markerStore[shipmentId] = marker;
    }

}

