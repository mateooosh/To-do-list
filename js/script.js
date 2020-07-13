new Vue({
	el: '#app',
	data(){
		return{
			input: '',
			tab:[
			],
		}
	},

	methods: {
		// function which adds element to list
		add: function () {
			if (this.input!==''){
				//add elements to array
				this.tab.unshift({description: this.input, completed: false});
				//clear input
				this.input = '';
			}
		},

		//function which deletes element from list
		deleteElement: function(value) {
			for(let i in this.tab){
				// delete element which is equal value
				if(this.tab[i] === value)
					this.tab.splice(i, 1);	
			}
		},

		//function which edits element
		editElement: function(value) {
			for(let i in this.tab){
				if (this.tab[i] === value){
					this.input = this.tab[i].description;
					this.tab.splice(i, 1);
				}
			}
		},

		//function which toggle checkbox
		toggleCheckbox: function(value){
			for (let i in this.tab) {
				if (this.tab[i] === value) {
					this.tab[i].completed = !this.tab[i].completed;
				}
			}
		},
	}
}) 

















