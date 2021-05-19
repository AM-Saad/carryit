/*jslint browser: true*/
/*global console, alert, $, jQuery*/

$(document).ready(function () {
    let shipmentId = $('#shipmentId').val()



    const markerStore = {};

    const myLatlng = new google.maps.LatLng(30.005493, 31.477898);
    const myOptions = {
        zoom: 23,
        enableHighAccuracy: true,
        center: myLatlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
    }
    const map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);





    const socket = io('/driver/move', { reconnect: true })

    socket.emit("register", shipmentId);

    socket.on("start", () => console.log('start'));

    socket.on('ignored', reason => alert(reason))


    setInterval(() => getLocation(), 3000);



    window.onbeforeunload = () => socket.emit("shipment-closed", shipmentId);



    function getLocation() {
        if (navigator.geolocation) {
            console.log('works');
            let coords = { lat: '', long: '' }
            navigator.geolocation.getCurrentPosition(function (position) {
                coords.lat = position.coords.latitude;
                coords.long = position.coords.longitude;
                socket.emit("move", { id: shipmentId, coords: coords });
                moveMarker({ lat: coords.lat, long: coords.long })
            });
        }
    }


    function showPosition(position) {
        return document.getElementById('top-nav').innerHTML = "Latitude: " + position.coords.lat + "<br />Longitude: " + position.coords.lon;
    }


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

});