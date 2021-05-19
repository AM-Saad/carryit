const path = require('path');
const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const uuidv4 = require('uuid/v4')//for Multer
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const errorController = require('./controllers/error');
const isAuth = require('./middleware/is-auth');
const Chat = require('./models/Chat');
var markerData = require('./markerData.js');
const cookie = require("cookie");
const csrf = require('csurf');
const flash = require('connect-flash');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors')
const moment = require('moment')
const app = express();
var http = require('http').Server(app);


const io = require('./socket').init(http)



const MONGODBURI = `mongodb+srv://abdelrhman:ingodwetrust@onlineshop-zsiuv.mongodb.net/carryit`;

const store = new MongoDBStore({
  uri: MONGODBURI,
  collection: 'sessions'
});

let activeRooms = []


io.of('/chat').on('connection', function (socket) {



  socket.on('join-chats', async data => {
    const sessionID = getSessionId(socket)
    store.get(sessionID, async function (err, session) {
      let user
      if (session.isDriver) {
        chats = await Chat.find({ driver: session.user._id })
      } else {
        chats = await Chat.find({ admin: session.user._id })
      }
      for (const chat of chats) {
        let exist = activeRooms.find(r => r.chatId === chat.chatId)
        if (!exist) {
          activeRooms.push({ driver: null, chatId: chat.chatId, users: [] })
        }
        if (session.user._id.toString() === chat.driver.toString() || session.user._id.toString() === chat.admin.toString()) {
          socket.join(chat.chatId)
        }
      }
    })
  })

  
  socket.on("register", async data => {
    // console.log(data);
    const sessionID = getSessionId(socket)
    store.get(sessionID, async function (err, session) {
      let chat = await Chat.findOne({ driver: data.driverId, admin: data.adminId })
      if (!chat) {
        chat = new Chat({ conversion: [], driver: data.driverId, admin: data.adminId })
        await chat.save()
        console.log('created new..');
      }
      let room = activeRooms.find(r => r.chatId == data.chatId)

      if (!room) {
        activeRooms.push({ driver: null, chatId: chat.chatId, users: [] })
        room = activeRooms.find(r => r.chatId == chat.chatId)
      }
      const admin = session.user.isAdmin ? true : false
      return socket.emit("chat-ready", chat, admin);
    })

  });

  socket.on("offline", data => {
    socket.broadcast.emit("offline", data);
  });
  socket.on("message", data => {
    let chat
    const sessionID = getSessionId(socket)
    store.get(sessionID, async function (err, session) {
      let newmsg = { chatId: data.chatId, msg: data.msg, date: data.date, usertype: data.type, sender: session.user._id }
      await Chat.findOneAndUpdate({ chatId: data.chatId }, { $push: { conversion: newmsg } })
      socket.broadcast.to(data.chatId).emit('new-message', newmsg);
    })

  });


  socket.on("typing", (chatId) => {
    socket.broadcast.to(chatId).emit('typing', chatId);

  });
  socket.on("stoptyping", (chatId) => {
    socket.broadcast.to(chatId).emit('stoptyping', chatId);
  });

  // socket.on('image', async image => {
  //   console.log(image);
  //   // image is an array of bytes
  //   const buffer = Buffer.from(image);
  //   await fs.writeFile('/temp/image', buffer).catch(console.error); // fs.promises
  // });



  let Files = {};

  socket.on('start-upload', function (data) {

    var name = data['Name'];
    Files[name] = {
      FileSize: data['Size'],
      Data: "",
      Downloaded: 0
    }
    var Place = 0;
    try {
      var Stat = fs.statSync(__dirname + '/temp/' + name);
      if (Stat.isFile()) {
        Files[name]['Downloaded'] = Stat.size;
        Place = Stat.size / 524288;
      }
    }
    catch (er) { } //It's a New File
    fs.open(__dirname + "/temp/" + name, "a", 0755, function (err, fd) {
      if (err) {

        console.log(err);
      }
      else {
        Files[name]['Handler'] = fd; //We store the file handler so we can write to it later
        socket.emit('MoreData', { 'Place': Place, Percent: 0 });
      }
    });
  })

  
  socket.on('upload', function (data) {


    var Name = data['Name'];

    Files[Name]['Downloaded'] += data['Data'].length;
    Files[Name]['Data'] += data['Data'];
    if (Files[Name]['Downloaded'] == Files[Name]['FileSize']) //If File is Fully Uploaded
    {

      fs.write(Files[Name]['Handler'], Files[Name]['Data'], null, 'Binary', function (err, Writen) {
        var inp = fs.createReadStream(__dirname + "/temp/" + Name);
        var out = fs.createWriteStream(__dirname + "/chat-images/" + Name);
        inp.pipe(out);
        inp.on("end", function () {
          // Operation done
          fs.readdirSync(__dirname + "/temp").forEach(file => {
            fs.unlinkSync(__dirname + "/temp/" + file);
          });
          socket.emit('Done', { 'Image': 'chat-images/' + Name + '.jpg', path: "chat-images/" + Name });
        });

      });
    }
    else if (Files[Name]['Data'].length > 10485760) { //If the Data Buffer reaches 10MB
      fs.write(Files[Name]['Handler'], Files[Name]['Data'], null, 'Binary', function (err, Writen) {
        Files[Name]['Data'] = ""; //Reset The Buffer
        var Place = Files[Name]['Downloaded'] / 524288;
        var Percent = (Files[Name]['Downloaded'] / Files[Name]['FileSize']) * 100;
        socket.emit('MoreData', { 'Place': Place, 'Percent': Percent });
      });

    }
    else {
      var Place = Files[Name]['Downloaded'] / 524288;
      var Percent = (Files[Name]['Downloaded'] / Files[Name]['FileSize']) * 100;
      socket.emit('MoreData', { 'Place': Place, 'Percent': Percent });

    }
  })


  socket.on('disconnecting', () => {
    const rooms = Object.keys(socket.rooms);
    // the rooms array contains at least the socket ID
  });

})



