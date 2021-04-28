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
// logging middleware - JUST FOR TESTING
app.use(async (req, res, next) => {
	// log information to the console
	console.log(`[${new Date().toUTCString()}]: ${req.method} ${req.originalUrl} (${!req.session.user ? 'Non-' : ''}Authenticated User)`);

	// call next middleware
	next();
})

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine','handlebars');

configRoutes(app);

// start routes
app.listen(3000, () => {
	console.log('routes running on http://localhost:3000');
})