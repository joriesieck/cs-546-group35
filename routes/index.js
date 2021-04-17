// import users routes
const loginRoutes = require('./login');
const newUserRoutes = require('./newUser');

const constructorMethod = (app) => {
	// user routes
	app.use('/login', loginRoutes);
	app.use('/new-user', newUserRoutes);

	/* dummy routes */
	// dummy profile page
	app.use('/profile', (req, res) => {
		res.render('dummy/profile', {title: "Dummy Profile"});
	});
	// dummy homepage (which catches all other routes for now)
	app.use('/',(req,res) => {
		res.render('dummy/home',{title: "Dummy Home"});
	});
}

module.exports = constructorMethod;