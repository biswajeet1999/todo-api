const express = require('express');
const bodyParser = require('body-parser');
const {SHA256} = require('crypto-js')
const jwt = require('jsonwebtoken');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/Todo');
const {User} = require('./models/User');

const app = express()
let port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.listen(port, () => {
    console.log(`server hosted on ${port}`)
});

app.get('/' (req, res) => {
    res.send('Welcome to todo api');
})

app.post('/todo/signup', (req, res) => {
    let email = req.body.email;
    let password = SHA256(req.body.password).toString();
    let user = new User({email, password});
    user.save().then((user) => {
        res.status(200).send('Account created');
    }, (err) => {
        res.status(404).send(err);
    });
});

app.post('/todo/login', (req, res) => {
    let email = req.body.email;
    let password = SHA256(req.body.password).toString();

    // if the user found then create token and return it
    User.findOne({email, password}).then((user) => {
        if (!user){
            return res.status(404).send('Invallid user name or password');
        }
        let access = 'auth';
        let token = jwt.sign({id:user._id.toString()},'1234').toString();  // the id object must be string
        user.tokens.push({access, token})

        user.save().then((user) => {
            res.header('x-auth', token).send('Logged in');
        }).catch((e) => {
            res.status(404).send(err);
        })

    }, (err) => {
        res.status(404).send(err);
    });
});

// this function will first verify user  name and password then verify token
function authenticate(req, res, next) {
    let token = req.header('x-auth');
    
    User.findOneByToken(token).then((user) => {
        req.user = user;
        req.token = token;
        next();
    }, (err) => {
        res.status(404).send(err);
    });

}

app.get('/todo/get', authenticate, (req, res) => {
    let {email} = req.user;
    
    Todo.find({email}).then((todos) => {
        res.status(200).send(todos);
    }, (err) => {
        res.status(404).send(err);
    });

});

app.post('/todo/add', authenticate, (req, res) => {
    let {email} = req.user;
    let {title} = req.body;

    let completed = false;
    if (req.body.completed) {
        completed = true;
    }
    let todo = new Todo({title, completed, email});
    todo.save().then((todo) => {
        res.status(200).send(todo);
    }, (err) => {
        res.status(404).send(err);
    });
});

// it will make particular todo completed true or false
app.put('/todo/update', authenticate, (req, res) => {
    let {email} = req.user;
    let {title} = req.body;
    let {completed} = req.body;
    //                      filter          update      return updated object
    Todo.findOneAndUpdate({email, title}, {completed}, {new: true}).then((todo) => {
        res.status(200).send(todo);
    }, (err) => {
        res.status(404).send(err);
    });
});

app.delete('/todo/delete', authenticate, (req, res) => {
    let {email} = req.user;
    let {title} = req.body;

    Todo.findOneAndDelete({email, title}).then((todo) => {
        res.status(200).send(todo);
    }, (err) => {
        res.status(404).send('unable');
    });
});

app.get('/todo/logout', authenticate, (req, res) => {
    let {token} = req;
    let {user} = req;
    let index;
    for (let i=0; i < user.tokens.length; i++ ) {
        if (token === user.tokens[i].token) {
            index = i;
            break;
        }
    }
    
    let item = user.tokens.splice(index, 1);
    new User(user).save().then((user) => {
        res.status(200).send('Successfully logged out');
    }, (err) => {
        res.status(400).send(err);
    })
});