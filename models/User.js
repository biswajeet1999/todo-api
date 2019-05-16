const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: 'Invallid Email'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [{
        access:{
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

UserSchema.methods.toJSON = function() {
    let UserObj = this.toObject();
    let ModifiedUser = {
        email: UserObj.email,
        password: UserObj.password,
        tokens: []
    };
    for (let i = 0; i < UserObj.tokens.length; i++) {
        ModifiedUser.tokens.push({access: 'auth', token: UserObj.tokens[i].token});
    } 
    console.log('called');
    return ModifiedUser;
}

UserSchema.statics.findOneByToken = function(token) {

    try {
        var decode = jwt.verify(token, '1234'); // it will decode the token and verify the token, throw error if not match
    } catch(err) {
        console.log(err)
        return new Promise((resolve, reject) => {
            reject('Invallid Token');
        });
    }

    return User.findOne({_id: decode.id, 'tokens.token': token, 'tokens.access': 'auth'}).then((user) => {
        if (!user) {
            return new Promise((resolve, reject) => {
                reject('Invallid user');
            });
        } 
        return new Promise((resolve, reject) => {
            resolve(user);
        });
    }, (err) => {
        return new Promise((resolve, reject) => {
            reject('error');
        });
    });
}

const User = mongoose.model('Users', UserSchema);

module.exports = { User };