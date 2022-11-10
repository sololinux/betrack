/* Copyright @sololinux -github
just use this code anywhere you want
keep coding */


//needed variables
let marker, circle, feat;
//socket.io installization on client
const socket = io();

//leaflet.js installization
var map = L.map('map').setView([20.7123501, 30.3706905], 3);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


//emit to socket-server via client-betracked 
//run on betraked.start button clecked
//add roomid/hostid on server
document.getElementById('startTracked').onclick = () => {
    if (document.getElementById('getid').textContent == '______') {
        document.getElementById('uptxt').textContent = "Starting Tracking .....";
        code = (Math.random() + 1).toString(36).substring(6);
        socket.emit('beconn', code);
        document.getElementById('getid').innerHTML = `${code}`
        loop = setInterval(() => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(showPosition);
            } else {
                document.getElementById('uptxt').textContent = "Geolocation is not supported by this browser.";
            }
        }, 3000);
    }
}

//html5 geolocation coordinate 
//send coordinates to socket-server  
function showPosition(position) {
    let latt = position.coords.latitude;
    let lonn = position.coords.longitude;
    let accu = position.coords.accuracy;

    socket.emit('getCo', { latti: latt, lonng: lonn, accur: accu, codeg: code });
    document.getElementById('uptxt').textContent = "You are Being Tracked ....";

}

//emit to socket-server via track
//check roomid correct or not
document.getElementById('form').onsubmit = (e) => {
    e.preventDefault();
    codet = document.getElementById('inputTrack').value;

    socket.emit('tconn', codet);
    socket.on('check', (res) => {
        if (res == 'false') {
            document.getElementById('inv').textContent = 'Invalid ID';
        }
        else {
            document.getElementById('outerMap').style.display = 'none';
            document.getElementById('trackDataBox').style.display = 'block';
        }
    })
}

//emit to socket-server via betracked
//emit discon on server
//remove roomid/hostid 
document.getElementById('stopTracked').onclick = () => {
    if (code !== '') {
        socket.emit('discon', code);
        clearInterval(loop);
        document.getElementById('uptxt').textContent = "Are you ready for Tracked";
        document.getElementById('getid').innerHTML = `______`;
        code = '';
    }
}

//emit to socket-server via track
//emit discon on server
document.getElementById('stopTrack').onclick = () => {
    document.getElementById('outerMap').style.display = 'block';
    document.getElementById('trackDataBox').style.display = 'none';
    socket.emit('discon', codet);
}

//receive coordinates sent from server
//socket.io-server-emmits co
//place marker/circle on leaflet.js
socket.on('co', (msg) => {
    document.getElementById('stat').textContent = 'Active';
    if (marker) {
        map.removeLayer(marker);
    }

    if (circle) {
        map.removeLayer(circle);
    }

    marker = L.marker([msg.latti, msg.lonng]);
    circle = L.circle([msg.latti, msg.lonng], { radius: msg.accur });

    feat = L.featureGroup([marker, circle]).addTo(map)
        .bindPopup('Here i am')
        .openPopup();

    map.fitBounds(feat.getBounds());
})

//run when socket disconnects sent from server
//socket.io-server-emmits discon and disconnect
//place last loacation on map
socket.on('belast', (msg) => {
    document.getElementById('stat').textContent = 'Offline';
    feat = L.featureGroup([marker, circle]).addTo(map)
        .bindPopup(msg)
        .openPopup();

    map.fitBounds(feat.getBounds());
})


