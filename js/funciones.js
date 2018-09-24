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
//12 Calcular Fecha y hora 
// 13 Like 

/******************************************************/



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

const userInLine = {}
const config2 = {}


const messaging1 = firebase.messaging();
messaging1.usePublicVapidKey("BJYGqSxXpk3kLhuRW8q6YrImAqXyNyLVvCfaB48Cb5FYkDgJMYKHqs2IGCoGL_8014GdKgYrcb39ujkLtOuR83k");
messaging1.onTokenRefresh(manejadorDeTokens);

config2.primeraCarga = true;
function conexion (){
	var connectedRef = firebase.database().ref(".info/connected");
	connectedRef.on("value", function(snap) {
	  if (snap.val() === true) {
	   $(".noConectado").remove();
	  } else {
	   if ($(".publicando").length > 0){
	   	$(".publicando").prepend("<i class='nConectado'>esperando por conexión  a Internet...</i>");

	   }else{
	   	$("#publicaciones").prepend("<i class='noConectado'>esperando conexión a Internet....</i>");
	  }
	  }
	});
}
Auth.onAuthStateChanged(function(user) {
  if (user) { 

  	 base.ref('/configuracion/').once('value').then((snap) => {
 		 config2.acceso = snap.val().acceso;
	});

  	$("nav").removeClass("hide")	;
  	$(".sidenav-trigger").removeClass("hide");
  	
  	if (user.displayName != null ){
  		navegacion("#home");
  		userInLine.uid = user.uid; 
  		userInLine.nombre = user.displayName;
  		userInLine.imagen = user.photoURL;
  		userInLine.telefono = user.phoneNumber;
  		userInLine.email = user.email;
  		base.ref('/users/' + userInLine.uid ).once('value')
	  		.then((usnap) => {
	  		if (!usnap.val() ){
	  			base.ref('/users/' + userInLine.uid).set({
	  				email: userInLine.email,
	  				nombre: userInLine.nombre,
	  				imagen: userInLine.imagen,
	  				permisos: "1", 
	  				rol: "estudiante" 
	  			}); 
	 		}else{
				 base.ref('/users/' + userInLine.uid).update({
					email: userInLine.email,
					nombre: userInLine.nombre,
					imagen: userInLine.imagen

	  			});

	 		}
	 		getPerfil(user);
  		});
	  	activarMensajeria();
  		cargarPost();
  		conexion ();
  		messaging1.onMessage(function(playload) {
  		let notificacion = playload.notification; 
  		reproducirSonido();	
		 M.toast({html: '<span> '+ notificacion.title +' '+notificacion.body  });
		});
  	}else{
  		 base.ref('/users/' + user.uid).set({
			email: user.email,
			permisos: "1", 
	  		rol: "estudiante"		

	  	}).then(function(){   
	  		getPerfil(user);
	  		navegacion("#cuenta");
	  	 });	
  		
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
$("#close").click(function (){
	firebase.auth().signOut();
});


//3. Registrar con Email Botón 
$("#registrar").submit(function (){
	if ($("#password_registro").val() == $("#password_registro2").val()){
		firebase.auth().createUserWithEmailAndPassword($("#email_registro").val(), $("#password_registro").val())
		.then(function (user){
			var emailVerified = firebase.auth().currentUser;
			emailVerified.sendEmailVerification();
		})
		.catch(function(error) {
		if (error.code == "auth/email-already-in-use"){
			M.toast({html: '<span>El E-mail ingresado ya esta registrado <i class="material-icons red-text">error</i></span>'  });
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
    /*$("#app").height( $(window).height() );*/

 });
	


//5.- Función que controla la navegación de la APP
function navegacion (paginaActiva){
	
	$(".appPagina").addClass("hide");
	$("" + paginaActiva).removeClass("hide");
	

	if (paginaActiva != "#home" && paginaActiva != "configuracion" && paginaActiva != "#chat" ){
		$("#nav").addClass("hide");
	}else{

		$("#nav").removeClass("hide");

	}
}

$("#cuentaBack").click(function (){

	if ($("#nombre_perfil").val() == "" ||  $("#estado_perfil").attr("data-provedor") == "false" ){	
		$("#close").click();
	}else{
		navegacion("#home");
	}

});
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
	if ($(document).scrollTop() >= 80  ){
		$("#nav").addClass("navbar-fixed");
		$(".nav-wrapper").addClass("hide");
		
	}else{
		$("#nav").removeClass("navbar-fixed");
		$(".nav-wrapper").removeClass("hide");
		
	}
});

//7.-  Carga el perfil de usuario en menu PERFIL Y PARA LA APP
function getPerfil(usuario){


	//Carga las conversaciones Abiertas
	var chatsAbiertos = base.ref("/chat/" + userInLine.uid).orderByKey();
	chatsAbiertos.on("value", function (snap){

		snap.forEach((conver) => {
			base.ref().child("/users/" + conver.key).on("value", function (us){
				var HTMLlistaConversacionItem= `
				<li id ="itemConversacion${us.key}"  class="collection-item avatar" data-id="${us.key}" onClick="abrirConversacion('${us.key}', '${us.val().imagen}', '${us.val().nombre}')">
				  <span id="converUser${conver.key}" data-badge-caption="new"></span>
			      <img src="${us.val().imagen}" alt="${us.val().nombre}" class="circle">
			      <span class="title">${us.val().nombre}</span>
			      <p>
			      	<small>${us.val().rol}</small>		         
			      </p>			    
			    </li>
			    `;
			    if ( $("#itemConversacion"+ us.key).length > 0){
			    		 $("#itemConversacion"+ us.key).replaceWith(HTMLlistaConversacionItem);
			    }else{
			    	$("#listaConversaciones").append(HTMLlistaConversacionItem);	
			    }
				
			});
			base.ref().child("/chat/" + userInLine.uid + "/" + conver.key).orderByChild("estado")
			.equalTo(2).on('value', function (snap){
				let count = 0;
				snap.forEach((item) => {
					if (item.val().IdRecividor == userInLine.uid ){
				  		count += 1;
				  	}
				});
				if (count > 0){
					$("#converUser" + conver.key ).html(count);
					$("#converUser" + conver.key ).addClass("new badge  pink accent-1");
				}


			});
		})
	});


	$("#userId").val(usuario.uid);
  	$("#email_perfil").val(usuario.email);
	$("#nombre_perfil").val(usuario.displayName);
	if (usuario.providerData[0].providerId == "facebook"){
		$("#estado_perfil").html("FACEBOOK");
	}
		if (usuario.providerData[0].providerId == "facebook.com"){
			$("#estado_perfil").html("Registrado con Facebook");
			$("#estado_perfil").attr("data-provedor" , "facebook");
		}else{
			if (usuario.emailVerified){
				$("#estado_perfil").html("Email verificado <i class='material-icons'>done</i>");
				$("#estado_perfil").attr("data-provedor" , "Verificado")
			}else{
				$("#estado_perfil").html("<i class='material-icons red-text darken-1'>report_problem</i><strong class='black-text'> Enviamos un e-mail para verificar tu cuenta click en el enlace para continuar.</strong> Sí no lo encuentras <a onClick= 'reenviarConfirmacion()' >Reenviar confirmacion aquí. </a> ");
				$("#estado_perfil").attr("data-provedor" ,"false");
			}

		}
	

	if (usuario.photoURL== null){
		$("#foto").prepend("<h1><i class='large material-icons'>account_circle</i></h1>");
	}else{
		$("#foto").html("<h1><img src='"+ usuario.photoURL + "' class='circle' width='150em' height='150em' /></h1>");
		$("#historiaImagen").attr("src", usuario.photoURL);
	}
	if (usuario.phoneNumber != null){
		$("#telefono").val()=usuario.phoneNumber ;
	}

	var userId = firebase.auth().currentUser.uid;
	return firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {
	  var rol = (snapshot.val() && snapshot.val().rol) || 'Anonymous';
	 	if(rol == "representante"){
			$(".padre").removeClass("hide");
			$("#telefono").attr("required", true);
			$("#estudiante").attr("required", true);
			$("#estudiante").val( snapshot.val().estudiante);
			$("#telefono").val( snapshot.val().telefono);
			$("#rol").prop("checked", true);

		 }
	
		if (snapshot.val().permisos >= config2.acceso){
				userInLine.scopes = snapshot.val().permisos;
   				$("#rol").parent().addClass('hide')
   				$("#soy").val(snapshot.val().rol);
 				$("#soy").attr("data-scopes", snapshot.val().permisos);	
				//se activa //aciones
 				$("#doAcciones").removeClass("hide");
      			$('#acciones').modal();
      			$("#postImage").attr("src",usuario.photoURL );
   				$("#postCip").append(usuario.displayName);
   				//se actva edicion	
 				$('#editar').modal();
      			$("#epostImage").attr("src",usuario.photoURL );
      			$("#epostCip").append(usuario.displayName);
 		}else{
 			$("#doAcciones").remove();
 			$('#acciones').remove();
 			$('#editar').remove();
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
$("#savePerfil").click(
	function (){$("#perfil").submit()}
);
$("#perfil").submit(function(){
	var fichero = document.getElementById("photoURL");
	var imagenAsubir = fichero.files[0];
	var perfil = {};
	if (imagenAsubir){
		var referencia = userInLine.uid+"."+fichero.files[0].name.split(".")[1];
		storage.ref().child("imagenes/userPhoto/"  + referencia).put(imagenAsubir)
		.then(function (snap){
				var urlImage = snap.downloadURL;	
				Auth.currentUser.updateProfile({
					photoURL: urlImage
				});
				base.ref("/users/" +  userInLine.uid ).update({
					imagen: urlImage
				})
				
		});


	}else{
		perfil.imagen=userInLine.imagen;

	}

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
$(".loginConFacebook").click(function (){
		var provider = new firebase.auth.FacebookAuthProvider();
		provider.setCustomParameters({
		  'display': 'popup'
		});
		firebase.auth().signInWithPopup(provider)
		.then(function(result) {
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
		uName: userInLine.nombre,
		uImagen: userInLine.imagen
	};
	var newPostKey = firebase.database().ref().child('posts').push().key;
	if ($("#postText").val() != "" ||   adjuntos.contPics > 0 || adjuntos.Contfil > 0 ){
		$("#publicaciones").prepend(`
			<div class="row publicando">
				<div  class="card col s12">
					<div class="row">
						<div class="col s6"><div id="imgPublicacion" class="col s4"></div> Publicando...</div>
						<div class="col s6 right-align">				
							<div class="preloader-wrapper small active">

							    <div class="spinner-layer spinner-green-only">
							      <div class="circle-clipper left">
							        <div class="circle"></div>
							      </div><div class="gap-patch">
							        <div class="circle"></div>
							      </div><div class="circle-clipper right">
							        <div class="circle"></div>
							      </div>
							    </div>
							 </div>							
						</div>
					</div>
				</div>
				
				  
			</div> `);
		if (adjuntos.contPics > 0 ){
			postData.imagenes=[];
			postData.refImagenes=[];
			for (var i = 0; i < adjuntos.pics.length; i++ ){
				var ref = "imagen" + newPostKey + "-" + i;
				var src = URL.createObjectURL(adjuntos.pics[i])
				$("#imgPublicacion").html("<img src='"+src+"' class='responsive-img' height='2em'>");
				var URLimagen = await cargarArchivos("imagenes/posts",adjuntos.pics[i],ref);
				postData.imagenes.push(URLimagen);
				postData.refImagenes.push(ref);
			}
		}
		if ( adjuntos.Contfil > 0){
			postData.archivos=[];
			postData.archivosNombres=[];
			postData.refArchivos=[];
			for (var f = 0 ; f < adjuntos.fil.length; f++){
				var referencia = "archivo" + newPostKey + "-"+ f;
				var URLarchivo = await cargarArchivos("archivos/posts" ,adjuntos.fil[f], referencia);
				postData.archivos.push(URLarchivo);
				postData.archivosNombres.push(adjuntos.fil[f].name);
				postData.refArchivos.push(referencia);
			}
		}
		if ($("#postText").val() != ""){
			postData.texto = $("#postText").val();

		}else{
			postData.texto=""
		}
		if ($("#postText").hasClass("textoAzul") || $("#postText").hasClass("textoVerde") || $("#postText").hasClass("textoRojo") || $("#postText").hasClass("textoNaranja") ){
			postData.textoColor = $("#postText").attr("data-color") ;
			
		}
	

		var fecha = firebase.database.ServerValue.TIMESTAMP;
		postData.fecha = fecha; 
		
		postData.likes=0;
	     adjuntos.contPics = 0;
		 adjuntos.Contfil = 0;
		 adjuntos.pics = [];
		 adjuntos.fil = [];
		
		$("#postText").html("");
		$("#postText").val("");
		$("#postAdjuntos").html("");
		$("#postFotos").html("");
	 	$("#postText").removeClass("textoVerde");
		$("#postText").removeClass("textoAzul");
		$("#postText").removeClass("textoNaranja");
		$("#postText").removeClass("textoRojo");

		var newPostKey = firebase.database().ref().child('posts').push().key;
		var updates = {};
		
		updates['/posts/' + newPostKey] = postData;
		return firebase.database().ref().update(updates)
		.then(function (){
			delete postData;
			$(".publicando").remove();
		});
	}


});
//10.A.- CArga de archivos 
function cargarArchivos (ruta, archivo,referencia){
	var postArchivo = storage.ref().child( ruta + "/" + referencia);
	return postArchivo.put (archivo)
	.then(function (snap){
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
		var src = URL.createObjectURL(pic);
		if (pic){
			$("#postFotos").append(`
			<div class="col s3 tum" ><img class="responsive-img" src="${src}" ></div>`); 
			adjuntos.pics[adjuntos.contPics]=pic;
			adjuntos.contPics+=1;
			pic= null;
			src= null;
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
			<div class="col s12" ><i class="material-icons green-text">insert_drive_file</i> ${archivos[0].name} </div>`); 
			 adjuntos.fil[adjuntos.Contfil]= archivos[0];
		    adjuntos.Contfil+=1;
		}
});

//10.2.- Controla el tamaño del texto al escribir en un post 
$("#postText").on('keyup', function (){
	if ($(this).val().length >100){
		$(this).css("font-size" , "1em");
	}else{
		$(this).css("font-size" , "1.3em");
	}
});
//11 carga post en la pagina principal 


function cargarPost(){
	var publicaciones = firebase.database().ref('posts/').limitToLast(10);

	publicaciones.once("value", (snap)=> {
		snap.forEach((data) => {
			console.log();
		  publicar(data, "init");
		})
	})
	.then(() => {
		var ultimaPublicacion  = firebase.database().ref('posts/').limitToLast(1)
		return ultimaPublicacion.on("child_added",  (data) => {
			publicar(data, "add")

		});
	});
	publicaciones.on('child_changed', function (data){
		publicar(data, "change");
	});

	publicaciones.on('child_removed', function (data){
		$("#" + data.key).remove();
	});

}

function publicar(post, accion ){
	var id = post.val().uid;
	var publicacion = {};
	publicacion.id = post.key;
	publicacion.texto =post.val().texto;
	firebase.database().ref('/users/' + id).once('value').then(function(snapshot) {
		publicacion.username = snapshot.val().nombre;
		publicacion.photoUrl = snapshot.val().imagen;
		var postImagenes="";
		var postAdjuntos ="";
		var postLike ="";
		if (!post.val().likeA || !post.val().likeA[userInLine.uid] ){
			postLike +=`<i class="material-icons" id = "like${publicacion.id}" onclick="like('${publicacion.id}',${post.val().likes}) " >favorite_border</i>` ;	
			
		}else{
			postLike +=`<i class="material-icons #ff80ab-text pink-text accent-2" id = "like${publicacion.id}" onclick="like('${publicacion.id}',${post.val().likes}) " >favorite</i> ` ;		
		}
		var totalLikes = ``;
		if (post.val().likes > 0 ){
			totalLikes = ` <b> ${post.val().likes} me gusta </b>`; 
		}

		var totalComentarios =``;
		if (post.val().comentarios){
			totalComentarios +=`<b>` +Object.keys(post.val().comentarios).length + ` comentarios </b> `;
		}
		if (post.val().archivos ){
			
			for (var filer = 0; filer <  post.val().archivos.length; filer++){
				postAdjuntos+= `<div class= "adjuntos">`;
				postAdjuntos+= `<a data-aciones="true" href="${post.val().archivos[filer]}" download="${post.val().archivosNombres[filer]}" ><i class="material-icons">description</i>${post.val().archivosNombres[filer]}</a>`;
				postAdjuntos+= `</div>`;				
			}
			
			
		}
		if (post.val().imagenes){
			if (post.val().imagenes.length  == 1){
			postImagenes +=
					`<div class="card-image">
			          <img src="${post.val().imagenes[0]}">		          
			        </div>`;
			}
			if (post.val().imagenes.length  == 2){
				postImagenes +=	`<div class="row galeria card-image">`;

				let height = 200;
						postImagenes +=	`<div class="col s6" style="background-image: url('${post.val().imagenes[0]}'); no-repeat;background-size: cover; height: ${height}px !important; background-position: center center;" >`;
						postImagenes +=	`</div>`;
						postImagenes +=	`<div class="col s6" style="background-image: url('${post.val().imagenes[1]}'); no-repeat;background-size: cover; height: ${height}px !important; background-position: center center;" >`;
						postImagenes +=	`</div>`;	
						postImagenes +=  `</div>`;
			}
			if (post.val().imagenes.length  == 3){
							postImagenes +=
					`<div class="card-image">
			          <img src="${post.val().imagenes[0]}">		          
			        </div>`;
					     postImagenes +=	`<div class="row galeria card-image">`;
						let height = 150;
						postImagenes +=	`<div class="col s6" style="background-image: url('${post.val().imagenes[1]}'); no-repeat;background-size: cover; height: ${height}px !important; background-position: center center;" >`;
						postImagenes +=	`</div>`;
						postImagenes +=	`<div class="col s6" style="background-image: url('${post.val().imagenes[2]}'); no-repeat;background-size: cover; height: ${height}px !important; background-position: center center;" >`;
						postImagenes +=	`</div>`;	
						postImagenes +=  `</div>`;
			}
			if (post.val().imagenes.length  > 3){

					     postImagenes +=	`<div class="row galeria card-image">`;
						let height = 200;
						postImagenes +=	`<div class="col s6" style="background-image: url('${post.val().imagenes[0]}'); no-repeat;background-size: cover; height: ${height}px !important; background-position: center center;" >`;
						postImagenes +=	`</div>`;
						postImagenes +=	`<div class="col s6" style="background-image: url('${post.val().imagenes[1]}'); no-repeat;background-size: cover; height: ${height}px !important; background-position: center center;" >`;
						postImagenes +=	`</div>`;
						postImagenes +=	`<div class="col s6" style="background-image: url('${post.val().imagenes[2]}'); no-repeat;background-size: cover; height: ${height}px !important; background-position: center center;" >`;
						postImagenes +=	`</div>`;
						if (post.val().imagenes.length  > 4){
							postImagenes +=	`<div class="col s6" onClick="abrirPost('${post.key}')" style="background-image: url('${post.val().imagenes[3]}'); no-repeat;background-size: cover; height: ${height}px !important; background-position: center center;" >
							<center class="pink-text" ><h2><b> + ${post.val().imagenes.length-4} </b></h2></center>
						`;
						}else{
							postImagenes +=	`<div class="col s6" style="background-image: url('${post.val().imagenes[3]}'); no-repeat;background-size: cover; height: ${height}px !important; background-position: center center;">`;							
						}
						postImagenes +=	`</div>`;	
						postImagenes +=  `</div>`;
			}

		}
		var postMenus=``
	
		if(userInLine.scopes >= config2.acceso){
		 	 postMenus+= `<a class='dropdown-trigger right  blue-grey-text' data-aciones="true" href='#' data-target='menu${publicacion.id}'><i class="material-icons">more_vert</i></a>		      	
			  <ul id='menu${publicacion.id}' class='dropdown-content blue-grey-tex' >
			    <li><a href="#!" data-aciones="true" onclick = "reciclar('${publicacion.id}' );" class="blue-grey-text"><i class="material-icons ">delete_forever</i>Borrar</a></li>
			    <li><a href="#!" data-aciones="true" onclick = "editar ('${publicacion.id}')" class="blue-grey-text"><i class="material-icons blue-grey-text">edit</i>Editar</a></li>		
			  </ul>`;
		}
		var comentario =``;
		comentario +=`<div id = "comentarios${publicacion.id}" class= "comentarios hide" >`;                      
		
		if (post.val().comentarios){
		var comentarios = base.ref().child("/posts/" + publicacion.id + "/comentarios");
			comentarios.once("value", function (comen){
				comen.forEach(function(comenC){
				comentario+=`<div id ="com${comenC.key}" class="com  #fce4ec pink lighten-5">
								<div  class="chip #fce4ec pink lighten-5">
				                  <img  src="${comenC.val().imagen}" alt="${comenC.val().nombre}">            
									<b>${comenC.val().nombre}</b>	

				                </div>
			                	<div class="texto-comentario">${comenC.val().comentario}</div>
							</div>`;
				})	
				
			} );	
		
		}
		comentario+=`<center class="row "> 
                	  	<textarea class="col s9" id="textComentario${publicacion.id}" onkeyup="up('${publicacion.id}')"  placeholder = "Escribe un comentario"></textarea><i onclick="addComentario('${publicacion.id}')" class="material-icons right-align col s3 hide #ff80ab pink-text accent-1 ">send</i>  	
                 		</center>
					</div> `;
		var text ='';
		if (!post.val().textoColor ){
			text+=  `<div class="texto"><p class="flow-text">${post.val().texto}</p></div>`;
		}else{
			text+=  `<div class="valign-wrapper ${post.val().textoColor} fondo center-align"><h4 class="center-align">${post.val().texto}</h4></div>`;

		}
		var objetoPublicacion = `
			     <div id = "${publicacion.id}" class="card" >
			      	<div class="usuarioPost"> 		      	
			     		${postMenus}
	  	     		  <div class="chip white">
					    <img src="${publicacion.photoUrl}" alt="${publicacion.username}" >
					    <b>${publicacion.username}</b>
					  </div>
					    <small>${calcularFecha(post.val().fecha)}</small>			  
					</div>
			        ${text}		        
			        ${postImagenes}
					${postAdjuntos}	
					  <div class="card sticky-action">
 						  <div class="card-action row">
 						 	 <div class="col s6">${postLike} ${totalLikes}</div>	
 						 	 <div class="col s6 right-align">${totalComentarios}<i class="material-icons" onclick="toogleComentarios('${publicacion.id}')" >chat_bubble_outline</i></div>						  
 						  </div> 
 						    ${comentario} 
 					  </div>
 					
			      </div>
		`;
		
		if (accion == "change"){
			$("#"+ publicacion.id).replaceWith(objetoPublicacion);
		}
		if (accion == "init"){
			$("#publicaciones").append(objetoPublicacion);

		}
		if (accion == "add"  && config2.primeraCarga==true){
			if ( $("#" + publicacion.id).length != 0 ){
			
				$("#"+ publicacion.id).replaceWith(objetoPublicacion);
			}else{
	 			$("#publicaciones").prepend(objetoPublicacion);		
	 		}
			
		}

		$('.dropdown-trigger').dropdown();

 	});
	;
	$(".publicando").remove();


}
reproducirSonido  = function (){
var audio = new Audio('iphone-notificacion.mp3');
audio.play();
}

//12 Calcular Fecha y hora 
function calcularFecha (fechas){
	let fecha = new Date(fechas);
	let hoy = new Date().getTime();
	let pFecha = new Date (fechas).getTime();
	let dif = (hoy -pFecha );
	let dias = dif / (1000 * 60 * 60 * 24 );
	let horas = dif / (1000 * 60 * 60  );
	let minutos = dif / (1000 * 60  );
	var mostrar = "Justo ahora";
	let meses = ['En', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

	if(dias < 1 && horas < 1 && minutos >= 1){
		mostrar = "hace " +  Math.floor(minutos) + " minutos";
	}
	if(dias < 1 && horas >=1  ){
		mostrar = "hace " +  Math.floor(horas) + " horas";
	}

	if(dias == 1){
		mostrar = "Ayer a las  "  + fecha.getHours() + ":" + fecha.getMinutes();
	}

	if(dias > 1){
		mostrar =  fecha.getDate()+" de "+ meses[fecha.getMonth()] +" a las " + fecha.getHours() + ":" + fecha.getMinutes();
	}

	if(dias < 1 && horas < 1 && minutos < 1  && minutos > 0){
		mostrar = "hace poco";
	}

	if(dias===NaN && horas===NaN  && minutos===NaN  ){
		mostrar = "Justo ahora";
	}

	return mostrar;
}
// 13 Like 
function like (id, totaldelikes){
	let tolike = document.getElementById("like" + id );
	if (tolike.innerHTML== "favorite_border"){
		tolike.innerHTML="favorite";
		tolike.className +=  " #ff80ab-text pink-text accent-2"
		
		var  likesRef = base.ref().child("/posts/" + id);
		likesRef.transaction (function(post){
			if (post){	
				if (!post.likeA || !post.likeA[userInLine.uid]){	
					post.likes++;
					 if (!post.LikeA) {
				         post.likeA = {};
				      }
				      post.likeA[userInLine.uid]=true;
			  	}
			}
			likesRef.update(post);

		});
		

	}else{
		tolike.innerHTML="favorite_border";
		var  likesRef = base.ref().child("/posts/" + id);
		likesRef.transaction (function(post){
			if (post){	
					post.likes--;	
				     post.likeA[userInLine.uid]=false;
			  	}
			likesRef.update(post);
		});
	}


}


//14.- Borrar el POST
async function  reciclar(postId){
	new Promise((resolver, rechazar) => {
    $("#" + postId).remove();	
    	var postBorrar = base.ref('posts/' + postId);
    		     postBorrar.once("value", function (snap){
    			if (snap.val().refImagenes){
    				for (let i =0; i<snap.val().refImagenes.length; i++){
    					storage.ref().child("imagenes/posts/" +snap.val().refImagenes[i])
    					.delete();

    				}
    			}
    			if (snap.val().refArchivos){
    				for (let i =0; i<snap.val().refArchivos.length; i++){
    					storage.ref().child("archivos/posts/" +snap.val().refArchivos[i])
    					.delete();

    				}
    			}
    	});

	    resolver();
	})
	.then(() => {
	    throw new Error('Algo falló'  );

	})
	.catch(() => {
	    
	})
	.then(() => {
		var postBorrar = base.ref('posts/' + postId)
	   postBorrar.remove();
	});


	}	

//15 Editar post 
var ePosts = {}
function editar (postId){
	ePosts.uid=userInLine.uid;
	
	var  editarPost = base.ref().child("/posts/" + postId);
	$("#editar").attr("data-id" , postId);

	editarPost.once('value').then(function (snp){
		ePosts.texto="";
		$("#epostText").val("");
		if (snp.val().texto){
			ePosts.texto=snp.val().texto;
			$("#epostText").val(snp.val().texto);
		}
		if (snp.val().textoColor){
			$("#epostText").addClass(snp.val().textoColor);
			$("#epostText").attr("data-color", snp.val().textoColor);
			ePosts.textoColor = snp.val().textoColor;
		}
		var listPhotos = '';
		editarPost.fecha = snp.val().fecha;
		if (snp.val().imagenes){
			var listPhotos = '';
			ePosts.imagenes=[];
			for (var ephotos = 0; ephotos < snp.val().imagenes.length; ephotos++){
				listPhotos +=`<div class="col s3 tum" data-img="egal${ephotos}"  onclick="quitar('imagenes', '${ephotos}', '${ephotos}')"><img class="responsive-img" src="${snp.val().imagenes[ephotos]}"><i class="material-icons basurero">delete</i></div>`; 							
				ePosts.imagenes.push(snp.val().imagenes[ephotos]);
			}

		}
		var listArchivos = 	``;
		
		if (snp.val().archivos){
			ePosts.archivos=[];
			ePosts.archivosNombres=[];
			for (var earchivos = 0; earchivos < snp.val().archivos.length; earchivos++){
				listArchivos +=`<div class="col 12"  data-arc="efil${earchivos}" onclick="quitar('archivo', '${earchivos}', '${earchivos}')" ><span href = "${snp.val().archivos[earchivos]}" data-aciones="true" ><i class="material-icons">insert_drive_file</i> ${snp.val().archivosNombres[earchivos]}</span> <i class="material-icons">delete</i></div>`; 							
				ePosts.archivos.push(snp.val().archivos[earchivos]);
				ePosts.archivosNombres.push(snp.val().archivosNombres[earchivos]);

			}		
		}
		ePosts.likes=snp.val().likes;
		if (snp.val().likeA){
			ePosts.likeA = snp.val().likeA;
		}
		$("#epostFotos").html(listPhotos);
		$("#epostAdjuntos").html(listArchivos);

	
	});
	
	$("#editar").modal("open");
}

function quitar(arreglo, valor, data){
	if (arreglo == "imagenes"){
		ePosts.imagenes.splice(valor, valor);
		$("[data-img=egal"+valor+"]").remove();
	}
	if (arreglo == "archivo"){

		ePosts.archivos.splice(valor, valor);
		ePosts.archivosNombres.splice(valor, valor);
		$("[data-arc=efil"+valor+"]").remove();
	}

}

$("#epostSend").click(async function (e){
	ePosts.texto = $("#epostText").val();
	$("#" + $("#editar").attr('data-id')  ).prepend(`
		<div class="progress  #ff80ab pink accent-1">
    		  <div class="indeterminate  #ff80ab pink accent-2"></div>
	   	</div>`);
	
	if (nimagen || nimagen.length > 0){
		if (!ePosts.imagenes){
			ePosts.imagenes=[];
			
		}
		ePosts.refImagenes=[];
		for (let s = 0 ; s < nimagen.length ; s++){
			var ref = "Imagen" + $("#editar").attr('data-id') + "-" + s;
			let nFoto = await cargarArchivos ("/imagenes/posts/", nimagen[s], ref);
			ePosts.imagenes.push(nFoto);
			ePosts.refImagenes.push(ref);
		
		}
		nimagen= [];
	}

	if (nadjunto|| nadjunto.length > 0){
		if (!ePosts.archivos){
			ePosts.archivos=[];
			ePosts.archivosNombres=[];
			ePosts.refArchivos=[]
		}
		for (let j = 0 ; j < nadjunto.length ; j++){
			var referencia = "archivo" + $("#editar").attr('data-id') + "-"+ j;	
			let nAdjunto = await cargarArchivos ("/archivos/posts/", nadjunto[j], referencia);	
			ePosts.archivos.push(nAdjunto);
			ePosts.archivosNombres.push(nadjuntoNombres[j]);
			ePosts.refArchivos.push(referencia);
		
		}
			nadjunto= [];

	}
	if($("#epostText").attr("data-color") != "null" ){
		ePosts.textoColor=$("#epostText").attr("data-color");
	}else{
		ePosts.textoColor=false;
	}
	if (ePosts.textoColor == undefined){
			ePosts.textoColor=false;
	}
	var  editarPost = base.ref().child("/posts/" + $("#editar").attr('data-id') );
	editarPost.update(ePosts).then (
		function (){
			delete ePosts.texto;
			delete ePosts.imagenes;
			delete ePosts.archivos;
			delete ePosts.archivosNombres;
			delete ePosts.textoColor
			delete ePosts.refArchivos;
			delete ePosts.refImagenes;
			ePosts={};
			$("#epostText").attr("data-color", null);

		}
	);

});


$("#epostUpImagen").click(function (){
	$("#epostImagen").click();
});
var nimagen = [];
$("#epostImagen").change(function (e){
	
	var archivos = e
		var pic = archivos.target.files[0] ;
		var src = URL.createObjectURL(pic);
		if (pic){
			$("#epostFotos").append(`
			<div class="col s3 tum" ><img class="responsive-img" src="${src}" ></div>`); 
			nimagen.push(archivos.target.files[0]);		
			pic= null;
			src= null;
		}

});

$("#epostUpArchivo").click(function (){
	$("#epostAcrivos").click();
});
var nadjunto=[]
var nadjuntoNombres=[];

$("#epostAcrivos").change(function (we){
	let archi =$(this).get(0).files;
		if (archi){		
			$("#epostAdjuntos").append(`
			<div class="col s12" ><i class="material-icons green-text">insert_drive_file</i> ${archi[0].name} </div>`); 
			 nadjunto.push(archi[0]);
		     nadjuntoNombres.push(archi[0].name);
		}
});

function up (e){
	if ($("#textComentario"+e).val() != ""){
	$("#comentarios"+ e +" > center > i" ).removeClass("hide");

	}else{
		$("#comentarios"+ e +" > center > i" ).addClass("hide");
	}
}
function addComentario(pid){
	let  toComent = base.ref().child("/posts/" + pid + "/comentarios");
	let comentario = {}
	let nComentId = firebase.database().ref().child('posts/'+pid+'/comentarios/').push().key
	comentario.uid = userInLine.uid;
	comentario.nombre = userInLine.nombre;
	comentario.imagen = userInLine.imagen;
	comentario.comentario = $("#textComentario" + pid).val();
	let updates ={}
	updates['/posts/' + pid + "/comentarios/" + nComentId  ]= comentario;
	base.ref().update(updates);
}

function toogleComentarios(id){
	if ($("#comentarios" + id).hasClass("hide")){
		$("#comentarios" + id).removeClass("hide")
	}else{
		$("#comentarios" + id).addClass("hide")
	}
	
}

$("#postColores .col ").click(function(event) {
	$("#postColores .col").removeClass("active");	
	$("#postText").removeClass("textoVerde");
	$("#postText").removeClass("textoAzul");
	$("#postText").removeClass("textoNaranja");
	$("#postText").removeClass("textoRojo");
	$(this).addClass("active");
	$("#postText").addClass($(this).attr("data-color"));
	$("#postText").attr("data-color",$(this).attr("data-color") );
});
$("#postColor").click(function (){
	if ($("#postColores").hasClass("hide")){
		$("#postColores").removeClass("hide");
	}else{
		$("#postColores").addClass("hide");
		$("#postText").removeClass("textoVerde");
		$("#postText").removeClass("textoAzul");
		$("#postText").removeClass("textoNaranja");
		$("#postText").removeClass("textoRojo");

	}
});

$("#epostColores .col ").click(function(event) {
	console.log($(this).attr("data-color"));
	$("#epostColores .col").removeClass("active");	
	$("#epostText").removeClass("textoVerde");
	$("#epostText").removeClass("textoAzul");
	$("#epostText").removeClass("textoNaranja");
	$("#epostText").removeClass("textoRojo");
	$(this).addClass("active");
	$("#epostText").addClass($(this).attr("data-color"));
	$("#epostText").attr("data-color",$(this).attr("data-color") );
});
$("#epostColor").click(function (){
	if ($("#epostColores").hasClass("hide")){
		$("#epostColores").removeClass("hide");
	}else{
		$("#epostColores").addClass("hide");
		$("#epostText").removeClass("textoVerde");
		$("#epostText").removeClass("textoAzul");
		$("#epostText").removeClass("textoNaranja");
		$("#epostText").removeClass("textoRojo");
	}
});

function activarMensajeria(){
	messaging1.requestPermission()
	.then(()=> messaging1.getToken())
	.then((tken) => manejadorDeTokens () )
	.catch((e)=> console.log("ocurrio un error " + e));
}

function manejadorDeTokens (){
	return messaging1.getToken()
	.then((token)=> {
		base.ref ('/tokens/' + token ).set({
			token: token,
			uid: userInLine.uid
		})	
	})
}



function abrirPost(postId){
	$("#verPost .contenido").html("");
	base.ref("/posts/" + postId).once("value")
	.then(function(snapshot){
	var verPost = snapshot.val();
	var text = ``; 		
	if (!verPost.textoColor ){
		text+=  `<div class="texto"><p class="flow-text">${verPost.texto}</p></div>`;
	}else{
		text+=  `<div class="valign-wrapper ${verPost.textoColor} fondo center-align"><h4 class="center-align">${post.val().texto}</h4></div>`;
	}
	var postImagenes =``;
	for (let imgs = 0 ; imgs < verPost.imagenes.length; imgs++ ){
		postImagenes +=
		`<div class="card-image">
	      	<img src="${verPost.imagenes[imgs]}">
	     `;		          
	}
	var postLike ="";
		if (!verPost.likeA || !verPost.likeA[userInLine.uid] ){
			postLike +=`<i class="material-icons" id = "like${postId}" onclick="like('${postId}',${verPost.likes}) " >favorite_border</i>` ;	
			
		}else{
			postLike +=`<i class="material-icons #ff80ab-text pink-text accent-2" id = "like${postId}" onclick="like('${postId}',${verPost.likes}) " >favorite</i> ` ;		
		}
		var totalLikes = ``;
		if (verPost.likes > 0 ){
			totalLikes = ` <b> ${verPost.likes} me gusta </b>`; 
		}
		var totalComentarios =``;
		if (verPost.comentarios){
			totalComentarios +=`<b>` +Object.keys(verPost.comentarios).length + ` comentarios </b> `;
		}
		var postAdjuntos = ``;
		if (verPost.archivos ){
		
			for (var filer = 0; filer <  verPost.archivos.length; filer++){
				postAdjuntos+= `<div class= "adjuntos">`;
				postAdjuntos+= `<a data-aciones="true" href="${verPost.archivos[filer]}" ><i class="material-icons">description</i>${verPost.archivosNombres[filer]}</a>`;
				postAdjuntos+= `</div>`;				
			}
			
			
		}
	var objetoPublicacion = `
     <div id = "VerPost_${postId}" class="card" >
      	<div class="usuarioPost"> 		      	
     	
     	 <div class="chip white">
		    <img src="${verPost.uImagen}" alt="${verPost.uName}" >
		    <b>${verPost.uName}</b>
		  </div>
		    <small>${calcularFecha(verPost.fecha)}</small>			  
		</div>
        ${text}		        
        ${postImagenes}
		${postAdjuntos}	
		  <div class="card sticky-action">
				  <div class="card-action row">
				 	 <div class="col s6">${postLike} ${totalLikes}</div>	
				 	 <div class="col s6 right-align">${totalComentarios}<i class="material-icons"  >chat_bubble_outline</i></div>						  
				  </div> 
			
			  </div>
			
      </div>
		`;
		$("#verPost .contenido").html(objetoPublicacion);

	});
	navegacion("#verPost");
}
$("#toChat").click(function (){
	bConversaciones();		
});

$("#ChatAddContacto").click(listarContactos);
function listarContactos(){

	var listaUsuarios = base.ref().child("users");
	listaUsuarios.once("value").then(function (listaU){
		listaU.forEach(function(childListaU) {
		 let contacto= childListaU.val()
		 if (childListaU.key != userInLine.uid){
			$("#listaUsuarios").append(`<li class="collection-item avatar" data-id="${childListaU.key}" onClick="abrirConversacion('${childListaU.key}', '${contacto.imagen}', '${contacto.nombre}')">
			      <img src="${contacto.imagen}" alt="${contacto.nombre}" class="circle">
			      <span class="title">${contacto.nombre}</span>
			      <p>
			      	<small>${contacto.rol}</small>		         
			      </p>
			    
			    </li>`
			    );

		}
	 });
		
	});

}

function abrirConversacion(chatId, imagen, nombre) {
	$("#chatNombre").html(" &nbsp;" + nombre);
	$("#chatImagen").attr("src", imagen);
	$("#conversacion").height( $(window).height() );
	$("#conversacionMensajes").html("");  
	var conversacion=chatId;
	$("#conversacionMensajes").attr("data-id", conversacion);	
	var escucharConversacion = base.ref('chat/').child(userInLine.uid + "/" + conversacion).limitToLast(100);
	escucharConversacion.on("child_added", function (mensajes){
		dibujarMensaje(mensajes.val(), mensajes.key, chatId )
	})
		escucharConversacion.on("child_changed", function (mensajes){
		dibujarMensaje(mensajes.val(), mensajes.key, chatId )
	})
	
	navegacion("#conversacion");
}
function calcularFechaMensaje(fecha){
	let meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
	let ahora = new Date().getTime();
	let laFecha = new Date (fecha).getTime();
	var diff = (ahora - laFecha)/(1000*60*60*24);
	if (diff < 1){
		return "Hoy";
	}
	if (diff >= 1 && diff < 2){
		return "Ayer";
	}
	return fecha.getDate() + " de " +meses[fecha.getMonth()] +  " de " + fecha.getFullYear();


}

function dibujarMensaje(objeto, clave, conversacion){
	var mensaje = objeto;
 	var fecha = new Date(mensaje.fecha);
 	var HTMLestado='';
 	var HTMLtexto ='';
 	var HTMLImagen='';
 	var clase_mensaje=' mensajeRecivido';
 	var ultimaFecha =  $(".ultimaFecha").attr('data-fecha');
 	var mensajeFecha = new Date(fecha.getFullYear(), fecha.getMonth(),fecha.getDate() );
 	if (new Date(ultimaFecha) < mensajeFecha || ultimaFecha == undefined ){
		$(".ultimaFecha").removeClass("ultimaFecha");
		$('#conversacionMensajes').append("<div class='fechaMensaje ultimaFecha center-align ' data-fecha='"+mensajeFecha+"'><span>"+ calcularFechaMensaje(mensajeFecha)  +"</span></div>");	
	}
 	if (mensaje.texto){
 		HTMLtexto = mensaje.texto;
 	}
 	if (mensaje.imagen ){

 		HTMLImagen = `<img src="${mensaje.imagen}" />`;
 	}
	if (mensaje.IdEnviador == userInLine.uid){ 	
	 	switch (objeto.estado){
	 		case 0: 
	 			 HTMLestado +='<small><i class="material-icons grey-text darken-1">access_time</i></small>'
	 		break;
	 		case 1: 
	 			 HTMLestado +='<small><i class="material-icons grey-text darken-1"">done</i></small>'
	 		break;
	 		case 2: 
	 			 HTMLestado +='<small><i class="material-icons padding: 0.5em;"">done_all</i></small>'
	 		break;
	 		case 3: 
	 			 HTMLestado +='<small><i class="material-icons teal-text lighten-3">done_all</i></small>'
	 		break;
	 	} 	
	 	clase_mensaje= "right-align mensajeEnviado";
	 }
     var HTMLmensaje = 
			`<div class="${clase_mensaje}" id ="${clave}">
				<div class="left-align z-depth-2 black-text" > 
					${HTMLtexto} 
					${HTMLImagen} 
					<small class="right-align grey-text darken-1 "><i>${fecha.getHours()}:${fecha.getMinutes()}</i></small>
					${HTMLestado}
				</div>
			</div>`;

	 if ($("#" + clave).length > 0 ){
		$("#" + clave).replaceWith(HTMLmensaje);
 	 }else{

 	 	if( $("#conversacionMensajes").attr("data-id") === conversacion ){			
 	 		$('#conversacionMensajes').append(HTMLmensaje);	
 	 	}
		
	 }
	 $("#conversacionMensajes").scrollTop($('#conversacionMensajes')[0].scrollHeight);

	 if (mensaje.IdRecividor == userInLine.uid){
	 	if( $("#conversacionMensajes").attr("data-id") === conversacion ){	
		 	if (mensaje.estado == 2 ){
		 		base.ref("chat/" +userInLine.uid+ "/" + mensaje.IdEnviador + "/" + clave ).update({
		 			estado: 3
		 		}).then(()=>{
		 			
		 			base.ref("chat/" + mensaje.IdEnviador + "/" +userInLine.uid+ "/"  + clave ).update({
		 				estado: 3
		 			})
		 		})
		 	}
		 }
	 	
	 }


}
$("#enviarMensaje").click(enviador);
function enviador (){
	if ($("#mensaje").val() != ""){
		var sendMensaje ={}		
		var fecha = new Date();
		sendMensaje.fecha=fecha;
		sendMensaje.texto = $("#mensaje").val();
		sendMensaje.estado = 0;
		sendMensaje.IdEnviador= userInLine.uid;
		sendMensaje.NombreEnviador= userInLine.nombre;
		sendMensaje.ImagenEnviador= userInLine.imagen;
		sendMensaje.IdRecividor= $("#conversacionMensajes").attr("data-id") ;
	
		$("#mensaje").val("");
		$("#mensaje").css({"height": "1em"});
		var nuevoIdMensaje = base.ref().child('/chat/' + sendMensaje.IdRecividor + '/' +userInLine.uid ).push().key;
		dibujarMensaje(sendMensaje, nuevoIdMensaje ,sendMensaje.conversacion );
		sendMensaje.fecha = firebase.database.ServerValue.TIMESTAMP;
		sendMensaje.estado = 1;
		var updates = {};
		updates['/chat/' + userInLine.uid  +"/" + sendMensaje.IdRecividor + "/"+ nuevoIdMensaje ] = sendMensaje;
		base.ref().update(updates)
		.then(function (){
			delete sendMensaje;

		});
	}

}
$(".backChat").click(bConversaciones);
	function bConversaciones(){
	$("#listaUsuarios").html("");	
	$("#conversacionMensajes").attr("data-id", null);
	navegacion("#chat");
}

$("#irBuscar").click(function (){

	if ($("#chatBuscarContacto").hasClass('hide')){
			$("#chatBuscarContacto").removeClass('hide');
			$("#buscarNombre").focus();

	}else{
		$("#chatBuscarContacto").addClass('hide');
		$("#buscarNombre").val("");
	}
});
$("#camaraMensaje").click(function(event){
	$("#mensajeImagen").click();
});
$("#mensajeImagen").change(manejadorDeImagenesChat);
function manejadorDeImagenesChat (e){
	var archivo = e.target.files[0];
	var imagen = URL.createObjectURL(archivo);
	var mensajeConImagen = {} 
	if (archivo){
		var sendMensaje ={}		
		var fecha = new Date();
		sendMensaje.fecha=fecha;
		sendMensaje.imagen = imagen;
		sendMensaje.estado = 0;
		sendMensaje.IdEnviador= userInLine.uid;
		sendMensaje.NombreEnviador= userInLine.nombre;
		sendMensaje.ImagenEnviador= userInLine.imagen;
		sendMensaje.IdRecividor= $("#conversacionMensajes").attr("data-id") ;
	
		$("#mensaje").val("");
		$("#mensaje").css({"height": "1em"});
		var nuevoIdMensaje = base.ref().child('/chat/' + sendMensaje.IdRecividor + '/' +userInLine.uid ).push().key;
		dibujarMensaje(sendMensaje, nuevoIdMensaje , $("#conversacionMensajes").attr("data-id"));
		sendMensaje.fecha = firebase.database.ServerValue.TIMESTAMP;
		sendMensaje.estado = 1;
		var updates = {};

		var imagenMensaje = storage.ref("/imagenes/mensajes/" +  nuevoIdMensaje +"."+archivo.name.split(".")[1] )
	.put(archivo);
		imagenMensaje.on("state_changed", function (snapshot){
			var progreso = (snapshot.bytesTransferred  / snapshot.totalBytes) * 100 ;
			console.log(progreso)
			if ($("#prog").length > 0){
			$("#prog").replaceWith(`<strong id="prog" class="progress">
		      	<div class="determinate" style="width: ${progreso}%"></div>
		  		</strong>`);


			}else{
			$("#"+nuevoIdMensaje +" .left-align").prepend(`<strong id="prog" class="progress" width="100%">
		      			<div class="determinate" style="width: ${progreso}%"></div>
		  		</strong>`);
			}

		}, function (error){
			console.log("ocurio un error : " + error.message);
		}, function (){
			 imagenMensaje.snapshot.ref.getDownloadURL().then(function(downloadURL) {
			 	sendMensaje.imagen = downloadURL;
					updates['/chat/' + userInLine.uid  +"/" + sendMensaje.IdRecividor + "/"+ nuevoIdMensaje ] = sendMensaje;
					base.ref().update(updates)
					.then(function (){
						delete sendMensaje;

					});
			   
			  });
		});
		
	}

}
$("#addHistoria").click(function (){
	$("#imagenHistoria").click();
});
$("#imagenHistoria").change(addHistoria);
function addHistoria(e){
	var archivo = e.target.files[0];
	if (archivo){
		var historia = {}
		historia.fecha=firebase.database.ServerValue.TIMESTAMP;
		historia.uid = userInLine.uid;
		historia.uNombre =userInLine.nombre;
		historia.uImagen= userInLine.imagen;

		var newHistoria = base.ref().child("/historias/"  ).push().key;
		var subirHistoria = storage.ref("/imagenes/historias/" + newHistoria+"."+archivo.name.split(".")[1] )
		.put(archivo);

		subirHistoria.on("state_changed", function (snapshot){
			var progreso = (snapshot.bytesTransferred  / snapshot.totalBytes) * 100 ;


		}, function (error){
			console.log("Ocurrio un error : " + error.message );
		}, 
		function (){
			subirHistoria.snapshot.ref.getDownloadURL().then(function (downloadURL){
				historia.imagen = downloadURL;
				base.ref().child("/historias/" + newHistoria).update(historia)
				.then(()=> {
					delete historia;
				})

			});
		}

		);

	}

	
}

$("#toHistorias").click(function (){
	$("#listaHistorias").html("");
	var now = new Date();
	var diaDeMes = now.getDate();
	now.setDate(diaDeMes -1);
	var hoy = Date.parse(now );
	var fechaFiltro = Date.parse(now);

	return firebase.database().ref("/historias/").orderByChild("fecha").startAt(fechaFiltro)
		.once("value", function (snap) {
		
			snap.forEach((item) => {
			  if (item.val().uid != userInLine.uid ){
			  		base.ref("users/" + item.val().uid ).on("value", function (userHistoria){
			  		var hora = new Date (item.val().fecha);
			  		var ahora = new Date();
			  		console.log(ahora - hora);
			  		HTMLitem= `<li id="historia${item.val().uid}" class="collection-item avatar" onClick="verHistoria('${item.val().uid}','${item.val().uNombre}', '${item.val().uImagen}')">
								      <img src="${userHistoria.val().imagen}" alt="${userHistoria.val().nombre}" class="circle">
								      <span class="title">${userHistoria.val().nombre}</span>
								      <p>${hora.getHours()}:${hora.getMinutes()}<br>								       
								      </p>								
								    </li>`;			  			
						if( $("#historia" + item.val().uid).length > 0 ){
								$("#historia" + item.val().uid).replaceAll(HTMLitem);

						}else{
							$("#listaHistorias").append(HTMLitem);
						}
			  		});
			  }
			});
		});



});
function verHistoria(id, nombre, imagen){

	$("#verHistoria").height( $(window).height() );
	$("#hImagen").attr("src",imagen);
	$("#nombreHistoria").html(nombre);
	var now = new Date();
	var diaDeMes = now.getDate();
	now.setDate(diaDeMes -1);
	var fechaFiltro = Date.parse(now);
	var consultaHistorias = base.ref("historias/").orderByChild("uid").equalTo(id);
	consultaHistorias.once("value", function (snap){
		console.log(snap.val());
		snap.forEach((item) => {
			$("#mostrarFotos").append(`<img  src="${item.val().imagen}"  class="responsive-img hide" />`);			
		});

	}).then(()=>{
		animarHistorias("#mostrarFotos");
	})

	$('.carousel.carousel-slider ').carousel({fullWidth: true, indicators: true});
	navegacion("#verHistoria");
}
function animarHistorias(contenedor){
	
	var indice = 0
	var totlaIndice = $(contenedor+" img").length;
	var objeto = $(contenedor+" img")[indice];
	objeto.className = "responsive-img  active";
	var intervalo = setInterval(() => {
		console.log(indice);
		indice += 1;
		if(indice < totlaIndice ){
			objeto.className="hide";
		
			objeto = $(contenedor+" img")[indice];
			objeto.className = "responsive-img  active";
		}else{
			$("#mostrarFotos img").addClass("hide") ;
			window.clearInterval(intervalo);
			$("#toHistorias").click();
		}
	},3000)
}

$(".backHistorias").click(()=>{ $("#toHistorias").click() ;});

$("#recuperar").submit(function (){
	var auth = firebase.auth();
	var emailAddress = $("#email_recuperar").val();
	console.log(emailAddress)

	auth.sendPasswordResetEmail(emailAddress).then(function(snap) {
	  alert("Enviamos un correo con indicaciones para restablecer tu contraseña. " )
	}).catch(function(error) {
	  	alert(error.message);
	});
})