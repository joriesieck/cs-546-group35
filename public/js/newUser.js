(function() {
	console.log("hello new user page!");

	// get the form DOM element
	const newUserForm = document.getElementById('new-user-form');

	// add an event listener for submit
	newUserForm.addEventListener('submit', (e) => {
		// stop page refresh
		e.preventDefault();

		// get each input in the form
		// const fn = document.getElementById('first-name').value;
		// const ln = document.getElementById('last-name').value;

		const userInputs = Array.from(newUserForm.elements);

		// i'm not sure if it's better to get them all as an array or do it one by one - the array has all the information which i don't really need and one by one would let me just get the values

		// console.log(`hello ${fn} ${ln}!`);
	})
	
})();