const express = require('express');
const app = express();

const Joi = require("joi");
const md5 = require('md5');

//  MODEL

const User = require('../model/user');


app.post("/api/admin/login", (req, res) => {
    let post_data = req.body;

    const schema = {
        email_mobile: Joi.required(),
        password: Joi.required()
    }

    const validator = Joi.validate(post_data, schema);

    if (validator.error) {
        return res.status(400).send(validator.error.details[0].message);
    }

    let email_mobile = post_data['email_mobile'];
    let password = md5(post_data['password']);

    User.findOne()
        .or([
            { email: email_mobile },
            { mobile: email_mobile }
        ])
        .and([
            { password: password },
            { active_status : 1 },
            { verify_status : 1}
        ])
        .then((data) => {
            let dataObject = Object.entries(data).length;
            return res.send(data);
        })
      .catch((err) => {
        return res.send("no data found");
      });
    
})

module.exports = app;