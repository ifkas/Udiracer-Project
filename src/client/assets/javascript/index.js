// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
const store = {
	track_id: undefined,
	player_id: undefined,
	race_id: undefined,
}

// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
	onPageLoad()
	setupClickHandlers()
})

async function onPageLoad() {
	try {
		getTracks()
			.then(tracks => {
				const html = renderTrackCards(tracks)
				renderAt('#tracks', html)
			})

		getRacers()
			.then((racers) => {
				const html = renderRacerCars(racers)
				renderAt('#racers', html)
			})
	} catch(error) {
		console.log("Problem getting tracks and racers ::", error.message)
		console.error(error)
	}
}

function setupClickHandlers() {
	document.addEventListener('click', function(event) {
		const { target } = event

		// Race track form field
		if (target.matches('.card.track')) {
			handleSelectTrack(target)
		}

		// Podracer form field
		if (target.matches('.card.podracer')) {
			handleSelectPodRacer(target)
		}

		// Submit create race form (when clicked on the start race button)
		if (target.matches('#submit-create-race')) {
			event.preventDefault()

			// start race
			handleCreateRace()
		}

		// Handle acceleration click
		if (target.matches('#gas-peddle')) {
			handleAccelerate(target)
		}

	}, false)
}

async function delay(ms) {
	try {
		return await new Promise(resolve => setTimeout(resolve, ms));
	} catch(error) {
		console.log("an error shouldn't be possible here")
		console.log(error)
	}
}
// ^ PROVIDED CODE ^ DO NOT REMOVE

// The race View
// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {
	try{

		// TODO - Get player_id and track_id from the store
		const player_id = store.player_id;
		const track_id = store.track_id;
		//console.log(track_id);

		// render starting UI
		renderAt('#race', renderRaceStartView(track_id, player_id))

		// const race = TODO - invoke the API call to create the race, then save the result
		await createRace(player_id, track_id);
		//console.log(race);

		// TODO - update the store with the race id
		// store.race_id = race.ID-1;
		//console.log(store.race_id);

		// The race has been created, now start the countdown
		// TODO - call the async function runCountdown
		await runCountdown();

		// TODO - call the async function startRace
		await startRace(store.race_id - 1);

		// TODO - call the async function runRace
		await runRace(store.race_id - 1);

	} catch(error) {
		console.log(error);
	}
}

function runRace(raceID) {
    return new Promise((resolve) => {
        // TODO - use Javascript's built in setInterval method to get race info twice a second
        const racingInterval = setInterval(async () => {
            await getRace(raceID)
			.then(res => {
				if (res.status === 'in-progress') {
					// TODO - if the race info status property is "in-progress", update the leaderboard by calling:
					renderAt('#leaderBoard', raceProgress(res.positions));
				} else if (res.status === 'finished') {
					// TODO - if the race info status property is "finished", run the following:
					clearInterval(racingInterval); // to stop the interval from repeating
					renderAt('#race', resultsView(res.positions)); // to render the results view
					resolve(res); // resolve the promise
				}
			})
		}, 500)
	})
	// remember to add error handling for the Promise
	.catch((error) => {
		console.log(error)
	});
}

async function runCountdown() {
	try {
		// wait for the DOM to load
		await delay(1000)
		let timer = 3

		return new Promise(resolve => {
			// TODO - use Javascript's built in setInterval method to count down once per second
			const counter = setInterval(countdown, 1000);

			function countdown() {
				if(timer > 0) {
					// run this DOM manipulation to decrement the countdown for the user
					//${count === "2" ? `class="red"` : `class="blue"`}
					let numbers = document.getElementById('big-numbers');
					if(timer === 3) {
						numbers.classList.add("red");
					}
					else if(timer === 2) {
						numbers.classList.remove('red');
						numbers.classList.add("yellow");
					} else {
						numbers.classList.remove('yellow');
						numbers.classList.add("green");
					}
					numbers.innerHTML = --timer;
				} else {
					// TODO - if the countdown is done, clear the interval, resolve the promise, and return
					clearInterval(counter);
					resolve();
					return;
				}
			}

		})
	} catch(error) {
		console.log(error);
	}
}

