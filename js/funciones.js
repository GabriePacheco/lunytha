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
var storage = firebase.storage();



Auth.onAuthStateChanged(function(user) {
  if (user) {
  	$(".nav-content").removeClass("hide")	;
  	$(".sidenav-trigger").removeClass("hide");
  	getPerfil(user);
  	navegacion("#home");
  } else {
  	$(".nav-content").addClass("hide");
  	$(".sidenav-trigger").addClass("hide");
  	navegacion("#login");
  }
});




//boton registar 
$("#registrar").submit(function (){
		Auth.createUserWithEmailAndPassword($("#email").val(), $("#password").val())
	
		.catch(function(error) {
		  // Handle Errors here.
		  var errorCode = error.code;
		  var errorMessage = error.message;
		  // ...
		});
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
		alert ("Error : " + error.message);
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
	if ($(document).scrollTop()>50){
		$('.nav-wrapper').hide();

	}else{
		$('.nav-wrapper').show();

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
$("#addPhotoPerfil").click(function (){
	$("#photoURL").click();

});
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
		storage.ref().child("imagenes/" + $("#userId").val()).put(imagenAsubir)
		.then(function (snap){
				var urlImage = snap.downloadURL;
				Auth.currentUser.updateProfile({
					photoURL: urlImage
				});
		});
	}

	Auth.currentUser.updateProfile({
		displayName: $("#nombre_perfil").val(),
		
		

	}).then(function (e){
		alert("Dotos cambiados con exito");
	});

	return false 
	

		

});

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