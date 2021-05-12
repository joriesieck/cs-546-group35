// import routes
const loginRoutes = require('./login');
const newUserRoutes = require('./newUser');
const requestTutorRoute = require('./requestTutor');
const path = require("path");
const questionsRoutes = require('./questions-forum');
const profileRoutes = require('./profile');
const toptutorsRoutes = require('./toptutors');

const constructorMethod = (app) => {
	// user routes
	app.get('/',(req,res) => {
		res.render('home/home',{title: "Stress-Less Tutoring", loggedIn: !!req.session.user});
	});
	app.use('/login', loginRoutes);
	app.use('/new-user', newUserRoutes);
	app.use('/request-tutor',requestTutorRoute);

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
		});
	});
	//app.use('/toptutors',toptutorsRoutes);
	// dummy homepage (which catches all other routes for now)

	// question forum
	app.use("/questions-forum", questionsRoutes);
	
	// invalid urls
	app.use('*', (req, res) => {
        res.status(404).sendFile(path.resolve("static/error.html"));
    });
}

module.exports = constructorMethod;
