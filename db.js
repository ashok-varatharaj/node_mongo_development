const env = require('dotenv');
env.config();

let databaseUrl = process.env.databaseUrl;

const mongoose = require('mongoose');
mongoose.connect(databaseUrl, { useNewUrlParser: true })
    .then((data) => {
        console.log('Mongo daw');
    }).catch((err) => {
        console.log('err');
    })
module.exports = mongoose;