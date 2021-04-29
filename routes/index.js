// import users routes
const loginRoutes = require('./login');
const newUserRoutes = require('./newUser');

const constructorMethod = (app) => {
	// user routes
	app.use('/login', loginRoutes);
	app.use('/new-user', newUserRoutes);
	// log the user out
	app.use('/logout', async (req, res) => {
		// expire the cookie
		req.session.destroy();
		// display the logout message
		res.render('users/logout-message',{title: "Logged Out", loggedIn: false});
	});

	/* dummy routes */
	// dummy profile page
	app.use('/profile', (req, res) => {
		res.render('dummy/profile', {title: "Dummy Profile", loggedIn: true});	// render the appropriate nav bar, based on whether the user is logged in
	});
	// dummy question forum
	app.use('/question-forum',(req,res) => {
		res.render('dummy/question-forum',{
			title: "Dummy Question Forum",
			loggedIn: !!req.session.user
			// partial: req.session.user ? 'logged-in' : 'logged-out'	// render the appropriate nav bar, based on whether the user is logged in
		});
	});
	// dummy top rated tutors
	app.use('/top-rated-tutors',(req,res) => {
		res.render('dummy/top-rated-tutors',{
			title: "Dummy Top Rated Tutors Page",
			loggedIn: !!req.session.user
			// partial: req.session.user ? 'logged-in' : 'logged-out'	// render the appropriate nav bar, based on whether the user is logged in
		});
	});
	// dummy homepage (which catches all other routes for now)
	app.use('/',(req,res) => {
		res.render('dummy/home',{
			title: "Dummy Home",
			loggedIn: !!req.session.user
			// partial: req.session.user ? 'logged-in' : 'logged-out'	// render the appropriate nav bar, based on whether the user is logged in
		});
	});
}

module.exports = constructorMethod;