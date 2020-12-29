var permiteNotificaciones = false;

$(document).ready(function () {
  configurarTarea();
  solicitarPermisoNotificaciones();
});

/* *******************************************************************************************  */
/* **************************************NOTIFICACIONES***************************************  */
/* *******************************************************************************************  */ 

/**
 * Función para solicitar el permiso de notificaciones al usuario.
 */
function solicitarPermisoNotificaciones() {
  // Comprobar si el navegador soporta notificaciones
  if (!("Notification" in window)) {
    alert("El navegador no soporta notificaciones.");
  }
  else if (Notification.permission === 'granted') {
      permiteNotificaciones = true;
  }
  // Solicitar permisos al usuario si éste no los ha aceptado
  else if (Notification.permission !== 'granted') {
    Notification.requestPermission(function (permission) {
      permiteNotificaciones = true;
    });
  }
}

/**
 * Función para mostrar al usuario una notificación con el texto que se pasa por parámetro
 * @param {string} texto de la notificación
 */
function mostrarNotificacion(texto) {
   if (permiteNotificaciones) {
      var notification = new Notification(texto);
  }
}

/* *******************************************************************************************  */
/* *********************************FUNCIONES PRINCIPALES*************************************  */
/* *******************************************************************************************  */

/**
 * Función para configurar una tarea
 */
function configurarTarea() {
  //Mostrar formulario tarea
  ocultarTodo();
  mostrarComponente("form_tarea");
}

/**
 * Función para iniciar una tarea
 */
function iniciarTarea() {
  //Obtener datos de la tarea
  var nombreTarea = document.getElementById("tarea").value;
  var duracionTarea = document.getElementById("duracion_tarea").value;

  //Guardar en localStorage la tarea
  guardarTareaEnLocalStorage(nombreTarea, duracionTarea);

  //Mostrar solo tarea actual
  ocultarTodo();
  mostrarComponente("div_tarea_actual");

  //Actualizar nombre de la tarea
  document.getElementById("tarea_actual").innerHTML = nombreTarea;

  //Actualizar listado de tareas anteriores
  obtenerListadoTareasAnteriores();

  //Iniciar Worker contador
  iniciarWorkerContador("tarea_tiempo_restante", "configurar_descanso", duracionTarea);
}

/**
 * Función para configurar el descanso
 */
function configurarDescanso() {
  //Mostrar formulario descanso
  ocultarTodo();
  mostrarComponente("form_descanso");
}

/**
 * Función para iniciar el descanso
 */
function iniciarDescanso() {
  //Obtener datos del descanso
  var duracionDescanso = document.getElementById("duracion_descanso").value;

  //Mostrar tiempo restante del descanso
  ocultarTodo();
  mostrarComponente("div_descanso");

  //Iniciar Worker contador
  iniciarWorkerContador("descanso_tiempo_restante", "empezar_trabajo", duracionDescanso);
}

/* *******************************************************************************************  */
/* **********************************FUNCIONES AUXILIARES*************************************  */
/* *******************************************************************************************  */

/**
 * Función para ocultar todos los componentes
 */
function ocultarTodo() {
    //Resetear componentes
    resetearComponentes();

    //Ocultar todos los componentes
    document.getElementById("form_tarea").style.display = "none";
    document.getElementById("div_tarea_actual").style.display = "none";
    document.getElementById("form_descanso").style.display = "none";
    document.getElementById("div_descanso").style.display = "none";
}

/**
 * Función para mostrar el componente cuyo identificador se pasa por parametro
 * @param {string} element identificador del elemento que se desea visualizar
 */
function mostrarComponente(element) {
    document.getElementById(element).style.display = "block";
}

/**
 * Función para resetear los componentes
 */
function resetearComponentes() {
    //Tarea
    document.getElementById("tarea").value = "";
    document.getElementById("duracion_tarea").value = 25;
    cambiarTextoDuracion('duracion_tarea_minutos', 25)
    habilitarBtnIniciarTarea()

    //Listado tareas anteriores
    document.getElementById("tareas_anteriores").innerHTML = "";

    //Descanso
    document.getElementById("duracion_descanso").value = 5;
    document.getElementById("configurar_descanso").disabled = true;
    document.getElementById("empezar_trabajo").disabled = true;
}

/**
 * Función para habilitar/deshabilitar el botón de iniciar tarea
 */
