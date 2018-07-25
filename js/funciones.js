// Initialize Firebase
var config = {
	apiKey: "AIzaSyB68t5GkQtcZIfh9Uoy8SsmWspQ2dstiN4",
	authDomain: "lunytha-1.firebaseapp.com",
	databaseURL: "https://lunytha-1.firebaseio.com",
	projectId: "lunytha-1",
	storageBucket: "lunytha-1.appspot.com",
	messagingSenderId: "790058688434"
};
firebase.initializeApp(config);
var  Auth = firebase.auth();
Auth.onAuthStateChanged(function(user) {
  if (user) {
    var pathname = window.location.pathname;
  		if (pathname == "/lunytha/public/"){
  			window.location = "inicio.html";
  		}
  } else {
  		var pathname = window.location.pathname;
  		if (pathname == "/lunytha/public/"){
  			window.location = "login.html";
  		}
  }
});


$("#registrar").submit(function (){
	var registro  = {
		displayName: $("#first_name").val() + " " +  $("#last_name").val(),
		email: $("#email").val(),
		rol : "administrador"
	};
	Auth.createUserWithEmailAndPassword($("#email").val(), $("#password").val(), $("#first_name").val()).catch(function(error) {
	 	console.log("error : " + error.message  );
	});
	return false;
});
$(document).ready(function(){
    $('.sidenav').sidenav();
  });
