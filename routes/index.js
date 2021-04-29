// import users routes
const loginRoutes = require('./login');
const newUserRoutes = require('./newUser');
const path = require("path");
const questionsRoutes = require('./questions-forum');

const constructorMethod = (app) => {
	// user routes
	app.get('/',(req,res) => {
		res.render('home/home',{title: "Stress-Less Tutoring"});
	app.use('/login', loginRoutes);
	app.use('/new-user', newUserRoutes);
	// log the user out
	app.use('/logout', async (req, res) => {
		// expire the cookie
		req.session.destroy();
		// display the logout message
		res.render('users/logout-message',{title: "Logged Out"});
	});
	app.use("/questions-forum", questionsRoutes);
	/* dummy routes */
	// dummy profile page
	app.use('/profile', (req, res) => {
		res.render('dummy/profile', {title: "Dummy Profile"});
	});
	app.use('*', (req, res) => {
        res.status(404).sendFile(path.resolve("static/error.html"));
    });

}

module.exports = constructorMethod;