function habilitarBtnIniciarTarea() {
    var tarea = document.getElementById("tarea").value;
    document.getElementById("iniciar_tarea").disabled = tarea == null || tarea == "" ? true : false;
}

/**
 * Función para cambiar el texto de la duración tanto de una tarea como de un descanso
 * @param {string} element identificador del elemento donde se desea poner el texto
 * @param {int} val duracion en minutos
 */
function cambiarTextoDuracion(element, val) {
    document.getElementById(element).innerHTML = val + (val==1 ? " minuto" : " minutos");
}

/**
 * Función que devuelve el valor que se pasa por parámetro como String, en caso de que value<10 entonces se le añade un 0 al inicio
 * @param {int} value 
 */
function configurarValorMenorDiez(value) {
    if (value < 10) 
        return "0" + value;
    return value;
}

/* *******************************************************************************************  */
/* **************************************LOCAL STORAGE****************************************  */
/* *******************************************************************************************  */

/**
 * Función para almacenar en localStorage la tarea cuyo nombre y duracion se pasa por parámetro
 * @param {string} nombre 
 * @param {int} duracion 
 */
function guardarTareaEnLocalStorage(nombre, duracion) {
    //La clave es el nombre, el valor es "nombre: duracion fecha"
    var fechaActual = new Date(); 
    var fecha = configurarValorMenorDiez(fechaActual.getDate()) + "/" + configurarValorMenorDiez(fechaActual.getMonth() + 1)  + "/" + fechaActual.getFullYear() + " @ "  
                    + configurarValorMenorDiez(fechaActual.getHours()) + ":" + configurarValorMenorDiez(fechaActual.getMinutes()) + ":" + configurarValorMenorDiez(fechaActual.getSeconds());
    var valor = nombre + ": " + duracion + (duracion==1 ? " minuto" : " minutos") + " " + fecha;
    localStorage.setItem('Tarea:' + nombre, valor);
}

/**
 * Función para obtener ell listado de tareas anteriores
 */
function obtenerListadoTareasAnteriores() {
    var diccionario = {};
    var listado = [];
    //Obtener valores guardados en localStorage
    for (var i in localStorage) {
        if (i.indexOf("Tarea:")!=-1) {
            //Guardar en el diccionario la tarea
            diccionario[i] = localStorage.getItem(i);
            //Guardar en el listado la hora de inicio de la tarea
            var horaInicio = localStorage.getItem(i).split("@")[1].trim();
            listado.push({key: i, value: horaInicio});
        }
    }
  
    //Ordenar listado por hora de inicio (menor a mayor)
    listado.sort((a, b) => {
        if (a.value > b.value) {
            return 1;
          }
          if (a.value < b.value) {
            return -1;
          }
          return 0;
    });

    //Visualizar el listado
    listado.forEach(element => {
        anadirTareaAnterior(diccionario[element.key]);
    });
}

/**
 * Función para añadir el texto que se pasa por parámetero al listado de tareas anteriores.
 * @param {string} texto datos de la tarea guardados en el localStorage
 */
function anadirTareaAnterior(texto) {
    $("#tareas_anteriores").append('<li>' + texto + '</li>');
}

/* *******************************************************************************************  */
/* **************************************WORKER CONTADOR**************************************  */
/* *******************************************************************************************  */

/**
 * Función para iniciar un Worker contador
 * @param {string} element identificador del elemento donde se desea poner el texto del contador
 * @param {string} btn identificador del botón que se debe habilitar una vez el contador finalice
 * @param {int} maxTime tiempo máximo del contador
 */
function iniciarWorkerContador(element, btn, maxTime) {
  if (typeof Worker !== undefined) {
    counterWorker = new Worker("contador.js");
    nombreContador = element;
    botonFinContador = btn;
    counterWorker.onmessage = actualizarContador;
    counterWorker.postMessage(maxTime);
  } else {
    window.alert("Este navegador no soporta workers");
  }
}

/**
 * Función para actualizar el texto del contador
 * @param {string} e texto que devuelve el Worker
 */
function actualizarContador(e) {
  document.getElementById(nombreContador).innerHTML = e.data;

  //El worker finaliza cuando envía "00:00", entonces se habilita el botón correspondiente
  if (e.data === "00:00") {
    document.getElementById(botonFinContador).disabled = false;
    mostrarNotificacion("Se acabó el tiempo.");
  }
}
