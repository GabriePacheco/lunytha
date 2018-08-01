/*********** Lunyta App *****************/
//1. Inicializando firebase/
//1.1 Escuchador de cambio en la sesión 
//1.- Initialize Firebase
//2. Cerrar sesión
//3. Registrar con Email Botón 
//4. IniciarCodigos  Materialize
//5.- Función que controla la navegación de la APP
//5.1.- Cierra la barra de menú
//6.- Ffija la barra de navegación cuando baja el scrol
//7.-  Carga el perfil de usuario en menu PERFIL Y PARA LA APP
//7.1.-  Botón agregar foto de perfil
//7.2.- Escuchamos el cambio de la imagen 
//7.3 .- Guardamos el perfil
//7.4 Cambiar el rol de usuario 
//8.- Inicio de Sesión con formulario
//9.-  Login con facebook
// 9.1 Registro con facebook
//10.- Enviar post 
//10.A.- Carga de archivos 
// 10.1.- Botones del post s
//10.1.a.-Boton  Adjuntar imagen 
//11 carga post en la pagina principal 


//1. Inicializando firebase/
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
//1.1.- Escuchador de cambio en la sesión 

var userInLine = {}

Auth.onAuthStateChanged(function(user) {
  if (user) {
  
  	$("nav").removeClass("hide")	;
  	$(".sidenav-trigger").removeClass("hide");
  	getPerfil(user);
  	if (user.displayName != null ){
  		navegacion("#home");
  		userInLine.uid = user.uid; 
  		userInLine.nombre = user.displayName;
  		userInLine.imagen = user.photoURL;
  		userInLine.telefono = user.phoneNumber;
  		cargarPost();
  	}else{
  		navegacion("#cuenta");
  	}
  } else {
  	$("nav").addClass("hide");
  	$(".sidenav-trigger").addClass("hide");
  	navegacion("#login");
  }
});


//2. Cerrar sesión
$("#cerrar").click(function (){
	firebase.auth().signOut();
});

//3. Registrar con Email Botón 
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

//4. IniciarCodigos  Materialize
$(document).ready(function(){
    $('.sidenav').sidenav();
    $('select').formSelect();
      $('.fixed-action-btn').floatingActionButton();
 });


//5.- Función que controla la navegación de la APP
function navegacion (paginaActiva){
	$(".appPagina").addClass("hide");
	$("" + paginaActiva).removeClass("hide");
}
//5.1.- Cierra la barra de menú
$("a").click(function (){
	if ( $(this).parent().parent().hasClass("sidenav") ){
		$(".sidenav").sidenav("close");

	}
	if ($(this).attr("data-aciones")!="true"){
		navegacion($(this).attr("href"));
	}
});

//6.- Ffija la barra de navegación cuando baja el scrol
$(document).scroll(function (){
	
	if ($(document).scrollTop() >= 50   ){
		$("#nav").addClass("navbar-fixed");
		$(".nav-wrapper").addClass("hide");
		

	}else{
		$("#nav").removeClass("navbar-fixed");
		$(".nav-wrapper").removeClass("hide");
	}

});

//7.-  Carga el perfil de usuario en menu PERFIL Y PARA LA APP
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
		
		if (snapshot.val().permisos >= 3){
				$("#doAcciones").removeClass("hide");
      			$('.modal').modal();
      			$("#postImage").attr("src",usuario.photoURL );
   				$("#postCip").append(usuario.displayName);
   				$("#rol").parent().addClass('hide')
   				$("#soy").val(snapshot.val().rol);
   				$("#soy").attr("data-scopes", snapshot.val().permisos);
		
		} 

	});

}	



//7.1.-  Botón agregar foto de perfil
$("#addPhotoPerfil").click(function (){
	$("#photoURL").click();

});

//7.2.- Escuchamos el cambio de la imagen 
$("#photoURL").change(function (e){
	var file = e.target.files[0];
	if (file){
		var src = URL.createObjectURL(file);
	
		$("#foto").html("<h1><img src='"+src+"' class='responsive-img circle' /></h1>");
	}


});

//7.3 .- Guardamos el perfil
$("#perfil").submit(function(){
	var fichero = document.getElementById("photoURL");
	var imagenAsubir = fichero.files[0];
	var perfil = {};

	if (imagenAsubir){
		storage.ref().child("imagenes/userPhoto/" + $("#userId").val()).put(imagenAsubir)
		.then(function (snap){
				var urlImage = snap.downloadURL;	
				perfil.imagen = snap.downloadURL;
				Auth.currentUser.updateProfile({
					photoURL: urlImage
				});
		});
	}
	perfil.imagen = userInLine.imagen;	
	perfil.nombre = $("#nombre_perfil").val();
	perfil.email = $("#email_perfil").val();
	
	if ($("#rol").prop("checked")){
		perfil.rol = "representante";
		perfil.permisos=2;
		perfil.telefono = $("#telefono").val();
		perfil.estudiante = $("#estudiante").val();


	}else{
		
		perfil.rol = $("#soy").val();
		perfil.telefono= null;
		perfil.estudiante = null
		perfil.permisos= $("#soy").attr("data-scopes");

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

//7.4 Cambiar el rol de usuario 
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

//8.- Inicio de Sesión con formulario
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

//9.-  Login con facebook
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
	  M.toast({html: error.message + ' <i class="material-icons red-text">error</i></span> '});
	 
	});
});
// 9.1 Registro con facebook
$("#RegistrarConFacebook").click(function (){
		var provider = new firebase.auth.FacebookAuthProvider();
		provider.setCustomParameters({
		  'display': 'popup'
		});

		firebase.auth().signInWithPopup(provider).then(function(result) {
	  	var token = result.credential.accessToken;
	    var user = result.user;
	    
	  
	}).catch(function(error) {
	 
	  var errorCode = error.code;
	  var errorMessage = error.message;
	 
	  var email = error.email;
	 
	  var credential = error.credential;
	    M.toast({html: error.message + ' <i class="material-icons red-text">error</i></span> '});
	 
	});
});


