const express = require('express');
const app = express()

const Joi = require('joi');

//  MODEL
const User = require('../model/user');

//  HELPERS
const helpers = require('../helpers');

//  PATH
const userImagePath = '/uploads/users';
const userDefaultImage = `${userImagePath}/twitter.png`;

//  DEFAULT
let data = {
    data : '',
    message: 'No data Found',
}
let status = 400;

module.exports = {
    userList:async(req,res,next) => {
        let post_data = req.body;
        let id = req.params.id;
        let schema = {
            id: Joi.string().required(),
            token : Joi.string().required()
        }
        let validator = Joi.validate(post_data, schema);
        if (validator.error)
            res.status(status).send(validator.error.details[0].message);

        try {
            let image = "";
            let users = await User.find().and([{ user_type: 2 }])

            //  GET SINGLE RECORD
            if(id){
                let ObjectIdValidation = await helpers.objectIdValidation(id);
                if(ObjectIdValidation == true){
                    let user = users.filter((user) => {
                        return user._id = id;
                    })
                    if(user){
                        user = await helpers.getUserImage(user);
                        user = user[0];
                        data = { data: user, message: 'User Data' }; status = 200;
                    }
                }
            }else if(users){
            //  GET ALL RECORD
                users = await helpers.getUserImage(users);
                data = { data:users,message:'User List'};status = 200;
            }
        }catch(err){

        }
        return res.status(status).send(data);
    },
    deleteUser: async (req, res, next) => {
        let id = req.params.id;
        let ObjectIdValidation = await helpers.objectIdValidation(id);
        if(ObjectIdValidation == true && id!=""){
            let user = await User.findById(id).and([{ user_type: 2 }])
            if (user) {
                user.active_status = 2;
                user.save();
                data = { message: 'User has been deleted successfully' }; status = 200;
            }
        }
        return res.status(status).json(data);
    },
}

/*
app.post('/api/admin/user/list', (req, res) => {
    let post_data = req.body;
    let schema = {
        id: Joi.string().required(),
        token : Joi.string().required()
    }
    let validator = Joi.validate(post_data, schema);
    if (validator.error)
        res.status(status).send(validator.error.details[0].message);

    try{
        let user  = await User.find().and([{user_type : 2}])
        if(user){
            data = { data:user,message:'User List'};status = 200;
        }
    }catch(err){

    }
    return res.status(status).send(data);
})

app.post('/api/admin/user/list/:id', (req,res) => {
    let post_data = req.body
    let id = req.params.id

    const schema = {
        id: Joi.string().required(),
        token : Joi.string().required()
    }

    const validator = Joi.validate(post_data, schema);

    if (validator.error) {
        res.status(400).send(validator.error.details[0].message);
    }

    User.findById(id).and([
        { user_type : 2 }
    ])
    .then((data) => {
        let dataLength = Object.keys(data).length;

        return res.status(200).send(data);
    })
    .catch((err) => {
        return res.status(400).send('No data Found');
    })
});

app.delete('/api/admin/user/list/:id',(req,res) => {
    let id = req.params.id
    let post_data = req.body;

    const schema = {
        id: Joi.string().required(),
        token : Joi.string().required()
    }

    const validator = Joi.validate(post_data, schema);

    if (validator.error) {
        res.status(400).send(validator.error.details[0].message);
    }

    User.findById(id).and([
        { user_type : 2 }
    ])
    .then((data) => {
        let dataLength = Object.keys(data).length;

        if(dataLength == 0){
            return res.status(400).send('No data Found');    
        }

        data.active_status = 2; // DELETE
        data.save();

        return res.status(200).send('User has deleted successfully');
    })
    .catch((err) => {
        return res.status(400).send('No data Found');
    })    
    
})

function checkAuth(post_data) {

    let id = post_data['id']
    let token = post_data['token']

    User.findById(id)
    .and([
        { token: token },
        { user_type : 1}
    ]).then((data) => {
        return data;
    }).catch((err) => {
        return err;
    })
}

module.exports = app;

*/