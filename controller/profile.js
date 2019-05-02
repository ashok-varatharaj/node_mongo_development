const express = require('express');
const app = express();
const Joi = require('joi');
const md5 = require('md5');
// const multer = require('multer');
// const upload = multer({ dest: 'uploads/' });

//  MODEL
const User = require('../model/user');

//  HELPERS
const helpers = require('../helpers');

//  DEFAULT
let data = {
    data: '',
    message: 'No data Found',
}
let status = 400;
const invalidTokenErr = 'Invalid Secret Key | Token';

module.exports = {
    profile:async(req,res,next) => {
    //  SCHEMA & VALIDATION
        let post_data = req.body;
        let schema = {
            id: Joi.string().required(),
            token: Joi.string().required()
        }
        let validator = Joi.validate(post_data, schema);
        if(validator.error)
            return res.status(400).json(validator.error.details[0].message);

        let id = post_data['id'];
        let token = post_data['token'];
    //  MONGO - $MATCH REQUIRES MONGO OBJECT ID, SO CONVERTING STRING TO MONGOOSE OBJECT ID
        id = helpers.getObjectId(id);

    //  TOKEN VERIFICATION
        let verifyToken = helpers.verifyToken(post_data);
        if (verifyToken != true) {
            return res.status(400).json(invalidTokenErr);
        }

    //  USER DATA
        let user = await User.aggregate([
            {
                $match: {
                    _id: id
                }
            },{
                $lookup: {
                    from: 'todos',
                    localField: 'todos',
                    foreignField: '_id',
                    as: 'todos'
                }
            }
        ])
    //  USER EXISTS
        if (user) {
            user = await helpers.getUserImage(user);
            user = user[0];
            data = { data: user, message: 'User Data' }; status = 200;
        }
        return res.status(status).send(data);
    },
    updateProfile: async (req, res, next) => {
        let post_data = req.body;
        
    }
};

/*
app.post("/api/user/profile", (req, res) => {
    let post_data = req.body;

    const schema = {
        id: Joi.string().required(),
        token : Joi.string().required()
    }

    const validator = Joi.validate(post_data, schema);

    if (validator.error) {
        res.status(400).send(validator.error.details[0].message);
    }

    let id = post_data['id'];

    User.findById(id).and([
        { user_type: 2 },
        { active_status: 1 },
        { verify_status: 1 }
    ])
    .then((data) => {
        let dataLength = Object.keys(data).length;

        return res.status(200).send(data);
    })
    .catch((err) => {
        return res.status(400).send('No data Found');
    })    
});

[
    {
        "_id": "5c60517c6713bd2f9ffe3f6d",
    }
]
app.put("/api/user/update-profile/:id", (req, res) => {
    
    let post_data = req.body;
    let id = post_data['id'];

    User.findByIdAndUpdate(id,post_data)
        .then((data) => {
            return res.status(200).send('User has updated successfully');
        })
        .catch((err) => {
            return res.status(400).send('No data found');
        })
    
});

app.post("/api/user/change-password", (req, res) => {
    let post_data = req.body;

    const schema = {
        id: Joi.string().required(),
        token: Joi.string().required(),
        old_password: Joi.string().required(),
        new_password: Joi.string().required(),
        confirm_password: Joi.string().required().valid(Joi.ref('new_password')),
    };

    const validator = Joi.validate(post_data, schema);

    if (validator.error) {
        return res.status(400).send(validator.error.details[0].message);
    }

    let id = post_data['id'];
    let old_password = md5(post_data['old_password']);
    let new_password = md5(post_data["new_password"]);
    
    User.findById(id).and([
        { active_status: 1 },
        { verify_status: 1 },
        { user_type: 2 },
    ]).then((data) => {
        if(data){
            if(data.password == old_password){
                data.password = new_password;
                data.save();
                return res.status(200).send("Password changed Successfully");
            }else{
                return res.status(200).send("Old Password Incorrect");
            }
            return res.status(200).send('ad');
        }else{
            return res.status(400).send("No data Found");    
        }
    }).catch((err) => {
        return res.status(400).send("No data Found");
    })
})

module.exports = app;
*/