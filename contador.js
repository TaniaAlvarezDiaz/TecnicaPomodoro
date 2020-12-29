self.onmessage = function (e) {
  minutos = e.data;
  segundos = 0;
  iniciarContador();
};

/**
 * Función para iniciar el contador
 */
function iniciarContador() {
  //Se envía el tiempo actual
  postMessage(obtenerTiempoTexto());

  //Configurar minutos y segundos
  if (segundos == 0) {
    minutos -= 1;
    segundos = 59;
  } else {
    segundos -= 1;
  }

  //El Worker finaliza (deja de enviar datos) cuando se llegue a un tiempo "00:00"
  if (tiempoTexto !== "00:00") {
    setTimeout("iniciarContador()", 1000);
  }
}

/**
 * Función para obtener el tiempo restante en forma de texto
 */
function obtenerTiempoTexto() {
  if (minutos < 10) {
    min = "0" + minutos;
  } else {
    min = minutos;
  }
  if (segundos < 10) {
    seg = "0" + segundos;
  } else {
    seg = segundos;
  }
  return (tiempoTexto = min + ":" + seg);
}
