const express = require('express');
const app = express();
const Joi = require('joi');
const md5 = require('md5');
const jwt = require('jsonwebtoken');

const helpers = require('../helpers');

//  MODEL 
const User = require('../model/user');
const OtpLog = require('../model/otpLog');

//  ENV
const env = process.env;

//  DEFAULT
const privateKey = env.SECRET_KEY;

//  ERROR MSG
const userNoDataErr = 'No data found';
const userActiveStatusErr = "You're blocked by Admin";
const userVerifyStatusErr = "Your account is not verified.";

//  GET TOKEN
async function getToken(req,res){
  return await jwt.sign({'data': req}, privateKey);
}

let data = {
    data : '',    
}

module.exports = {
    
    login: async(req,res,next) => {
        //  SCHEMA & VALIDATION
        let post_data = req.body;
        let schema = {
            email_mobile: Joi.required(),
            password: Joi.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*?[0-9])[a-zA-Z!@&%\d]{8,30}$/)
        }
        let validator = Joi.validate(post_data, schema);
        if(validator.error)
            return res.status(400).json(validator.error.details[0].message);

        let email_mobile = post_data['email_mobile'];
        let password = md5(post_data['password']);
        
        //  USER DATA
        let user = await User.findOne().or([
            { email: email_mobile },{ mobile: email_mobile}
        ])
        .where('password').equals(password)

        //  NO DATA
        if(user == "" || user == null){
            return res.status(400).json(userNoDataErr);
        }

        //  ACTIVE STATUS
        if(!user.active_status || user.active_status !=1){
            return res.status(400).json(userActiveStatusErr);
        }

        //  VERIFY STATUS
        if(!user.verify_status || user.verify_status !=1){
            //  NEED TO SEND OTP HERE
            return res.status(400).json(userVerifyStatusErr);
        }

        //  GET TOKEN
        let token = await getToken(user);

        let data = { data: user, token: token };
        return res.status(200).json(data);
    },

    loginWithOtp: async(req,res,next) => {
        //  SCHEMA & VALIDATION
        let post_data = req.body;
        let schema = {
            email_mobile: Joi.required()
        }
        let validator = Joi.validate(post_data, schema);
        if(validator.error)
            return res.status(400).json(validator.error.details[0].message);

        let email_mobile = post_data['email_mobile'];
        
        //  USER DATA
        let user = await User.findOne().or([
            { email: email_mobile },{ mobile: email_mobile}
        ])

        //  NO DATA
        if(user == "" || user == null){
            return res.status(400).json(userNoDataErr);
        }

        //  ACTIVE STATUS
        if(!user.active_status || user.active_status !=1){
            return res.status(400).json(userActiveStatusErr);
        }

        //  VERIFY STATUS
        if(!user.verify_status || user.verify_status !=1){
            //  NEED TO SEND OTP HERE
            return res.status(400).json(userVerifyStatusErr);
        }

        //  STORE NEW OTP 
        let newOtp = helpers.getRandomData();
        user.otp = newOtp;
        user.save();

        let sendOtp = await helpers.otp({
            'type': 1,
            'user_id': user._id,
            'otp': newOtp,
            'number': user.mobile,
        })

        if(sendOtp == false){
            return res.status(400).json('Try After Sometime');
        }

        let data = { data: user,type:1};
        return res.status(200).json(data);
    },
    signup: async (req, res, next) => {
    //  SCHEMA & VALIDATION
        let post_data = req.body;
        let schema = {
            name: Joi.string().alphanum().required(),
            mobile: Joi.number().integer().required(),
            email: Joi.string().email().required(),
            password: Joi.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*?[0-9])[a-zA-Z!@&%\d]{8,30}$/)
        }
        let validator = Joi.validate(post_data, schema);
        if (validator.error) 
            res.status(400).send(validator.error.details[0].message);
    //  DATA
        let password = md5(post_data['password']);
        let uniqueId = helpers.getRandomData(8,1,1);
        let newOtp = helpers.getRandomData();
        let mobile = `+91${post_data["mobile"]}`;

        try {
    //  STORE USER DATA
            User.create({
                unique_id: uniqueId,
                name: post_data["name"],
                email: post_data["email"],
                password: password,
                mobile: mobile,
                active_status: 1,
                verify_status: 0,
                image: "",
                user_type: 2,
                wallet_amount: 20.5,
                otp: newOtp,
                gender: 1
            })
            .then(user => {
                //  SEND OTP
                helpers.otp({
                    'type': 1,
                    'user_id': user._id,
                    'otp': newOtp,
                    'number': user.mobile,
                }).then((data) => {
                    let response = { id: user._id, type: 1 }
                    return res.status(200).send(response);
                }).catch((err) => {
                    return res.status(400).json('Incorrect Mobile Number');
                })
            }).catch(err => {
                if (err.errmsg) return res.send(err.errmsg);
            });
        }
        catch(err){
            return res.status(400).send('Something went wrong')
        }
    },
    verifyOtp: async(req,res,next) => {
    //  SCHEMA & VALIDATION
        let post_data = req.body;
        let schema = {
            id: Joi.required(),
            otp: Joi.required(),
            type: Joi.required()
        }
        let validator = Joi.validate(post_data, schema)
        if (validator.error) 
            res.status(400).send(validator.error.details[0].message);
    //  DATA
        let id = post_data['id'];
        let otp = parseInt(post_data['otp'])
        let type = post_data['type'];   // 1 - Account Activation , 2 - 2D AUTH
        let status = 400;
        let message = userNoDataErr;
        let newOtp = helpers.getRandomData();
        let data = {
            data:"",
            message:message
        }
        try {
            let user = await User.findById(id).where('active_status').equals(1)
            if(user){
                status = 400; message = 'OTP Not Matched';
                data = {message:message};
                if(parseInt(user.otp) == otp){
                    if(type == 1){
                        user.verify_status = 1;
                        user.save();

                        //  GET TOKEN
                        let token = await getToken(user);
                        data = { data: user, token: token, message:'OTP Verified Successfully'};
                    }else{
                        status = 200; message = 'OTP Verified Successfully';
                        data = {message:'OTP Verified Successfully'};
                    }
    //  STORE NEW OTP
                    user.otp = newOtp;
                    user.save();
                }
            }
        }catch(err){
            
        }
    return res.status(status).json(data);
    },

    resendOtp: async(req,res,next) => {
    //  SCHEMA & VALIDATION
        let post_data = req.body;
        let schema = {
            id: Joi.required(),
        }
        let validator = Joi.validate(post_data, schema)
        if (validator.error) 
            res.status(400).send(validator.error.details[0].message);
    //  DATA
        let id = post_data['id'];
        let status = 400;
        let message = userNoDataErr;
        let newOtp = helpers.getRandomData();
    //  GET DATA
        try{
            let user = await User.findById(id).where('active_status').equals(1)
            if(user){
                user.otp = newOtp;
                user.save();
                status = 400; message = 'Try After Sometime';
    //  SEND OTP
                let sendOtp = await helpers.otp({
                    'type': 1,
                    'user_id': user._id,
                    'otp': newOtp,
                    'number': user.mobile,
                })
                if(sendOtp) {
                    status = 200; message = 'OTP has sent to your mobile';
                }
            }
        }catch(err){
            
        }
    return res.status(status).json(message);
    },

    forgotPassword: async(req,res,next) => {
    //  SCHEMA & VALIDATION
        let post_data = req.body;
        let schema = {
            email_mobile: Joi.required()
        }
        let validator = Joi.validate(post_data, schema);
        if (validator.error)
            res.status(400).send(validator.error.details[0].message);
    //  DATA
        let email_mobile = post_data['email_mobile'];
        let status = 400;
        let message = userNoDataErr;
        let newOtp = helpers.getRandomData();
    //  GET DATA
        try{
            let user = await User.findOne().or([{ email: email_mobile }, { mobile: email_mobile }])
            if(user){
    //  STORE OTP
                user.otp = newOtp;
                user.save();
                status = 400; message = 'Try After Sometime';                
    //  SEND OTP
                let sendOtp = await helpers.otp({
                    'type': 2,
                    'user_id': user._id,
                    'otp': newOtp,
                    'number': user.mobile,
                })
                if(sendOtp) {
                    status = 200; message = 'OTP has sent to your mobile';
                }
            }
        }catch(err){
            
        }
    return res.status(status).json(message);
    },

    resetPassword: async(req,res,next) => {
    //  SCHEMA & VALIDATION
        let post_data = req.body;
        let schema = {
            id: Joi.required(),
            password: Joi.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*?[0-9])[a-zA-Z!@&%\d]{8,30}$/),
            confirm_password: Joi.required().valid(Joi.ref('password'))
        }
        let validator = Joi.validate(post_data, schema);
        if (validator.error)
            res.status(400).send(validator.error.details[0].message);
    //  DATA
        let id = post_data['id'];
        let password = post_data['password'];
        let status = 400;
        let message = userNoDataErr;
        let newOtp = helpers.getRandomData();
    //  GET DATA
        try{
            let user = await User.findById(id)
            if(user){
    //  NEED TO CHECK IF OTP LOGS DATA  && TIME - 5 MIN
                let otpLog = await OtpLog.findOne({
                    created_at:{
                        $gte:   new Date(new Date().setHours(00,00,00)),
                        $lt :  new Date(new Date().setHours(23,59,59)) 
                    }
                }).where('user').equals(id).where('status').equals(1)
                .sort({ created_at: -1 })
                
                if(otpLog){
    //  STORE NEW PASSWORD
                    user.password = md5(password);
                    user.save();
    //  CHANGE OTP LOG STATUS
                    otpLog.status = 3;  //  FINISHED
                    otpLog.save();
                    status = 200; message = 'Password has been changed Successfully';                    
                }
            }
        }catch(err){
            
        }
    return res.status(status).json(message);
    }
};

