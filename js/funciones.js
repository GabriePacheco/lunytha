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
	var userId = firebase.auth().currentUser.uid;
	return firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {
	  var rol = (snapshot.val() && snapshot.val().rol) || 'Anonymous';
	 	if(rol== "representante"){
			$(".padre").removeClass("hide");
			$("#telefono").attr("required", true);
			$("#estudiante").attr("required", true);
			$("#estudiante").val( snapshot.val().estudiante);
			$("#telefono").val( snapshot.val().telefono);
		 }
	});

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
	
	$("#foto").html("<h1><img src='"+src+"' class='responsive-img circle' /></h1>");
	}


});

//Guardamos el perfil
$("#perfil").submit(function(){
	var fichero = document.getElementById("photoURL");
	var imagenAsubir = fichero.files[0];
	var perfil = {};

	if (imagenAsubir){
		storage.ref().child("imagenes/userPhoto/" + $("#userId").val()).put(imagenAsubir)
		.then(function (snap){
				var urlImage = snap.downloadURL;
				perfil.imagen = urlImage;
				Auth.currentUser.updateProfile({
					photoURL: urlImage
				});
		});
	}

	perfil.nombre = $("#nombre_perfil").val();
	perfil.email = $("#email_perfil").val();
	if ($("#rol").prop("checked")){
		perfil.rol = "representante";
		perfil.permisos=2;
		perfil.telefono = $("#telefono").val();
		perfil.estudiante = $("#estudiante").val();


	}else{
		perfil.rol = "estudiante";
		perfil.telefono= null;
		perfil.permisos=null;
		perfil.estudiante = null

	}
	
	Auth.currentUser.updateProfile({
		displayName: perfil.nombre,
		phoneNumber: perfil.telefono
	}).then(function(){
		M.toast({html: '<span>Tus datos se actualizaron! <i class="material-icons green-text">check_circle</i></span> '});
	}) 

	var guardar = {};
	guardar["users/" + $("#userId").val()]=perfil; 
	firebase.database().ref().update(guardar);
	return false;
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

///Inicio de Sesión con formulario

$("#login").submit(function (){
	Auth.signInWithEmailAndPassword($('#email_login').val(), $('#password_login').val())
	.catch(function (error){
	
		if (error.code == "auth/user-not-found"){
			M.toast({html: '<span>El Email ingresado no es correcto <i class="material-icons red-text">error</i></span> ' });
		}

		if (error.code == "auth/wrong-password"){
			M.toast({html: '<span>La contraseña ingresada no es correcta <i class="material-icons red-text">error</i></span> '});
		}
		console.log(error.code);


	});
	return false;
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