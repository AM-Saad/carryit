// const mongodb = require('mongodb');
// const MongoClient = mongodb.MongoClient;

// let _db;
// const mongoConnect = callback =>{
// MongoClient.connect('mongodb+srv://abdelrhman:ingodwetrust@onlineshop-zsiuv.mongodb.net/OnlineShop?retryWrites=true'
// )
// .then(client =>{
//   console.log('Connected To DB');
//   _db = client.db();
//   callback();
// })
// .catch(err =>{
//   console.log(err);
//   throw err
// });
// };

// const getDb = () =>{
//   if (_db){
//     return _db
//   }
//   throw 'No Database Data'
// };

// exports.mongoConnect = mongoConnect;
// exports.getDb = getDb;