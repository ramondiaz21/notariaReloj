document
  .getElementById("form-reserva")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    // Simulación de datos de reserva
    var reserva = {
      mesa: "Mesa 1",
      hora: obtenerHoraActual(), // Función ficticia para obtener la hora actual
      usuario: "Nombre Usuario",
    };

    // Descarga automática del respaldo
    descargarRespaldo(reserva);
  });

// Función para descargar un respaldo de la base de datos como un archivo JSON
function descargarRespaldo() {
  // Obtener la instancia de la base de datos
  var request = indexedDB.open("reservacionesDB", 1);

  // Manejar el evento de éxito
  request.onsuccess = function(event) {
    var db = event.target.result;
    
    // Obtener todas las reservaciones de la base de datos
    var transaction = db.transaction(["reservaciones"], "readonly");
    var reservaStore = transaction.objectStore("reservaciones");
    var request = reservaStore.getAll();

    request.onsuccess = function(event) {
      var reservaciones = event.target.result;

      // Convertir las reservaciones a formato JSON
      var jsonReservaciones = JSON.stringify(reservaciones, null, 2);

      // Crear un objeto Blob con el contenido JSON
      var blob = new Blob([jsonReservaciones], { type: "application/json" });

      // Crear un objeto URL para el Blob
      var url = window.URL.createObjectURL(blob);

      // Crear un elemento de enlace para descargar el archivo
      var a = document.createElement("a");
      a.href = url;
      a.download = "respaldo_reservaciones.json";

      // Simular un clic en el enlace para iniciar la descarga
      document.body.appendChild(a);
      a.click();

      // Limpiar el objeto URL
      window.URL.revokeObjectURL(url);
    };
  };
}

// Función para eliminar todas las reservaciones de la base de datos
function eliminarTodasLasReservaciones() {
  var transaction = db.transaction(["reservaciones"], "readwrite");
  var reservaStore = transaction.objectStore("reservaciones");

  var request = reservaStore.clear();

  request.onsuccess = function(event) {
    console.log("Todas las reservaciones eliminadas");
  };

  request.onerror = function(event) {
    console.error("Error al eliminar todas las reservaciones:", event.target.error);
  };
}

// Función para cargar el respaldo y sobrescribir la base de datos
function cargarRespaldo(blob) {
  var reader = new FileReader();

  reader.onload = function (event) {
    var respaldoCargado = event.target.result;
    console.log("Respaldo cargado:", respaldoCargado);

    // Eliminar todas las reservaciones existentes
    eliminarTodasLasReservaciones();

    // Convertir el contenido del respaldo a objetos JavaScript
    var reservaciones = JSON.parse(respaldoCargado);

    // Agregar las reservaciones del respaldo a la base de datos
    agregarReservaciones(reservaciones);
  };

  reader.readAsText(blob);
}

// Función para agregar las reservaciones del respaldo a la base de datos
function agregarReservaciones(reservaciones) {
  var transaction = db.transaction(["reservaciones"], "readwrite");
  var reservaStore = transaction.objectStore("reservaciones");

  reservaciones.forEach(function(reserva) {
    reservaStore.add(reserva);
  });

  transaction.oncomplete = function(event) {
    console.log("Reservaciones del respaldo agregadas exitosamente");
    // Mostrar las reservaciones del respaldo en el frontend si es necesario
    mostrarReservaciones(reservaciones);
  };

  transaction.onerror = function(event) {
    console.error("Error al agregar reservaciones del respaldo:", event.target.error);
  };
}


function obtenerHoraActual() {
  var ahora = new Date();
  var hora = ahora.getHours();
  var minutos = ahora.getMinutes();
  var segundos = ahora.getSeconds();

  // Asegurar que los números tengan dos dígitos
  hora = (hora < 10 ? "0" : "") + hora;
  minutos = (minutos < 10 ? "0" : "") + minutos;
  segundos = (segundos < 10 ? "0" : "") + segundos;

  return hora + ":" + minutos + ":" + segundos;
}

// Escuchar el evento click en el botón de cargar respaldo
document
  .getElementById("boton-cargar-respaldo")
  .addEventListener("click", function () {
    var inputArchivo = document.getElementById("input-archivo");

    // Verificar si se seleccionó un archivo
    if (
      inputArchivo.files.length === 0 ||
      !inputArchivo.files[0].name.endsWith(".json")
    ) {
      alert("Por favor, seleccione un archivo JSON.");
      return;
    }

    var archivo = inputArchivo.files[0];
    cargarRespaldo(archivo);
  });

function cargarRespaldo(blob) {
  var reader = new FileReader();

  reader.onload = function (event) {
    var respaldoCargado = event.target.result;
    console.log("Respaldo cargado:", respaldoCargado);

    try {
      // Intenta convertir el respaldo a un objeto o array JSON
      var reservaciones = JSON.parse(respaldoCargado);

      // Verifica si es un array
      if (Array.isArray(reservaciones)) {
        // Abre una transacción de lectura/escritura en la base de datos
        var transaction = db.transaction(["reservaciones"], "readwrite");
        var reservaStore = transaction.objectStore("reservaciones");

        // Borra todas las reservaciones existentes en la base de datos
        reservaStore.clear();

        // Agrega las reservaciones del respaldo a la base de datos
        reservaciones.forEach(function (reserva) {
          reservaStore.add(reserva);
        });

        console.log("Respaldo cargado y añadido a la base de datos.");
      } else {
        console.error("El respaldo no es un array.");
      }
    } catch (error) {
      console.error("Error al procesar el archivo JSON:", error);
    }
  };

  reader.readAsText(blob);
}

document
  .getElementById("input-archivo")
  .addEventListener("change", function (event) {
    var archivo = event.target.files[0];
    cargarRespaldo(archivo);
  });


 // dates.js

// Función para mostrar las reservaciones en el frontend
function mostrarReservaciones(reservaciones) {
  var reservacionesHtml = "<h2>Reservaciones</h2>";
  reservaciones.forEach(function(reserva) {
    reservacionesHtml += "<p>Mesa: " + reserva.mesa + ", Hora: " + reserva.hora + ", Usuario: " + reserva.usuario + "</p>";
  });
  document.getElementById("reservaciones-container").innerHTML = reservacionesHtml;
}
