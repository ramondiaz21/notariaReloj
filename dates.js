// Función para inicializar Flatpickr en el campo de selección de hora
flatpickr("#fecha-hora-reserva", {
  enableTime: true,
  dateFormat: "Y-m-d H:i",
  minDate: "today", // Opcional: Evita que se seleccione una fecha anterior a hoy
});

var db;

// Llamar a la función para abrir la base de datos y mostrar todas las reservaciones al cargar la página
window.onload = function () {
  // Obtener la instancia de la base de datos
  var request = indexedDB.open("reservacionesDB", 1);

  // Manejar el evento de éxito
  request.onsuccess = function (event) {
    db = event.target.result; // Asignar la referencia de la base de datos a la variable db
    console.log("Base de datos abierta exitosamente");

    // Mostrar todas las reservaciones por día
    mostrarTodasReservaciones();

    console.log("Contenido de la base de datos:", db);
  };

  // Manejar el evento de error
  request.onerror = function (event) {
    console.log("Error al abrir la base de datos: " + event.target.errorCode);
  };
};

document
  .getElementById("form-reserva")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    var fechaHora = document.getElementById("fecha-hora-reserva").value;
    var mesa = document.getElementById("mesa-reserva").value;
    var usuario = document.getElementById("usuario-reserva").value;

    // Agregar o actualizar la reservación utilizando la función actualizada
    agregarOActualizarReservacion(db, mesa, fechaHora, usuario);
  });

function agregarOActualizarReservacion(db, mesa, fechaHora, usuario) {
  var transaction = db.transaction(["reservaciones"], "readwrite");
  var reservaStore = transaction.objectStore("reservaciones");

  // Verificar si hay una reserva existente para la misma mesa y hora
  var request = reservaStore.get(fechaHora + "-" + mesa);

  request.onsuccess = function (event) {
    var existingReservation = event.target.result;
    if (!existingReservation) {
      // No hay una reserva existente, agregar una nueva
      reservaStore.add({
        id: fechaHora + "-" + mesa,
        mesa: mesa,
        fechaHora: fechaHora,
        usuario: usuario,
      });
      console.log("Reservación agregada exitosamente");
    } else {
      // Hay una reserva existente, actualizarla
      existingReservation.usuario = usuario;
      reservaStore.put(existingReservation);
      console.log("Reservación actualizada exitosamente");
    }

    // Mostrar todas las reservaciones después de agregar o actualizar
    mostrarTodasReservaciones();
  };

  request.onerror = function (event) {
    console.log("Error al agregar o actualizar la reservación");
  };
}

function mostrarTodasReservaciones() {
  var transaction = db.transaction(["reservaciones"], "readonly");
  var reservaStore = transaction.objectStore("reservaciones");

  var request = reservaStore.getAll();

  request.onsuccess = function (event) {
    var reservaciones = event.target.result;

    // Mostrar todas las reservaciones
    var reservacionesHtml = "";
    reservaciones.forEach(function (reserva) {
      reservacionesHtml +=
        "<p>Mesa: " +
        reserva.mesa +
        ", Fecha y hora: " +
        reserva.fechaHora +
        ", Usuario: " +
        reserva.usuario +
        "</p>";
    });
    document.getElementById("reservaciones-por-dia").innerHTML =
      reservacionesHtml;
  };

  request.onerror = function (event) {
    console.log("Error al consultar las reservaciones");
  };
}

var flatpickrInstance = flatpickr("#hora-reserva", {
  enableTime: true,
  noCalendar: true,
  dateFormat: "H:i",
});

