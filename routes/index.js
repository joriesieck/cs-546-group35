// import users routes
const loginRoutes = require('./login');
const newUserRoutes = require('./newUser');
const path = require("path");
const questionsRoutes = require('./questions-forum');
const profileRoutes = require('/profile');

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
		res.render('users/logout-message',{title: "Logged Out", loggedIn: false});
	});
	app.use('/profile', profileRoutes);

	// dummy top rated tutors
	app.use('/toptutors',(req,res) => {
		res.render('users/toptutors',{
			title: "Dummy Top Rated Tutors Page",
			loggedIn: !!req.session.user
			// partial: req.session.user ? 'logged-in' : 'logged-out'	// render the appropriate nav bar, based on whether the user is logged in
		});
	});
	// dummy homepage (which catches all other routes for now)

	app.use("/questions-forum", questionsRoutes);
	/* dummy routes */
	// dummy profile page
	app.use('*', (req, res) => {
        res.status(404).sendFile(path.resolve("static/error.html"));
    });
}

module.exports = constructorMethod;
