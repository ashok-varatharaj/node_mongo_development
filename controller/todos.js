const express = require('express');
const app = express();

//  PACKAGES
const Joi = require('joi');
const jwt = require('jsonwebtoken');

//  MODEL
const Todo = require('../model/todo');
const User = require('../model/user');

//  HELPERS
const helpers = require('../helpers');
const env = process.env;

let Model = Todo;
const err_msg = 'No data Found';


//  METHOD 2 => WRITE FUNCTION INSIDE IN MODULE.EXPORTS
module.exports = {
    getTodo: async (req, res, next) => {
        let id = req.params.id;

        //  LIMIT
        let limit = req.query.limit ? parseInt(req.query.limit) : 10;
        let todoList = await Model.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user'
                }
            }
        ]).sort({ 'created_at': 'desc' })
        .limit(limit)

        //  GET SINGLE RECORD
        if (id) {
            let ObjectIdValidation = await helpers.objectIdValidation(id);
            if (ObjectIdValidation == false)
                return res.status(400).json('Not an Mongo Object ID');
            let todoData = todoList.filter((todo) => {
                return todo._id == id;
            })
            if (todoData) {
                todoList = todoData[0];
            }
        }
        return res.status(200).json(todoList);
    },
    storeTodo: async (req, res, next) => {
        let post_data = req.body;
        let id = req.params.id;
        const schema = {
            title: Joi.string().required(),
            completed: Joi.boolean(),
            user_id: Joi.string().optional()
        }
        //  JOI VALIDATION 
        const validator = Joi.validate(post_data, schema);
        if (validator.error) {
            return res.status(400).json(validator.error.details[0].message);
        }
        //  STORE
        var TodoData = new Todo(post_data);
        //  FIND BY ID & UPDATE
        if (id) {
            let ObjectIdValidation = await helpers.objectIdValidation(id);
            if (ObjectIdValidation == false)
                return res.status(400).json('Not an Mongo Object ID');            
            TodoData = await Model.findOneAndUpdate({ _id: id }, post_data);
        }
        if (post_data['user_id']) {
            const user_id = post_data['user_id'];
            //  STORE TODO DATA IN USER TABLE
            const userData = await User.findById(user_id);
            TodoData.user = userData;

            //  STORE USER ID IN TODO TABLE
            userData.todos.push(TodoData);
            await userData.save();
        }
        //  SAVE TODO DATA
        await TodoData.save();
        return res.status(200).json(TodoData);
    },
    deleteTodo: async (req, res, next) => {
        let id = req.params.id;
        let ObjectIdValidation = await helpers.objectIdValidation(id);
        if(ObjectIdValidation == false)
            return res.status(400).json('Not an Mongo Object ID');
        
        if(id){
            let todoData = await Todo.findById(id);
            todoData.active_status = 2;
            await todoData.save();
            return res.status(200).json('Todo Deleted Successfully');
        }
    },
    getJwt: async (req, res, next) => {
        let post_data = req.body;
        let privateKey = env.SECRET_KEY;
        let user = await helpers.getUser('5c5fd5563a47f30d8f26ddb7');
        let token = jwt.sign({'data': user}, privateKey);

        try {
            let decodeToken = jwt.verify(token, privateKey, (err, decoded) => {
                if (err) {
                    return res.json('Invalid Secret Key | Token');
                }
                return res.json('Valid Token')
            })
        } catch (err) {
            return res.json('Invalid Token')
        }
    },
};

/*

//  METHOD 1

app.get(`${moduleName}`, (req, res) => {

    const time = helpers.getLastMonth();
    Todo.aggregate([

        {
            $match: {
                created_at: {$gt: new Date(time)}
            }
        },
        {
            $group: {
                _id: '$created_at',
                count: {$sum: 1}
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as:'users'
            }
        }
    ]).then((data) => {
        res.status(200).send(data);
    }).catch((err) => {
        res.status(400).send('sff');
    })

    let limit = req.query.limit ? parseInt(req.query.limit) : 1;
    Todo.aggregate([{
        $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'users'
        }
    }])
    .then((data) => {
        if(!data.length > 0){
            return res.status(400).json(err_msg);
        }
        return res.status(200).json(data);
    }).catch((err) => {
        return res.status(400).json(err);
    })
})

app.get(`${moduleName}/:id`, (req, res) => {
    let id = req.params.id;

    Model.findById(id)
        .then((data) => {
            return res.status(200).json(data);
        }).catch((err) => {
            return res.status(400).json(err_msg);
        })
})

app.post(`${moduleName}`, (req, res) => {

    let post_data = req.body;

    const schema = {
        title: Joi.string().required(),
        completed: Joi.boolean(),
        user_id: Joi.string().optional()
    }
    const validator = Joi.validate(post_data, schema);
    if(validator.error){
        return res.status(400).json(validator.error.details[0].message);
    }

    // let user = getUser('5c5fd5563a47f30d8f26ddb7')
    //     .then((data) => {
    //         userData = data;
    //         return res.json(data);
    //     }).catch((err) => {
    //         return res.json(err);
    //     });

    //  return res.json(userData);

    // let userData = helpers.getUser('5c5fd5563a47f30d8f26ddb7')
    //     .then((data) => {
    //         return res.json(data);
    //     }).catch((err) => {
    //         return res.json(err);
    //     });

    // return res.json('test');
    // //  return res.json(userData);

    let title = post_data['title'];
    let user_id = post_data['user_id'];

    //  return res.json(user_id);

    Model.create({
        'title': title,
        'completed': false,
        'active_status': 1,
    }).then((data) => {
        return res.status(200).json(data);
    }).catch((err) => {
        return res.status(400).json(err_msg);
    })
})

async function getUser(user_id) {
    return await User.findById(user_id);
}

app.put(`${moduleName}/:id`, (req, res) => {

    let id = req.params.id;
    let post_data = req.body;

    const schema = {
        title: Joi.string().required(),
        completed: Joi.boolean()
    }

    const validator = Joi.validate(post_data, schema);

    if (validator.error) {
        return res.status(400).json(validator.error.details[0].message);
    }

    let title = post_data['title'];

    Model.findOneAndUpdate(
        {_id : id},
        post_data
    ).then((data) => {
            if (data) {
                return res.status(200).json('Todo Updated Successfully');
            }
            return res.status(400).json(err_msg);
        }).catch((err) => {
            return res.status(400).json(err_msg);
        })
})

METHOD 1
--------
app.delete(`${moduleName}/:id`, (req, res) => {

    let id = req.params.id;

    Model.findById(id)
        .then((data) => {
            if(data){
                data.active_status = 2;
                data.save();
                return res.status(200).json('Deleted');
            } else {
                return res.status(400).json(err_msg);
            }
        }).catch((err) => {
            return res.status(400).json(err_msg);
        })
})

module.exports = app;


METHOD 2
--------
    deleteTodo: async (req, res, next) => {
        let id = req.params.id;
        let ObjectIdValidation = await helpers.objectIdValidation(id);
        if(ObjectIdValidation == false)
            return res.status(400).json('Not an Mongo Object ID');

        if(id){
            let todoData = await Todo.findById(id);
            todoData.active_status = 2;
            await todoData.save();
            return res.status(200).json('Todo Deleted Successfully');
        }
    },

    Got it, It's based on each property - create rooms,rate plans && if Hotel owner accessing the Otel2go & coming to channel manager page, before we need integrate some OTA pages like B.com & AirBnb with iframe/JavaScript

    For this page integration, I've analysed in their site & rest of documents, but can't get that
*/