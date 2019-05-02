//  ENV
const env = require('dotenv');
env.config();

//  DB
const { mongoose } = require("./db");

const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const cors = require('cors');
const _ = require('lodash');
const nodemailer = require('nodemailer');
const random = require('random-string');
const path = require('path');

//  JSON WEB TOKEN
const jwt = require('jsonwebtoken');
//  PASSPORT
/*
const passport = require('passport');
const passportJWT = require('passport-jwt');
const JwtStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;


const options = {
    jwtFromReq: ExtractJWT.fromAuthHeaderAsBearerToken,
    secretKey: process.env.secretKey
}

const strategy = new JwtStrategy(options, (payload, next) => {
    const user = null;
    next(null, user);
})

passport.use(strategy);
app.use(passport.initialize());
*/

//  MIDDLEWARE
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'uploads/users')));
app.use('/images', express.static('photos'))

//  CONTROLLER
const Common = require('./controller/common');
const Admin = require('./controller/admin');
const UserController = require('./controller/user');
const Profile = require('./controller/profile');
const Todos = require('./controller/todos');
const es6 = require('./controller/es6');

//  HELPERS
const helpers = require('./helpers');

//  MODEL
const User = require('./model/user')
const Todo = require("./model/todo");

//  ROUTES
/*
app.post('/api/login', Common)
app.post('/api/signup', Common)         //  OTP ,1
app.post('/api/login-with-otp', Common) //  OTP ,1
app.post('/api/verify-otp', Common);
app.post("/api/resend-otp", Common);    //  OTP ,1
app.post("/api/forgot-password", Common);   //  SEND LINK IN SMS/EMAIL

app.post("/api/user/profile", Profile);
app.put("/api/user/update-profile/:id", Profile);
app.post("/api/user/change-password", Profile);
app.post("/api/admin/login", Admin);

app.post("/api/admin/user/list", UserController);
app.post('/api/admin/user/list/:id', UserController);
app.delete('/api/admin/user/list/:id', UserController);
*/

app.post('/api/login', Common.login);
app.post('/api/login-with-otp', Common.loginWithOtp);
app.post('/api/signup', Common.signup);
app.post('/api/verify-otp', Common.verifyOtp);
app.post('/api/resend-otp', Common.resendOtp);
app.post('/api/forgot-password', Common.forgotPassword);
app.post('/api/reset-password', Common.resetPassword);

app.post("/api/admin/user/list", UserController.userList);
app.route('/api/admin/user/:id')
        .post(UserController.userList)
        .delete(UserController.deleteUser);

app.post("/api/user/profile", Profile.profile);
/*
app.get('/api/todo', Todos)
app.get('/api/todo/:id', Todos)
app.post("/api/todo", Todos);
app.put("/api/todo/:id", Todos);
app.delete("/api/todo/:id", Todos);
*/

app.route("/api/todo")
    .get(Todos.getTodo)
    .post(Todos.storeTodo);

app.route("/api/todo/:id")
    .get(Todos.getTodo)
    .put(Todos.storeTodo)
    .delete(Todos.deleteTodo)

app.route('/api/getJwt').get(Todos.getJwt)

app.get('/es6', es6);

let htmlPath = "/html/";

async function f() {
    //  return 1;
    let promise = new Promise((res, rej) => {
        setTimeout(() => res('resolved'), 1000);
    })
    console.log('Promise Before');
    let res = await promise;
    console.log("Promise After");
    console.log(res);

    return res;
}

app.get('/lodash', (req, res) => {
    let arr = [1, 2, 3, 4, 5, 6, 7, 8]
    let arr2 = [2,4,6,8]
    //  let chunk = _.chunk(arr,6);
    //  let concat = _.concat(arr, arr2).sort();
    // let difference = _.difference(arr, arr2);
    // let diffBy = _.differenceBy(arr, arr2);
    // console.log(difference);
    // console.log(diffBy);
    // let dropRightWhile = _.dropRightWhile(users, (data) => {
    //     return data.active;
    // })

    var users = [
        { 'user': 'barney', 'active': true, 'arr': { 'user': 'fred', 'active': false, 'arr2': { 'user': 'pebbles', 'active': true }}},
    ];

    var users = [
        { 'user': 'barney', 'active': true},
        { 'user': 'fred', 'active': false },
        { 'user': 'pebbles', 'active': true }
    ];

    let flatten = _.filter(users,['active',false]);
    //  console.log(flatten);
    res.send('sdd');
})

