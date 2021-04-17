// import required packages
const express = require('express');
const app = express();
const static = express.static(__dirname + '/public');

const configRoutes = require('./routes');
const exphbs = require('express-handlebars');
const session = require('express-session');

app.use('/public',static);
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// set up session
app.use(session({
	name: 'AuthCookie',
	secret: 'this is our secret string',
	resave: false,
	saveUninitialized: true
}));

// set up middleware
// TODO

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine','handlebars');

configRoutes(app);

// start routes
app.listen(3000, () => {
	console.log('routes running on http://localhost:3000');
})