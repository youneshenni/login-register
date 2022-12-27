const bodyParser = require('body-parser');
const express = require('express');
const fs = require('fs');
const { z } = require('zod');
const { validateRequestBody } = require('zod-express-middleware');

const exists = fs.existsSync('./data.json');
if (!exists) {
    fs.writeFileSync('./data.json', JSON.stringify([]));
}

let currentUser = null;

const app = express();

app.use(bodyParser.urlencoded())

app.use(express.static('src/static'))
app.set('view engine', 'ejs');
app.set('views', 'src/views');

app.get('/', (req, res) => {
    return res.render('index');
    }
);

app.get('/login', (req, res) => {
    res.redirect('/login.html');
})

app.post('/login', (req, res) => {
    try {
        const buffer = fs.readFileSync('./data.json');
        const data = JSON.parse(buffer.toString());
        const { email, password } = req.body;
        const user = data.find(user => user.email === email && user.password === password);
        if (user) {
            currentUser = user;
            res.redirect('/bienvenue');
        } else res.render('register', {error: 'Email ou mot de passe incorrect'});

    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
    res.redirect('/login.html');
})

app.get('/register', (req, res) => {
    res.render('register', {error: null});
    });

    app.post('/register', (req, res) => {
        try {
            const {name, email, password} = req.body;
            const buffer = fs.readFileSync('./data.json');
            const data = JSON.parse(buffer.toString());
            fs.writeFileSync("./data.json", JSON.stringify([...data, {name, email, password}]));
            res.redirect('/');
        } catch( e) {
            console.error(e);
            res.status(500).send("Internal Server Error");
        }
    })

    app.get('/bienvenue', (req, res) => {
        if (!currentUser) res.redirect('/');
        res.render('bienvenue', {name: currentUser.name});
    })

    app.get('/logout', (req, res) => {
        currentUser = null;
        res.redirect('/');
    })

app.listen(3000, () => {
    console.log('Listening on port 3000');
    }
);