//required node packages
const express = require("express");
const socket = require('socket.io')
const app = express();
const port = process.env.PORT || 3000;
const path = require("path");
const bodyParser = require("body-parser");
let rooms = [{ rid: 'fake', uid: 'fake' }];

//using bodyParser, ejs view engine and static page
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "./templates")));

const server = require('http').createServer(app);
const io = socket(server);

server.listen(port, () => {
  console.log(`Server started in port ${port}`);
});


//----------------------------------------------------------------------------------//

//Basic page routings
app.get('/', (req, res) => {
  res.render('index');
})

app.get('/track', (req, res) => {
  res.render('track');
})

app.get('/betrack', (req, res) => {
  res.render('betrack');
})


//-------------------------------------------------------------------------//

//socket.io on connection activity
io.on('connection', (socket) => {
  console.log('connection stablished');

  //connection from client-betracked ans storing roomid/hostid
  socket.on('beconn', (code) => {
    socket.join(code);
    let rid = code;
    let uid = socket.id;
    rooms.push({ rid, uid });
    console.log(`${code} romm joined`);
    console.log(rooms)
  })

  //connection from client-track and checking entered roomid
  socket.on('tconn', (code) => {
    if (rooms.find(e => e.rid == code)) {
      socket.join(code);
      io.emit('check', 'true');
      console.log(rooms)
      console.log(`${code} room joined`);
    }
    else {
      io.emit('check', 'false');
      console.log('invalif room id');
    }
  })

  //sending location coordinates to client-track and vice versa
  socket.on('getCo', (lat) => {
    io.in(lat.codeg).emit('co', lat);
    console.log(lat);
  })

  //socket disconnect from client-(betracked/track)
  //remove roomid/hostid on disconnect from client-betrack
  socket.on('discon', (msg) => {
    if (rooms.find(e => e.uid == socket.id)) {
      rooms = rooms.filter(id => id.rid != msg);
      io.in(msg).emit('belast', 'Last Known Location');
      io.socketsLeave(msg);
    }
    else {
      socket.leave(msg);
    }
  })

  //socket on automatic disconnect
  //remove roomid/hostid if client-betracked 
  socket.on('disconnect', () => {
    let luser = rooms.find(e => e.uid == socket.id);
    if (luser) {
      io.in(luser.rid).emit('belast', 'Last Known Location');
      io.socketsLeave(luser.rid);
      rooms = rooms.filter(id => id.uid != socket.id);
    }
  })
})

//###########-------EOF-------###########\\
