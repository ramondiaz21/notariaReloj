function inicializarFlatpickr() {
  flatpickr("#fecha-hora-reserva", {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
    minDate: "today", // Opcional: Evita que se seleccione una fecha anterior a hoy
    disable: reservasDeshabilitadas, // Deshabilitar las fechas y horas reservadas
    onChange: function (selectedDates, dateStr, instance) {
      // Al cambiar la fecha/hora seleccionada, actualizar la lista de fechas deshabilitadas
      actualizarFechasDeshabilitadas();
    },
  });
}

var db;
var reservasDeshabilitadas = [];

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

    // Inicializar flatpickr con las fechas y horas reservadas deshabilitadas
    inicializarFlatpickr();
  };

  // Manejar el evento de error
  request.onerror = function (event) {
    console.log("Error al abrir la base de datos: " + event.target.errorCode);
  };
};

function consultarTodasReservaciones() {
  var transaction = db.transaction(["reservaciones"], "readonly");
  var reservaStore = transaction.objectStore("reservaciones");

  var request = reservaStore.getAll();

  return new Promise(function (resolve, reject) {
    request.onsuccess = function (event) {
      var reservas = event.target.result;
      resolve(reservas);
    };

    request.onerror = function (event) {
      console.log("Error al consultar las reservaciones");
      reject([]);
    };
  });
}


function actualizarFechasDeshabilitadas() {
  // Consultar la base de datos para obtener las reservas existentes
  var reservas = consultarTodasReservaciones();

  // Reinicializar la lista de fechas deshabilitadas
  reservasDeshabilitadas = [];

  // Agregar las fechas y horas de las reservas a la lista de fechas deshabilitadas
  reservas.forEach(function (reserva) {
    reservasDeshabilitadas.push(reserva.fechaHora);
  });

  // Actualizar flatpickr con las fechas deshabilitadas
  flatpickr("#fecha-hora-reserva").set("disable", reservasDeshabilitadas);
}

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
      // Hay una reserva existente, mostrar una alerta al usuario
      alert("Esta fecha y hora ya están reservadas. Por favor, elige otra.");
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
