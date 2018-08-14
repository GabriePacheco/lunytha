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

var userInLine = {}
var config2 = {}
config2.acceso = 3;
config2.primeraCarga = true;
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
	var newPostKey = firebase.database().ref().child('posts').push().key;
	if ($("#postText").val() != "" ||   adjuntos.contPics > 0 || adjuntos.Contfil > 0 ){
		$("#publicaciones").prepend(`
			<div class="row  publicando">
				<div class="col s6">
					<h6>Publicando..</h6>
				</div>
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
						  

			`);
		if (adjuntos.contPics > 0 ){
			postData.imagenes=[];
			for (var i = 0; i < adjuntos.pics.length; i++ ){
				var URLimagen = await cargarArchivos("imagenes/posts" , adjuntos.pics[i]);
				console.log("subiendo foto " + i);
				postData.imagenes.push(URLimagen);
			}
		}
		if ( adjuntos.Contfil > 0){
			postData.archivos=[];
			postData.archivosNombres=[];
			for (var f = 0 ; f < adjuntos.fil.length; f++){
				
				var URLarchivo = await cargarArchivos("archivos/posts" , adjuntos.fil[f]);
				postData.archivos.push(URLarchivo);
				postData.archivosNombres.push(adjuntos.fil[f].name);
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
	

		var fecha = new Date();
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
	var publicaciones = firebase.database().ref('posts/');
	publicaciones.once("value", function (p){
	
	})

	publicaciones.on('child_changed', function (data){
		publicar(data, "change");
	});
	publicaciones.on ('child_added', function (data){
		
		publicar(data, "add");
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
			if (post.val().archivos.length == 1 ){
				postAdjuntos+= `<div class= "adjuntos">`;
				for (var filer = 0; filer <  post.val().archivos.length; filer++){

					postAdjuntos+= `<a data-aciones="true" href="${post.val().archivos[filer]}" ><i class="material-icons">description</i>${post.val().archivosNombres[filer]}</a>`;
				}
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
							postImagenes +=	`<div class="col s6" style="background-image: url('${post.val().imagenes[3]}'); no-repeat;background-size: cover; height: ${height}px !important; background-position: center center;" >
							<center class="pink-text"><h2><b> + ${post.val().imagenes.length-4} </b></h2></center>
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
				comentario+=`<div id ="com${comenC.key}" class="com grey lighten-2">
								<div  class="chip #bdbdbd">
				                  <img  src="${comenC.val().imagen}" alt="${comenC.val().nombre}">            
									<b>${comenC.val().nombre}</b>	

				                </div>
			                	<div class="texto-comentario">${comenC.val().comentario}</div>
							</div>`;
				})	
				
			} );	
		
		}
		comentario+=`<center class="row "> 
                  <textarea class="col s9" id="textComentario${publicacion.id}" onkeyup="up('${publicacion.id}')"  placeholder = "Escribe un comentario"></textarea><i onclick="addComentario('${publicacion.id}')" class="material-icons right-align col s3 hide">send</i>  	
                 </center>
		</div> `;
		var text ='';
		if (!post.val().textoColor ){
			text+=  `<div class="texto"><p class="flow-text">${post.val().texto}</p></div>`;
		}else{
			text+=  `<div class="valign-wrapper   ${post.val().textoColor} fondo"><h4 class="center-align">${post.val().texto}</h4></div>`;

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
			$("#publicaciones").append(objetoPublicacion);		
		}
		$('.dropdown-trigger').dropdown();

 	});
	;
	$(".publicando").remove();	

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
		mostrar =  fecha.getDate()+"/"+ fecha.getMonth() +" a las " + fecha.getHours() + ":" + fecha.getMinutes();
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
function reciclar(postId){
	base.ref('posts/' + postId).remove().then(function(){
		$("#" + postId).remove();
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
			ePosts.textoColor = snp.val().textoColor;
		}
		var listPhotos = '';
		editarPost.fecha = snp.val().fecha;
		if (snp.val().imagenes){
			var listPhotos = '';
			ePosts.imagenes=[];
			for (var ephotos = 0; ephotos < snp.val().imagenes.length; ephotos++){
				listPhotos +=`<div class="col s3 tum" data-img="egal${ephotos}"  onclick="quitar('imagenes', '${ephotos}', '${ephotos}')"><img class="responsive-img" src="${snp.val().imagenes[ephotos]}"><i class="material-icons">delete</i></div>`; 							
				ePosts.imagenes.push(snp.val().imagenes[ephotos]);
			}

		}
		var listArchivos = '';
		
		if (snp.val().archivos){
			ePosts.archivos=[];
			ePosts.archivosNombres=[];
			for (var earchivos = 0; earchivos < snp.val().archivos.length; earchivos++){
				listArchivos +=`<div class="col 12" data-arc="efil=${earchivos}"><a href = "${snp.val().archivos[earchivos]}" download><i class="material-icons">insert_drive_file</i> ${snp.val().archivosNombres[earchivos]}</a> <i class="material-icons">delete</i></div>`; 							
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
		ePosts.Archivos.splice(valor, valor);
		ePosts.ArchivosNombres.splice(valor, valor);
		$("[data-arc=efil"+valor+"]").remove();
	}
	

}

$("#epostSend").click(async function (e){

	ePosts.texto = $("#epostText").val();
	if (nimagen || nimagen.length > 0){
		for (let s = 0 ; s < nimagen.length ; s++){
			let nFoto = await cargarArchivos ("/imagenes/post/", nimagen[s]);
			nimagen= [];
			ePosts.imagenes.push(nFoto);
		}
	}

		if (nadjunto|| nadjunto.length > 0){
		for (let j = 0 ; j < nimagen.length ; j++){
			let nAdjunto = await cargarArchivos ("/archivos/post/", nadjunto[j]);
			nadjunto= [];
			ePosts.archivos.push(nAdjunto);
			ePosts.archivosNombres.push(nadjuntoNombres[j]);
		}
	}

	ePosts.textoColor=$("#epostText").attr("data-color");
	var  editarPost = base.ref().child("/posts/" + $("#editar").attr('data-id') );
	editarPost.update(ePosts);

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