/*
app.post('/api/login', (req, res) => {
    //  POST DATA
    var post_data = req.body
    var password = post_data['password']
    var email_mobile = post_data['email_mobile']

    const schema = {
        email_mobile: Joi.required(),
        password: Joi.required()
    }

    var validator = Joi.validate(post_data, schema);

    if (validator.error) {
        res.status(400).send(validator.error.details[0].message)
    }
    password = md5(password);
    //  QUERY
    User.findOne().or([
        { email:  email_mobile },
        { mobile: email_mobile }
    ])
    .where('password').equals(password)
    .where('active_status').equals(1)
    .then((data) => {
        var dataLength = Object.keys(data).length;
        if (!dataLength > 0) {
            res.send('No Data Found').status(400);
        }
        res.send(data).status(200);
    }).catch((err) => {
        res.send(err);
    })
})

app.post('/api/login-with-otp', (req, res) => {
    
    var post_data = req.body
    var email_mobile = post_data['email_mobile'];

    const schema = {
        email_mobile:Joi.required()
    }

    var validator = Joi.validate(post_data,schema);

    if(validator.error){
        res.status(400).send(validator.error.details[0].message);
    }

    User.findOne().or([
        { email  : email_mobile },
        { mobile : email_mobile }
    ])
    .where('active_status').equals(1)
    .then((data) => {
        var dataLength = Object.keys(data).length;
        if (!dataLength > 0) {
            res.status(400).send('No data Found');
        }
        //  STORE NEW OTP 
        var otp = getRandomData();
        data.otp = otp;
        data.save();

        //  FORM NEW ARRAY
        let otpData = {
            id: data._id
        }

        res.status(200).send(otpData);
    }).catch((err) => {
        res.status(400).send("No data Found");
    })
})

app.post('/api/verify-otp', (req, res) => {
    var post_data = req.body;

    const schema = {
        id: Joi.required(),
        otp: Joi.required(),
        type: Joi.required()
    }    

    var validator = Joi.validate(post_data, schema)

    if (validator.error) {
        res.status(400).send(validator.error.details[0].message);
    }

    var id = post_data['id'];
    var otp = post_data['otp'];
    let type = post_data['type'];   // 1 - Account Activation , 2 - 2D AUTH

    User.findById(id)
        .where('active_status').equals(1)
        .then((data) => {
            if (data.otp == otp) {
                if(type == 1){
                    data.otp = "Invalid";
                    data.verify_status = 1; //  ACTIVE
                    data.save();
                    return res.status(200).send(data);
                }
                return res.status(200).send('Otp matched');
            }
            return res.status(400).send("Otp Not matched");
        })
        .catch((err) => {
            res.status(400).send('No data Found');
        })
})

app.post('/api/resend-otp', (req, res) => {
    var post_data = req.body;

    const schema = {
        id: Joi.required(),
    }

    var validator = Joi.validate(post_data, schema)

    if (validator.error) {
        res.status(400).send(validator.error.details[0].message);
    }

    var id = post_data['id'];

    User.findById(id)
        .where('active_status').equals(1)
        .then((data) => {
            var otp = getRandomData();
            data.otp = otp;
            data.save();
            return res.status(200).send('OTP has resend Again');
        })
        .catch((err) => {
            return res.status(400).send("No data Found");
        })
})

function getRandomData(length = "") {
    var str_length = length ? length : 6;
    return randomString({ length: str_length, numeric: true, letters: false });
}

app.post('/api/signup', (req, res) => {
    var post_data = req.body;

    var schema = {
        name: Joi.string().alphanum().required(),
        mobile: Joi.number().integer().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    }

    var validator = Joi.validate(post_data, schema);

    if (validator.error) {
        res.status(400).send(validator.error.details[0].message);
    }


    let password = md5(post_data['password']);
    let unique_id = getRandomData();
    let otp = getRandomData();

    User.create({
        unique_id: unique_id,
        name: post_data["name"],
        email: post_data["email"],
        password: password,
        mobile: post_data["mobile"],
        country_code: "+91",
        active_status: 1,
        verify_status: 0,
        image: "",
        user_type: 2,
        wallet_amount: 20.5,
        otp: otp,
        gender: 1
    })
      .then(data => {
          let otpData = {
              id: data._id
          }
          return res.status(200).send(otpData);
      })
      .catch(err => {
          if (err.errmsg) {
              return res.send(err.errmsg);
          }
        res.send(err);
      });
})

app.post('/api/forgot-password', (req, res) => {

    var post_data = req.body;

    const schema = {
        email_mobile: Joi.required()
    }

    const validator = Joi.validate(post_data, schema);
    if (validator.error) {
        res.status(400).send(validator.error.details[0].message);
    }
    var email_mobile = post_data['email_mobile']

    User.findOne().or([
        { email  :  email_mobile },
        { mobile :  email_mobile }
    ])
    .then((data) => {
        var dataLength = Object.keys(data).length;
        if (!dataLength > 0) {
            res.status(400).send('No data found')
        }
        let otpData = {
            id: data._id
        }
        res.status(200).send(otpData);
    }).catch((err) => {
        console.log('err');
        res.send(err);
    })
})


//  OTP LOGS - USER QUERY
/*
            let otpLog = await OtpLog.findOne({
                created_at:{
                    $gte: new Date(new Date().setHours(00,00,00)),
                    $lt : new Date(new Date().setHours(23,59,59))
                }
            }).where('user').equals(id).where('status').equals(1)
            .sort({ created_at: -1 })


            let otpLog = await OtpLog.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as:'user'
                    }
                }, {
                    $unwind: '$user'
                },
                {
                    $match:{ '$user._id':id}
                }
            ]).sort({ created_at: -1 })
            .limit(1)


//  let user = await User.findById(id).where('active_status').equals(1)

let user = await User.aggregate([
    {
        $lookup: {
            from: 'otplogs',
            localField: '_id',
            foreignField: 'user',
            as: 'otp_logs'
        }
    },
    {
        $sort: { "otp_logs.created_at": -1 }
    },
    {
        $match: {
            _id: id,
            "otp_logs.created_at": {
                $gte: new Date(1449532800000),
            },
            "otp_logs.type": type,
            "otp_logs.otp": otp
        }
    }
])

module.exports = app;
*/