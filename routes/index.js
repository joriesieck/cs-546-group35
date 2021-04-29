const path = require("path");
const questionsRoutes = require('./questions-forum');

const constructorMethod = (app) => {
    app.get('/',(req,res) => {
		res.render('home/home',{title: "Stress-Less Tutoring"});
	});

	app.use("/questions-forum", questionsRoutes);

    app.use('*', (req, res) => {
        res.status(404).sendFile(path.resolve("static/error.html"));
    });

}

module.exports = constructorMethod;
