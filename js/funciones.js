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
var base = firebase.database();
var storage = firebase.storage();



Auth.onAuthStateChanged(function(user) {
  if (user) {
  	console.log (user);
  	$("nav").removeClass("hide")	;
  	$(".sidenav-trigger").removeClass("hide");
  	getPerfil(user);
  	if (user.displayName != null ){
  		navegacion("#home");
  	}else{
  		navegacion("#cuenta");
  	}
  } else {
  	$("nav").addClass("hide");
  	$(".sidenav-trigger").addClass("hide");
  	navegacion("#login");
  }
});


// cerrar sesión
$("#cerrar").click(function (){
	firebase.auth().signOut();
});

//boton registar 
$("#registrar").submit(function (){
	if ($("#password_registro").val() == $("#password_registro2").val()){
		firebase.auth().createUserWithEmailAndPassword($("#email_registro").val(), $("#password_registro").val())
		.catch(function(error) {
		if (error.code == "auth/email-already-in-use"){
			M.toast({html: '<span>El Email ingresado ya esta registrado <i class="material-icons red-text">error</i></span>'  });
		}
		
		});
	}else{
		alert ("Las contraseñas no son iguales.");
	}

	return false;
});

//*** INICIA LA BARRAS
$(document).ready(function(){
    $('.sidenav').sidenav();
    $('select').formSelect();
      $('.fixed-action-btn').floatingActionButton();
 });


$("#login").submit(function (){

	Auth.signInWithEmailAndPassword($('#email_login').val(), $('#password_login').val())
	.catch(function (error){
		

		if (error.code == "auth/user-not-found"){
			M.toast({html: '<span>El Email ingresado no es correcto <i class="material-icons red-text">error</i></span> ' });
		}

		if (error.code == "auth/wrong-password"){
			M.toast({html: '<span>La contraseña ingresada no es correcta <i class="material-icons red-text">error</i></span> '});
		}


	});
	return false;
});


//Funcion que controla la navegacion de l apagina
function navegacion (paginaActiva){
	$(".appPagina").addClass("hide");
	$("" + paginaActiva).removeClass("hide");
}
$("a").click(function (){
	if ( $(this).parent().parent().hasClass("sidenav") ){
		$(".sidenav").sidenav("close");

	}
	navegacion($(this).attr("href"));
});

/**Funcion que fija la barra de navegación cuando baja el**/
$(document).scroll(function (){
	
	if ($(document).scrollTop() >= 50   ){
		$("#nav").addClass("navbar-fixed");
		$(".nav-wrapper").addClass("hide");
		

	}else{
		$("#nav").removeClass("navbar-fixed");
		$(".nav-wrapper").removeClass("hide");
	}

});

///Carga el perdol de usuario 
function getPerfil(usuario){
	$("#userId").val(usuario.uid);
  	$("#email_perfil").val(usuario.email);
	$("#nombre_perfil").val(usuario.displayName);

	if (usuario.photoURL== null){
		$("#foto").prepend("<h1><i class='large material-icons'>account_circle</i></h1>");
	}else{
		$("#foto").html("<h1><img src='"+ usuario.photoURL + "' class='circle' width='150em' height='150em' /></h1>");
	}
	if (usuario.phoneNumber != null){
		$("#telefono").val()=usuario.phoneNumber ;
	}
	

}	

//botón agregar foto de perfil
$("#addPhotoPerfil").click(function (){
	$("#photoURL").click();

});

//Escuchamos el cambio de la imagen 
$("#photoURL").change(function (e){
	var file = e.target.files[0];
	if (file){
		var src = URL.createObjectURL(file);
	
	$("#foto").html("<h1><img src='"+src+"' class=' circle' width='150em' height='150em' /></h1>");
	}


});

//Guardamos el perfil
$("#perfil").submit(function(){
	var fichero = document.getElementById("photoURL");
	var imagenAsubir = fichero.files[0];
	if (imagenAsubir){
		storage.ref().child("imagenes/userPhoto/" + $("#userId").val()).put(imagenAsubir)
		.then(function (snap){
				var urlImage = snap.downloadURL;
				Auth.currentUser.updateProfile({
					photoURL: urlImage
				});
		});
	}

	if ($("#rol").prop('checked') ) {
		base.ref("user_config/ " + $("#userId").val()).set({
			rol: 'representante',
			permisos: 1,
			mail: $("#email_perfil").val(),
			estudiante: $("#estudiante").val()
		});

		Auth.currentUser.updateProfile({
			phoneNumber: $("#telefono").val(),
		
		})


	}

	Auth.currentUser.updateProfile({
		displayName: $("#nombre_perfil").val(),
	
	})
	.then(function (e){
		M.toast({html: '<span>Tus datos se guardaron! <i class="material-icons green-text">done_outline</i></span>', classes: 'rounded'})
	});

	return false 	
});

//Cambiar el rol de usuario 
$("#rol").change(function (){
	if( $(this).prop('checked') ){
		$(".padre").removeClass("hide");
		$("#telefono").attr("required", true);
		$("#estudiante").attr("required", true);
    }else{	
    	$(".padre").addClass("hide");
    	$("#telefono").removeAttr("required");
		$("#estudiante").removeAttr("required");
	}
});
///////***INICIO CON FACEBOOK

$("#loginConFacebook").click(function (){
		var provider = new firebase.auth.FacebookAuthProvider();
		firebase.auth().signInWithPopup(provider).then(function(result) {
	  	var token = result.credential.accessToken;
	    var user = result.user;
	    
	  
	}).catch(function(error) {
	 
	  var errorCode = error.code;
	  var errorMessage = error.message;
	 
	  var email = error.email;
	 
	  var credential = error.credential;
	 
	});
});

$("#RegistrarConFacebook").click(function (){
		var provider = new firebase.auth.FacebookAuthProvider();
		firebase.auth().signInWithPopup(provider).then(function(result) {
	  	var token = result.credential.accessToken;
	    var user = result.user;
	    
	  
	}).catch(function(error) {
	 
	  var errorCode = error.code;
	  var errorMessage = error.message;
	 
	  var email = error.email;
	 
	  var credential = error.credential;
	 
	});
});