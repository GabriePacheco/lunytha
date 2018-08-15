importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');
var config = {
	apiKey: "AIzaSyB68t5GkQtcZIfh9Uoy8SsmWspQ2dstiN4",
	authDomain: "lunytha-1.firebaseapp.com",
	databaseURL: "https://lunytha-1.firebaseio.com",
	projectId: "lunytha-1",
	storageBucket: "lunytha-1.appspot.com",
	messagingSenderId: "790058688434"
};
firebase.initializeApp(config);
const messaging = firebase.messaging();