let activeTrips = []


io.of('/map').on('connection', function (socket) {

  socket.on('start', (roomId) => {
    console.log(`User Tracking ${roomId}`);
    let room = activeTrips.find(r => r.roomId == roomId)
    if (!room) {
      activeTrips.push({ driver: null, roomId: roomId, users: [] })
      room = activeTrips.find(r => r.roomId == roomId)
    }
    socket.join(roomId)
    if (!room.driver) return socket.emit("notreadytomove", 'Shipment Still In Our Office');
    return socket.emit("readytomove", { users: room.users });

  })

});


io.of('/driver/move').on('connection', function (socket) {

  socket.on("register", roomId => {
    console.log(`Driver Started ${roomId}`);

    const sessionID = getSessionId(socket)
    store.get(sessionID, function (err, session) {
      if (session != undefined) {
        let room = activeTrips.find(r => r.roomId == roomId)

        if (room && room.driver && room.driver.id.toString() != session.user._id.toString()) return socket.emit("ignored", 'This Shipment Already Has Driver');
        if (!room) activeTrips.push({ driver: { id: session.user._id, name: session.user.name }, roomId: roomId, users: [] })
      }
    })
    return io.of('/map').to(roomId).emit("readytomove", 'Ready');

  });

  socket.on('move', (data) => io.of('/map').to(data.id).emit("move", data.coords))

  socket.on('shipment-closed', (id) => {
    activeTrips = activeTrips.filter(r => r.roomId !== id)
    io.of('/map').to(id).emit("shipment-closed", 'Driver Have Been Stoped The Trip');
  })

  socket.on('disconnecting', () => {
    const rooms = Object.keys(socket.rooms);
    console.log(rooms);
    // the rooms array contains at least the socket ID
  });

});


function getSessionId(socket) {
  var tS = cookie.parse(socket.handshake.headers.cookie)['connect.sid'];
  var sessionID = tS.split(".")[0].split(":")[1];
  return sessionID
}




app.set('socketio', io);

const csrfProtection = csrf();



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    const match = ["image/png", "image/jpeg", "image/jpg", "image/svg"];
    if (match.indexOf(file.mimetype) === -1) {
      var message = `invalid image type. Only accept png/jpeg.`;
      return cb(message, null);
    }

    cb(null, uuidv4())
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png'
  ) {
    cb(null, true)
  } else {
    cb(null, false)
  }
};

app.set('view engine', 'ejs');
app.set('views', 'views');


app.use(cors()) // Use this after the variable declaration

const adminRoutes = require('./routes/admin');
const driverRoutes = require('./routes/driver');
const apiRoutes = require('./routes/api');
const publicRoutes = require('./routes/public');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const socket = require('./socket');

app.use(helmet());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: storage }).array("image", 10));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.setHeader('Service-Worker-Allowed', '/');

  // res.setHeader('Access-Control-Allow-Origin', '*');
  // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  // res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});


app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);

app.get('/markers', function (req, res) {
  res.send(JSON.stringify(markerData.getMarkers()));
});

app.use('/api', apiRoutes);

app.use(csrfProtection);
app.use(flash());

// app.use((req, res, next) => {
//   let token = req.csrfToken();
//   res.locals.isAuthenticated = req.session.isLoggedIn;
//   res.locals.csrfToken = token;
//   next();
// });

//check this, fails on integration api
app.use((req, res, next) => {

  let token = req.csrfToken();
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = token;
  next();
});




app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  const user = req.session.user
  req.user = req.session.user;
  req.company = req.session.company;
  res.locals.name = user.name;
  res.locals.isAdmin = user.isAdmin;
  res.locals.isDriver = req.session.isDriver;
  next();

});


app.use('/driver', driverRoutes);
app.use('/admin', adminRoutes);

// app.use('/admin/api', apiRoutes);
app.use(publicRoutes);
app.use(authRoutes);
app.use('/user', userRoutes);


app.get('/500', errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  console.log(error);
  return res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
  });

});





mongoose
  .connect(MONGODBURI)
  .then(result => {
    // app.listen(4000);
    console.log(`Working On Port ${3000}`);
  })
  .catch(err => {
    console.log(`error is ${err}`);
  });

let port = process.env.PORT || 3000

http.listen(port, function () {
  console.log('listening on *:80');
});
