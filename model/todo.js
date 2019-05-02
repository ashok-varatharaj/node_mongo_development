const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = require('./user');

const todoSchema = new Schema({
    title: String,
    completed: Boolean,
    //  completed: { type: Boolean, default: true},
    active_status: Number,
    created_at: { type:Date, default: Date.now},
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    testData:{type:String,default:'Test'}
})

todoSchema.virtual('virtualTitle').get(() => {
    return 'Ashok Kumar';
});

const Todo = mongoose.model('Todo', todoSchema);
module.exports = Todo;