// import users routes
const loginRoutes = require('./login');
const newUserRoutes = require('./newUser');

const constructorMethod = (app) => {
	// user routes
	app.use('/login', loginRoutes);
	app.use('/new-user', newUserRoutes);

	// dummy homepage (which catches all other routes for now)
	app.use('/',(req,res) => {
		res.render('dummy/home',{title: "Home"});
	});
}

module.exports = constructorMethod;