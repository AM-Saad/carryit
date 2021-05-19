let io;

module.exports = {
  init: httpServer => {
    io = require("socket.io")(httpServer);
    console.log('someone connected');
    
return io
  },
  getIO:()=>{
      if(!io){
          throw new Error('Socket Not Initialized')
      }
      return io;
  }
};