app.set('view engine', 'ejs');

app.get('/socket', (req, res) => {
    //  res.sendFile(__dirname +`${htmlPath}socket.html`)
    res.render('index');
})

app.get('/',(req,res) => {
    res.json('Front');
})

app.get('/html', (req, res) => {

    //  PRIMITIVES / VALUE TYPES
    let name = 'String'; isSingle
    let age = 23.9;
    let isSingle = true;
    let lover = undefined;
    let funny = null;
    console.log(typeof name);

    console.log(name, age, isSingle, lover, funny);


    res.send('test');
})

app.get('/test', (req, res) => {
    //  res.send('simple');
    //  res.sendFile(__dirname +`${htmlPath}index.html`)

    // f().then((data) => {
    //     throw new Error('err daw');
    //     console.log(data);
    // }).catch((err) => {
    //     console.log(err)
    // })
    const data = helpers.image()
    .then((data) => {
        if(!data.length > 0){
            res.send('No data found');
        }
        res.send(data);
    }).catch((err) => {
        console.log(err);
        res.send('no data')
    })
});

app.get("/mail", (req, res) => {
  "use strict";

  // async..await is not allowed in global scope, must use a wrapper
  async function main() {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let account = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: account.user, // generated ethereal user
        pass: account.pass // generated ethereal password
      }
    });

    // setup email data with unicode symbols
    let mailOptions = {
      from: '"ecekumar25695@gmail.com', // sender address
      to: "ashok.varatharaj@outlook.com", // list of receivers
      subject: "Hello ✔", // Subject line
      text: "Hello world?", // plain text body
      html: "<b>Hello world?</b>" // html body
    };

    // send mail with defined transport object
    let info = await transporter.sendMail(mailOptions);

    console.log("Message sent: %s", info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  }

  main().catch(console.error);

  res.send("Mail sent");
});

app.get('/twillio', (req, res) => {

    // // using SendGrid's v3 Node.js Library
    // // https://github.com/sendgrid/sendgrid-nodejs
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // const msg = {
    //     to: 'ecekumar25695@gmail.com',
    //     from: 'ecekumar25695@gmail.com',
    //     subject: 'Sending with SendGrid is Fun',
    //     text: 'and easy to do anywhere, even with Node.js',
    //     html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    // };
    // sgMail.send(msg);

    // res.send('mail sent');

    const accountSid = 'ACe1de5ac744fb6d5d44ff29dc45135603';
    const authToken = 'e66e4e1d88f2f34a60613608d376d694';
    const client = require('twilio')(accountSid, authToken);
    
    client.messages
        .create({
            body: 'Test Maamey',
            from: '+12564720686',
            to: '+919942356717'
        })
        .then((message) => {
            console.log(message.sid)
            return res.status(400).json('Sms sent');
        }).catch((err) => {
            return res.status(400).json(err);
        })
        .done();
})

// 404
app.use((req, res, next) => {
    res.send('404');
})

//  PORT & CONNECTION
const port = 5000;
let server = app.listen(port, () => {
    console.log(`Listening Port ${port}`)
})

const io = require("socket.io")(server);

io.on("connection", socket => {
    console.log("New Socket");
    socket.username = 'Anonymous';
    socket.on('changeUserName', (data) => {
        socket.username = data.username
        console.log(socket.username);
        let randomString = random({ length: 20 });

        let userData = {
          _id: randomString,
          username: socket.username
        };
        io.sockets.emit("changeUserName", { data: userData});
    })

    socket.on("newMessage", (data) => {
        console.log("newMessage");
        io.sockets.emit("newMessage",{ message: data.message, username:data.username });
    });

    socket.on("typing", () => {
        io.sockets.emit("typing", { message: `${socket.username} is typing ` });
    });
});


//  NODEMON ISSUE
//  sudo sysctl fs.inotify.max_user_watches=582222 && sudo sysctl -p