//10.- Boton enviar post 
//Objeto para adjuntos 
	var adjuntos = {}
	 adjuntos.contPics = 0;
	 adjuntos.Contfil = 0;
	 adjuntos.pics=[];
	 adjuntos.fil=[];

$("#postSend").click(async function (){
	var postData = {
		uid: userInLine.uid,
	};
	if ($("#postText").val() != "" ||   adjuntos.contPics > 0 || adjuntos.Contfil > 0 ){
		if (adjuntos.contPics > 0 ){
			postData.imagenes=[];
			for (var i = 0; i < adjuntos.pics.length; i++ ){
				var URLimagen = await cargarArchivos("imagenes/posts" , adjuntos.pics[i]);
				postData.imagenes.push(URLimagen);
			}
		}
		if ( adjuntos.Contfil > 0){
			postData.archivos=[];
	
			for (var f = 0 ; f < adjuntos.fil.length; f++){
				console.log(adjuntos.fil[f]);
				var URLarchivo = await cargarArchivos("archivos/posts" , adjuntos.fil[f]);
				postData.archivos.push(URLarchivo);
			}
		}
		if ($("#postText").val() != ""){
			postData.texto = $("#postText").val();

		}else{
			postData.texto=""
		}

		var fecha = new Date();
		postData.fecha = fecha.getDate() +"/" + fecha.getMonth() + "/" + fecha.getYear() + " " + fecha.getHours() + ":" + fecha.getMinutes(); 
	

		adjuntos.contPics = 0;
		 adjuntos.Contfil = 0;
		 adjuntos.pics = [];
		 adjuntos.fil = [];
		 $("#postText").html("");
		 $("#postText").val("");
		 $("#postAdjuntos").html("");
		 $("#postFotos").html("");

		var newPostKey = firebase.database().ref().child('posts').push().key;
		var updates = {};
		
		updates['/posts/' + newPostKey] = postData;
		return firebase.database().ref().update(updates);
	}

	 
	

});
//10.A.- CArga de archivos 
function cargarArchivos (ruta, archivo){
	var postArchivo = storage.ref().child( ruta + "/" + archivo.name);
	return postArchivo.put (archivo).then(function (snap){
		return snap.downloadURL;
	});

}
 //10.1.- Botones del post 
 //10.1.a.-Boton  Adjuntar imagen 
	
$("#postUpImagen").click(function (){
	$("#postImagen").click();
});
$("#postImagen").change(function (e){
	var archivos = e
		var pic = archivos.target.files[0] ;
		var src = URL.createObjectURL(pic)
		if (pic){
			$("#postFotos").append(`
			<div class="col s3" ><img class="responsive-img" src="${src}" > </div>`); 
			adjuntos.pics[adjuntos.contPics]=pic;
			adjuntos.contPics+=1;
		}
	
});

 //10.1.b.-Boton  Adjuntar ARCHIVO
$("#postUpArchivo").click(function (){
	$("#postAcrivos").click();
});
$("#postAcrivos").change(function (we){
	let archivos =$(this).get(0).files;

	
		if (archivos){
			$("#postAdjuntos").append(`
			<div class="col s4" ><i class="material-icons green-text">insert_drive_file</i> ${archivos[0].name} </div>`); 
			 adjuntos.fil[adjuntos.Contfil]= archivos[0];
		    adjuntos.Contfil+=1;
		}
	
	
});



//11 carga post en la pagina principal 


function cargarPost(){
	var publicaciones = firebase.database().ref('posts/');
	publicaciones.on('child_added', function(data) {
		publicar(data , "apend");
	});
}

function publicar(post, al){
	var id = post.val().uid;
	var publicacion = {};
	publicacion.id = post.key;
	publicacion.texto =post.val().texto;
	firebase.database().ref('/users/' + id).once('value').then(function(snapshot) {
		publicacion.username = snapshot.val().nombre;
		publicacion.photoUrl = snapshot.val().imagen;
		var postImagenes="";
		var postAdjuntos ="";

		if (post.val().archivos ){
			if (post.val().archivos.length == 1 ){
				postAdjuntos+= `<a href="${post.val().archivos[0]}" download data-aciones="true"><i class="material-icons" >cloud_download</i>  </a>`;				
			}
		}
		if (post.val().imagenes){
			if (post.val().imagenes.length  == 1){
			postImagenes +=
					`<div class="card-image">
			          <img src="${post.val().imagenes[0]}">		          
			        </div>`;
			}
			if (post.val().imagenes.length  > 1 ){
				postImagenes +=`<div class="flex-images">`;
				 for (var galeria = 0; galeria < post.val().imagenes.length; galeria++ ){
				 	var imagen = new Image();
				 	imagen.src = post.val().imagenes[galeria];

				 	postImagenes += `<div class="item" data-w="${imagen.width}" data-h="${imagen.height}" ><img src="${post.val().imagenes[galeria]}"></div>`;
				 }
				postImagenes +=`</div>`;
				

			}
			$('.flex-images').flexImages({rowHeight: 180});

		
		}


		
		$("#publicaciones").append(`
			      <div class="card">
			      	  <div class="chip white">
					    <img src="${publicacion.photoUrl}" alt="${publicacion.username}">
					    ${publicacion.username}
					    <small>${post.val().fecha}</small>
					  </div>
					  
			        <div class="flow-text">
			          <p>${post.val().texto}</p>

			        </div>
			        ${postImagenes}
					${postAdjuntos}	
			      </div>
		
	
		`)	;
 	});

	

}



	

















