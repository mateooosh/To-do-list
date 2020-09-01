//TO DO 
// - wylogowanie
// - zmiana hasła 
// + walidacja
// + rejestracja
// + wyslanie do bazy zadan
// + dodanie imienia do bazy
// - metodologia BEM
// - wiadomosc, czy udalo sie zalogować, stworzyć uzytkownika itp
// + weryfikacja email


//configuration
var config = {
	apiKey: "AIzaSyCCHsU8VhziiizmzmLQTuSmmRgK52rA2Xk",
	authDomain: "glowing-arcadia-270709.firebaseapp.com",
	databaseURL: "https://glowing-arcadia-270709.firebaseio.com",
	storageBucket: "glowing-arcadia-270709.appspot.com"
};
firebase.initializeApp(config);

//message component
Vue.component('message', {
	template: `
		<article class="message">
			<div class="message__header">
				<p class="message__header-p">{{ header }}</p> 
				<button @click="$emit('set-false-isvisible')" class="message__header-button"></button>
			</div>
			<div class="message__body">
				<div class="message__body-div">{{ body }}</div>
				<button @click="$emit('send-verification-email')" v-show="verification" class="message__body-button">Send verification email</button>
			</div>
		</article>
	`,

	props: {
		header: String,
		body: String,
		verification: Boolean
	},
	data() {
		return {
			// isVisible: true,
		}
	}
});



new Vue({
	el: '#app',
	data(){
		return{
			input: '',
			tab:[],
			logged: false,
			register: false,
			name: '',
			isVisible: false,
			isVisibleVerificationButton: false,
			messageHeader: '',
			messageBody: '',
		}
	},

	methods: {
		setFalseIsVisible: function () {
			this.isVisible = false;
			this.isVisibleVerificationButton = true;
		},

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

					console.log("Login successfully!");
					this.logged = true;

					//get length of array
					starCountRef.on('value', function (snapshot) {
						l = snapshot.val().length;
					})

					//odczytaj dane z bazy
					firebase.database().ref('list/' + user.uid).on('value', (snapshot) => {
						let array = snapshot.val().array;
						// this.name = snapshot.val().name;

						if (l === 0) {
							array = [];
						}
						else {
							this.tab = array;
						}
					})
					this.isVisibleVerificationButton = false;
					this.isVisible = false;
					

					if(user.emailVerified){
						//verified
					}
					else {
						this.messageHeader = "Error";
						this.messageBody = "Your email is not verified, check your spam folder or get the verification link once again.";
						this.isVisibleVerificationButton = true;
						this.isVisible = true;
					}
						
				})

				.catch( error => {
					// Handle Errors here.
					// let errorCode = error.code;
					// let errorMessage = error.message;
					document.getElementById('log-email').value = '';
					document.getElementById('log-password').value = '';

					this.messageHeader = "Error";
					this.messageBody = error.message;
					// alert(errorMessage);
					this.logged = false;
					this.isVisibleVerificationButton = false;
					this.isVisible = true;
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


					//verification by email
					this.sendEmailVerification();

					this.messageHeader = "Message";
					this.messageBody = "A user account was created. Now you can log	 in. Don't forget to verify your email address.";
					this.isVisibleVerificationButton = false;
					this.isVisible = true;

					// alert("Utworzono nowego użytkownika! Teraz możesz się zalogować");
					this.register = false;

				})
				.catch( error => {
					document.getElementById('register-name').value = '';
					document.getElementById('register-email').value = '';
					document.getElementById('register-password').value = '';

					// Handle Errors here.
					this.messageHeader = "Error";
					this.messageBody = error.message;
					// alert(error.message);
					this.isVisibleVerificationButton = false;
					this.isVisible = true;
				});
		},

		//function which sends verification email
		sendEmailVerification: function(){
			let user = firebase.auth().currentUser;
			user.sendEmailVerification().then(function () {
				alert("Verification email was sent, check your email inbox.")
			}).catch(function (error) {
				// alert("Something went wrong with sending an email");
			});
		},

		//function which validates login data
		validateLoginData: function(){
			if (this.validateEmail(document.getElementById('log-email').value) && this.validatePassword(document.getElementById('log-password').value)){
				// alert("Validate successfully!");
				this.logInAndGetData();
			}

			else{
				alert('something went wrong')
			}
		},

		//function which validates register data
		validateRegisterData: function () {
			if (this.validateEmail(document.getElementById('register-email').value) && 
				this.validatePassword(document.getElementById('register-password').value)&& 
				this.validateName(document.getElementById('register-name').value)
			) {
				// alert("Validate successfully!");
				this.createAccount();
			}

			else {
				alert('Something went wrong')
			}
		},

		//function which validates email
		validateEmail: function(email) {
			let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return re.test(email);
		},

		//function which validates email
		validateEmailById: function (id) {
			let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

			let value = document.getElementById(id).value;

			if(re.test(value))
				document.getElementById(id + '-label').setAttribute('class', '');
			else
				document.getElementById(id + '-label').setAttribute('class', 'wrong-email');
		},

		//function which validates password (min 6 characters)
		validatePassword: function (password) {
			if(password.length > 5)
				return true;
			return false;
		}, 

		validatePasswordById: function (id) {
			if (document.getElementById(id).value.length > 5)
				document.getElementById(id + '-label').setAttribute('class', '');
			else
				document.getElementById(id + '-label').setAttribute('class', 'wrong-password');
		}, 

		//function which validates name (min 3 characters)
		validateName: function (name) {
			if (name.length > 2)
				return true;
			return false;
		},
		validateNameById: function (id) {
			if (document.getElementById(id).value.length > 2)
				document.getElementById(id + '-label').setAttribute('class', '');
			else
				document.getElementById(id + '-label').setAttribute('class', 'wrong-name');
		}
	}
}) 

















