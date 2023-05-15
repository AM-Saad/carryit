const path = require('path');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const uuidv4 = require('uuid/v4')//for Multer
const mongoose = require('mongoose');
const Chat = require('./models/Chat');

const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors')
const jwt = require("jsonwebtoken");
const app = express();
var http = require('http').Server(app);


const MONGODBURI = `mongodb+srv://abdelrhman:ingodwetrust@onlineshop.zsiuv.mongodb.net/carryit`;




const io = require('./socket').init(http)





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



app.set('view engine', 'ejs');
app.set('views', 'views');




app.use(helmet());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: storage }).array("image", 10));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors()) // Use this after the variable declaration









let activeTrips = []

io.of('/tracking').on('connection', function (socket) {

  console.log('connected...');

  socket.on("register", ({ roomId, token }) => {
    console.log('register');
    socket.sendBuffer = [];

    const rooms = Object.keys(socket.rooms);
    let exist = rooms.find(r => r.roomId.toString() === roomId.toString())
    const session = getSessionId(token)

    socket.join(roomId)
    socket.broadcast.to(roomId).emit('readyToMove', roomId);
    activeTrips.push(roomId)
    socket.emit("go", roomId);

  });

  socket.on('move', (data) => {
    console.log('move')
    if (socket.connected && data) {

      socket.volatile.broadcast.to(data.id).emit("move", { coords: data.coords, id: data.id });
    }
  })


  socket.on('shipment-closed', (roomId) => {
    console.log('Shipment Closed');
    activeTrips = activeTrips.filter(r => r.roomId != roomId)
    socket.broadcast.to(roomId).emit('shipment-closed', roomId);
    socket.leave(roomId)
  })




  socket.on('watch', (roomId, cb) => {
    const rooms = Object.keys(socket.rooms);
    socket.join(roomId)
    console.log(activeTrips)
    cb({
      ready: rooms.includes(roomId) && activeTrips.includes(roomId) ? true : false

    })
  })


  socket.on("disconnecting", () => {
    const rooms = Object.keys(socket.rooms);
    console.log(rooms);

  });

  socket.on("disconnect", () => {
    console.log('disconnected');
    // socket.rooms.size === 0
  });
});









function getSessionId(token) {
  if (!token) return null
  let decodedToken = jwt.verify(token, "my-secret-key");
  return decodedToken
}




let activeRooms = []

io.of('/chat').on('connection', function (socket) {



  socket.on('join-chats', async data => {
    const sessionID = getSessionId(socket)
    store.get(sessionID, async function (err, session) {
      if (session.user) {
        console.log(session.user)
        let chats
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
    console.log('offline' + data)
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
      } else {
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





app.set('socketio', io);






app.use((error, req, res, next) => {
  return res.status(500).json({ message: error.message, status: "UNEXPECTED_ERROR" });
});




let port = process.env.PORT || 8000

mongoose
  .connect(MONGODBURI)
  .then(result => {
    // app.listen(4000);
    console.log(`Working On Port ${port}`);
  })
  .catch(err => {
    console.log(`error is ${err}`);
  });


http.listen(port, function () {
  console.log('listening on *:80');
});
