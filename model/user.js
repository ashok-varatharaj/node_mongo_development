const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const autoPopulate = require('mongoose-autopopulate');

const autoIncrement = require('mongoose-sequence')(mongoose);

const userSchema = new Schema({
  //  _id:Schema.Types.ObjectId,
  user_id: Number,
  unique_id: String,
  name: String,
  email: String,
  password: String,
  mobile: String,
  //  country_code: String,
  active_status: Number,
  verify_status: Number,
  otp: Number,
  wallet_amount: Number,
  image: String,
  gender: Number,
  user_type: Number,
  address: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  todos: [
    {
      type: Schema.Types.ObjectId,
      ref: "todo",
      //    autopopulate:true
    }
  ]

  //  due: String,
  //  posts : [{type:Schema.Types.ObjectId, ref:'Post'}]
});

//  userSchema.plugin(autoPopulate);

//  userSchema.plugin(autoIncrement,{inc_field:'user_id'})
  
/*
    userSchema.query.byEmail = function (data) {
        return this.where({ email: data });
    }

    userSchema.query.byMobile = function (data) {
        return this.where({ mobile: data });
    }
*/
/*
var fullName = new User({
    name: {
        'first_name': 'Ashok',
        'last_name' : 'Kumar'
    }
})
*/

const User = mongoose.model('User', userSchema);
module.exports = User;

/*
    //    JOI VALIDATION

const mongoose = require('mongoose');
const Joi = require('joi');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    name: Joi.required().string().min(3),
    email: Joi.required().string().email(),
    mobile: Joi.required().integer(),
    created_at: Joi.required().validate()
});

var User = mongoose.model('User', userSchema);

module.exports = User;

*/