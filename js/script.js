//TO DO 
// - zmiana hasła 
// + rejestracja
// + wyslanie do bazy zadan
// + dodanie imienia do bazy
// - metodologia BEM
// - wiadomosc, czy udalo sie zalogować, stworzyć uzytkownika itp


//configuration
var config = {
	apiKey: "AIzaSyCCHsU8VhziiizmzmLQTuSmmRgK52rA2Xk",
	authDomain: "glowing-arcadia-270709.firebaseapp.com",
	databaseURL: "https://glowing-arcadia-270709.firebaseio.com",
	storageBucket: "glowing-arcadia-270709.appspot.com"
};
firebase.initializeApp(config);

new Vue({
	el: '#app',
	data(){
		return{
			input: '',
			tab:[],
			logged: false,
			register: false,
			name: '',
		}
	},

	methods: {
		// function which adds element to list
		add: function () {
			if (this.input==''){
				//add elements to array
				// this.tab.push({content: this.input, isCompleted: false});	
				return;
			}

			let user = firebase.auth().currentUser;
			let obj = {};
			if (this.tab.length === 0) {
				//tworzenie obiektu po czym wstawienie go do tablicy
				obj['content'] = this.input;
				obj['isCompleted'] = false;
				this.tab.push(obj);

			} 
			
			else {
				//pobierz tablice z bazy 
				firebase.database().ref('list/' + user.uid).on('value', snapshot => {
					this.tab = snapshot.val().array;
				})

				//tworzenie obiektu po czym wstawienie go do tablicy
				obj['content'] = this.input;
				obj['isCompleted'] = false;
				this.tab.push(obj);
			}

			
			firebase.database().ref('list/' + user.uid).set({
				array: this.tab,
				length: this.tab.length,
				name: this.name,
			});

			//clear input
			this.input = '';
		},

		//function which deletes element from list
		deleteElement: function(value) {
			for(let i in this.tab){
				// delete element which is equal value
				if(this.tab[i] === value)
					this.tab.splice(i, 1);	
			}

			let user = firebase.auth().currentUser;
			//update database
			firebase.database().ref('list/' + user.uid).set({
				array: this.tab,
				length: this.tab.length,
				name: this.name,
			});
		},

		//function which edits element
		editElement: function(value) {
			for(let i in this.tab){
				if (this.tab[i] === value){
					this.input = this.tab[i].content;
					this.tab.splice(i, 1);
				}
			}

			let user = firebase.auth().currentUser;
			//update database
			firebase.database().ref('list/' + user.uid).set({
				array: this.tab,
				length: this.tab.length,
				name: this.name,
			});			 
		},

		//function which toggles checkbox
		toggleCheckbox: function(value){
			for (let i in this.tab) {
				if (this.tab[i] === value) {
					this.tab[i].isCompleted = !this.tab[i].isCompleted;
				}
			}

			let user = firebase.auth().currentUser;
			//działa
			firebase.database().ref('list/' + user.uid).set({
				array: this.tab,
				length: this.tab.length,
				name: this.name,
			});
		},

		//function which sets register to true
		setRegisterTrue: function () {
			this.register = true;
		},

		//function which sets register to false
		setRegisterFalse: function () {
			this.register = false;
		},

		//  log in and get data from database
		logInAndGetData: function () {
			let email = document.getElementById('log-email').value;
			let password = document.getElementById('log-password').value;

			//logowanie
			firebase.auth().signInWithEmailAndPassword(email, password)
				.then(() => {
					let user = firebase.auth().currentUser;
					let starCountRef = firebase.database().ref('list/' + user.uid);

					//get length of array
					starCountRef.on('value', function (snapshot) {
						l = (snapshot.val().length);
					})

					//odczytaj dane z bazy
					firebase.database().ref('list/' + user.uid).on('value',  (snapshot) =>{
						let array = snapshot.val().array;

						if (l === 0) {
							array = [];
						}
						else{
							this.tab = array;
						}
						
					})
					this.logged = true;
					console.log("Login successfully!");
				})

				.catch(function (error) {
					// Handle Errors here.
					let errorCode = error.code;
					let errorMessage = error.message;
					alert(errorMessage);
					this.logged = false;
				});
		},

		//function wihich creates an user account
		createAccount: function () {
			this.name = document.getElementById('register-name').value;
			let email = document.getElementById('register-email').value;
			let password = document.getElementById('register-password').value;

			//tworzenie konta
			firebase.auth().createUserWithEmailAndPassword(email, password)
				.then( user => {
					//dodaj do bazy użytkownika
					firebase.database().ref('list/' + user.user.uid).set({
						name: this.name,
						array: [],
						length: 0,
					});

					alert("Utworzono nowego użytkownika! Teraz możesz się zalogować");
					this.register = false;

				})
				.catch( error => {
					// Handle Errors here.
					let errorCode = error.code;
					let errorMessage = error.message;
					alert(errorMessage);
				});
		},

		checkEmail: function () {
			// ...
		},

		checkPassword: function () {
			// ...
		}, 

		checkName: function () {
			// ...
		}
	}
}) 

















