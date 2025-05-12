//create store to manage alert state
import { writable } from 'svelte/store';

//alert only have true or false to show or hide alert and no message
export const alert = writable(false);

//set alert to true and show alert
export const showAlert = () => {
	alert.set(true);
};

//set alert to false and hide alert
export const hideAlert = () => {
	alert.set(false);
};