function handleSelectPodRacer(target) {
	console.log("selected a pod", target.id)

	// remove class selected from all racer options
	const selected = document.querySelector('#racers .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// TODO - save the selected racer to the store
	store.player_id = parseInt(target.id);
}

//
function handleSelectTrack(target) {
	console.log("selected a track", target.id)

	// remove class selected from all track options
	const selected = document.querySelector('#tracks .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// TODO - save the selected track id to the store
	store.track_id = parseInt(target.id);

}

async function handleAccelerate() {
	console.log("accelerate button clicked")
	// TODO - Invoke the API call to accelerate
	try{
		const race_id = store.race_id;
		await accelerate(race_id);
	}
	catch(error) {
		console.log(error);
	}

}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

// Get the data from getRacers
function renderRacerCars(racers) {
	if (!racers.length) {
		return `
			<h4>Loading Racers...</4>
		`
	}

	const results = racers.map(renderRacerCard).join('')

	return `
		<ul id="racers">
			${results}
		</ul>
	`
}
// Generate HTML for single racer card
function renderRacerCard(racer) {
	const { id, driver_name, top_speed, acceleration, handling } = racer

	return `
		<li class="card podracer" id="${id}">
			<h3>${driver_name}</h3>
			<p>Top speed: <span>${top_speed}</span></p>
			<p>Acceleration: <span>${acceleration}</span></p>
			<p>Handling: <span>${handling}</span></p>
		</li>
	`
}

// Get the data from getTracks
function renderTrackCards(tracks) {
	if (!tracks.length) {
		return `
			<h4>Loading Tracks...</4>
		`
	}

	const results = tracks.map(renderTrackCard).join('')

	return `
		<ul id="tracks">
			${results}
		</ul>
	`
}
// Generate HTML for single track card
function renderTrackCard(track) {
	const { id, name } = track

	return `
		<li id="${id}" class="card track">
			<h3>${name}</h3>
		</li>
	`
}

// Generate HTML for the coundown
function renderCountdown(count) {
	return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers" class="red">${count}</p>
	`
}

function renderRaceStartView(track, racers) {
	return `
		<header>
			<h1>Race: Track ${track}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click on the gas pedal as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle" class="gas-pedal"></button>
			</section>
		</main>
		<footer></footer>
	`
}

function resultsView(positions) {
	positions.sort((a, b) => (a.final_position > b.final_position) ? 1 : -1)

	return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			<section>
				${raceProgress(positions)}
				<a class="button" href="/race">Start a new race</a>
			</section>
		</main>
	`
}

function raceProgress(positions) {
	let userPlayer = positions.find(e => e.id === store.player_id)
	//userPlayer.driver_name += " (you)"

	positions = positions.sort((a, b) => (a.segment > b.segment) ? -1 : 1)
	let count = 1

	const results = positions.map(p => {
		return `
			<tr>
				<td>
					<h3 ${userPlayer.driver_name === p.driver_name ? `class="user-driver"` : `class=""`}>${count++} - ${p.driver_name}</h3>
				</td>
			</tr>
		`
	})

	return `
		<main>
			<section>
				<div class="main-title no-margin">
					<h2 class="marked">Leaderboard</h2>
					<div class="trophy"></div>
				</div>
			</section>
			<section id="leaderBoard">
				<table>
					${results}
				</table>
			</section>
		</main>
	`
}

function renderAt(element, html) {
	const node = document.querySelector(element)

	node.innerHTML = html
}

// ^ Provided code ^ do not remove


// API CALLS ------------------------------------------------

const SERVER = 'http://localhost:8000'

function defaultFetchOpts() {
	return {
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin' : SERVER,
		},
	}
}

// TODO - Make a fetch call (with error handling!) to each of the following API endpoints

// Function to fetch requests
function fetcher(url) {
	return fetch(url)
	.then(response => response.json())
	.catch(error => console.log(error))
}

function getTracks() {
	// GET request to `${SERVER}/api/tracks`
	return fetcher(`${SERVER}/api/tracks`);
}

function getRacers() {
	// GET request to `${SERVER}/api/cars`
	return fetcher(`${SERVER}/api/cars`);
}

function createRace(player_id, track_id) {
	const body = { player_id, track_id };
	return fetch(`${SERVER}/api/races`, {
	  ...defaultFetchOpts(),
	  method: "POST",
	  dataType: "jsonp",
	  body: JSON.stringify(body),
	})
	  .then((res) => {
		return res.json();
	  })
	  .then((res) => {
		store.race_id = res.ID;
		console.log(store.race_id);
	  })
	  .catch((e) => {
		alert(e);
	  });
  }

function getRace(id) {
	// GET request to `${SERVER}/api/races/${id}`
	return fetcher(`${SERVER}/api/races/${id}`);
}

function startRace(id) {
    return fetch(`${SERVER}/api/races/${id}/start`, {
        method: 'POST',
        ...defaultFetchOpts(),
    }).catch((error) => console.log('Problem with getRace request::', error));
}

function accelerate(id) {
	// POST request to `${SERVER}/api/races/${id}/accelerate`
	// options parameter provided as defaultFetchOpts
	// no body or datatype needed for this request
	return fetch(`${SERVER}/api/races/${id - 1}/accelerate`, {
	  method: "POST",
	  ...defaultFetchOpts(),
	}).catch((error) => console.log("Problem with accelerate request::", error));
  }
