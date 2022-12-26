const express = require('express'); //khai báo thư viện
const app = express(); // trả về đối tượng 
const port = 5000;
const path = require('path');
const route = require('./routes');
const db = require('./config/database');
const cors = require("cors");
//const shortid = require("shortid");
var timeout = require('express-timeout-handler');
const emailServices = require('./services/emailServices');

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

var options = {

  // Optional. This will be the default timeout for all endpoints.
  // If omitted there is no default timeout on endpoints
  timeout: 8000,

  // Optional. This function will be called on a timeout and it MUST
  // terminate the request.
  // If omitted the module will end the request with a default 503 error.
  onTimeout: (req, res) => {
    return res.status(503).json({ error: 'Không nhận được phản hồi, vui lòng thử lại' });
  },
  // disable: ['write', 'setHeaders', 'send', 'json', 'end']
};

app.use(timeout.handler(options));


app.use(express.json());


//định vị đường cho layout, trong đó dirname là thư mục chứ file index do ban đầu main: src/index.js
//app.set('views', path.join(__dirname, 'resources', 'views'));

route(app);

//localhost 127.0.0.1
const server = app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})
emailServices.sendReminderMail();