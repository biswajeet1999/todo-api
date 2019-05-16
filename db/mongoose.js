const mongoose = require('mongoose')

mongoose.Promise = global.Promise;
mongoose.connect('mongodb+srv://biswajeet:biswajeet@cluster0-vsuq5.mongodb.net/test?retryWrites=true' || "mongodb://localhost:27017/TodoApp" , { useNewUrlParser:true });

module.exports = { mongoose };
