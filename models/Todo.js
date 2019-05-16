const mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    }
});

// overriding toJSON method. it will return only selected fields while converting from mongo model to json object
TodoSchema.methods.toJSON = function() {
    var todo = this.toObject();
    return {title: todo.title, completed: todo.completed};
}

const Todo = mongoose.model('Todos', TodoSchema);

module.exports = { Todo };