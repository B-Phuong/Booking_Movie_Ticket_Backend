const express = require('express'); //khai báo thư viện
const app = express(); // trả về đối tượng 
const port = 5000;
const path = require('path');
const route = require('./routes');
const db = require('./config/database');
const cors = require("cors");
//const shortid = require("shortid");


//To prevent CORS errors
app.use(cors());
//Connect to DB
db.connect();
//Thêm vô để sửa lỗi strict-origin-when-cross-origin
// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "X-Requested-With");
//   next();
//   });

// //Serve our static asset
app.use(express.static('public'));

// app.get("*", (req, res) => {
//   res.sendFile(path.resolve(__dirname,"../public", "index.html")); //__dirname, 
// });
//đặt đường dẫn luôn vào src/public 
//  app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());




//định vị đường cho layout, trong đó dirname là thư mục chứ file index do ban đầu main: src/index.js
//app.set('views', path.join(__dirname, 'resources', 'views'));

route(app);

//localhost 127.0.0.1
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})