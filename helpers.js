//  PACKAGES
const fetch = require('node-fetch');
const objectId = require('mongodb').ObjectID;
const jwt = require('jsonwebtoken');
const randomString = require('random-string');
const twillio = require('twilio');
const mongoose = require('mongoose');
const path = require('path');

//  MODEL
const User = require('./model/user');
const OtpLog = require('./model/otpLog');

//  ENV
const env = process.env;

//  DEFAULT
const privateKey = env.SECRET_KEY;
const emptyObj = {};
const invalidTokenErr = 'Invalid Secret Key | Token';

//  PATH
//  const userImagePath = '/uploads/users';
//  const userDefaultImage = `${userImagePath}/twitter.png`;
const userDefaultImage = `/twitter.png`;

function getCurrentTime(req, res) {
  return new Date().getTime();
}

function getXDay(req, res) {
  let day = parseInt(req);
  let dayValue = day * 24 * 60 * 60 * 1000;
  return dayValue;
}

function getLastMonth(req, res) {
  let currentTime = getCurrentTime();
  let dayBefore = getXDay(30);
  let time = currentTime - dayBefore;
  return time;
}

async function add(req, res) {
  accountSid
  let a, b, c;
  a = req;
  b = 10;
  c = await a + b;
  return c;
}

function getRandomData(length = "",n="",l="") {
  let str_length = length ? length : 6;
  let letters = false;
  let numeric = true;
  letters = l ? true : false;
  //  numeric = n ? true : false;
  return randomString({ length: str_length, numeric: numeric, letters: letters });
}

async function objectIdValidation(req, res) {
  return await objectId.isValid(req);
}

async function getUser(req, res) {
  let user_id = req;
  return await User.findById(user_id)
}

async function getToken(req,res){
  return await jwt.sign({'data': req}, privateKey);
}

function verifyToken(req, res) {
  let id = req['id'];
  let token = req['token'];
  let privateKey = env.SECRET_KEY;
  try {
    let decodeToken = jwt.verify(token, privateKey, (err, decoded) => {
      if (err) {
        return false;
      } else {
        let userData = decoded.data;
        if(userData._id == id){
          return true;
        }
        return false;
      }
    })
    return decodeToken;
  } catch (err) {
    return false;
  }
}

async function otp(req, res) {
  let post_data = req;

  let type,otp,number,subject;
  type = post_data['type'];
  otp =  post_data['otp'];
  number = '+919942356717'; //  post_data['number'];
  user_id = post_data['user_id'];

  if(type ==1)
    subject = `OTP For Account ${otp}`;
  else if(type == 2)
    subject = `OTP For 2D-AUTH ${otp}`;
  
//  CREATE LOGS IN OTP LOGS TABLE
  let Log = new OtpLog({
    type: type,
    otp: otp,
    number: number,
    user: user_id,
    subject: subject,
    status:0
  })
  await Log.save();

  let sms = await sendSms({
    'subject': subject,
    'number': number
  });

  console.log(sms.sid);

  if(sms){
    Log.status = 1; //  SUCCESS
  }else{
    Log.status = 2; //  FAIL
  }
  await Log.save();
  return sms;
}

async function sendSms(req,res){
  let post_data = req;

  let number,subject;
  number = post_data['number'];
  subject = post_data['subject'];

  const accountSid = 'ACe1de5ac744fb6d5d44ff29dc45135603';
  const authToken = 'e66e4e1d88f2f34a60613608d376d694';
  const client = require('twilio')(accountSid, authToken);

  try {
    let msg = await client.messages.create({ body: subject, from: '+12564720686', to: number });
    return msg;
  }
  catch (err) {
    return err;
  }
}

async function getUserImage(req, res) {  
  let users = req;
  //  ARRAY OF OBJECT
  users = users.filter((user) => {
      //  IMAGE
      image = userDefaultImage;
      if (user.image != "") {
        //  image = `${userImagePath}/${user.image}`;
        image = `/${user.image}`;
      }
      return user.image = image;
  })
  return await users;
} 

function getObjectId(req, res) {
  return mongoose.Types.ObjectId(req);
}

module.exports = {
    getCurrentTime: getCurrentTime,
    getLastMonth: getLastMonth,
    getXDay: getXDay,
    getUser: getUser,
    add:add,
    objectIdValidation: objectIdValidation,
    getToken:getToken,
    verifyToken: verifyToken,
    getRandomData: getRandomData,
    otp:otp,
    getUserImage:getUserImage,
    getObjectId:getObjectId,
};

/*

module.exports = {

  test: () => {
    let t = 'test'
    return t
  },
  testA: async () => {
    return 'add';
  },
  image: async () => {
    // read our JSON
    let response = await fetch('https://jsonplaceholder.typicode.com/todo');
    var user = {};
    try {
      var user = await response.json();
    } catch(err){
      throw new err();
    }

    return user;

    // // read github user
    // let githubResponse = await fetch(`https://api.github.com/users/${user.name}`);
    // let githubUser = await githubResponse.json();

    // // show the avatar
    // let img = document.createElement('img');
    // img.src = githubUser.avatar_url;
    // img.className = "promise-avatar-example";
    // document.body.append(img);

    // // wait 3 seconds
    // await new Promise((resolve, reject) => setTimeout(resolve, 3000));

    // img.remove();

    // return githubUser;    
  },
  getCurrentTime: () => {
      const currentTime = new Date().getTime();
      //  return parseInt(currentTime);
    
    return 'ak';
  },
  getLastMonth: () => {
    let currentTime = this.getCurrentTime;
    console.log(this.getCurrentTime);
    // console.log(typeof (currentTime));
    // let oneMonth = 30 * 24 * 60 * 60 * 1000;
    // console.log(typeof (oneMonth));
    // var time = currentTime - oneMonth; 
    //  return time;
  }

}

*/