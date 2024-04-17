// Abrir o crear una base de datos
var request = indexedDB.open("reservacionesDB", 1);

// Manejar el evento de éxito
request.onsuccess = function (event) {
  var db = event.target.result;
  console.log("Base de datos abierta exitosamente");

  // Realizar operaciones en la base de datos, como agregar o consultar reservaciones
};

// Manejar el evento de error
request.onerror = function (event) {
  console.log("Error al abrir la base de datos: " + event.target.errorCode);
};

// Manejar el evento de actualización de la base de datos
request.onupgradeneeded = function (event) {
  var db = event.target.result;

  // Crear un almacén de objetos para las reservaciones
  var reservaStore = db.createObjectStore("reservaciones", {
    keyPath: "id",
    autoIncrement: true,
  });

  // Crear un índice para buscar reservaciones por hora
  reservaStore.createIndex("hora", "hora", { unique: false });

  console.log("Base de datos actualizada");
};

// Función para agregar una reservación
function agregarReservacion(db, mesa, hora, usuario) {
  var transaction = db.transaction(["reservaciones"], "readwrite");
  var reservaStore = transaction.objectStore("reservaciones");

  // Verificar si la mesa está disponible en la hora especificada
  var index = reservaStore.index("hora");
  var request = index.get(hora);

  request.onsuccess = function (event) {
    var existingReservation = event.target.result;
    if (!existingReservation || existingReservation.mesa !== mesa) {
      // La mesa está disponible, agregar la reservación
      reservaStore.add({ mesa: mesa, hora: hora, usuario: usuario });
      console.log("Reservación agregada exitosamente");
    } else {
      console.log("La mesa ya está reservada para esa hora");
    }
  };

  request.onerror = function (event) {
    console.log("Error al verificar la disponibilidad de la mesa");
  };
}

// Función para consultar reservaciones por hora
function consultarReservacionesPorHora(db, hora) {
  var transaction = db.transaction(["reservaciones"], "readonly");
  var reservaStore = transaction.objectStore("reservaciones");

  var index = reservaStore.index("hora");
  var request = index.getAll(hora);

  request.onsuccess = function (event) {
    var reservaciones = event.target.result;
    console.log("Reservaciones para la hora " + hora + ":", reservaciones);
  };

  request.onerror = function (event) {
    console.log("Error al consultar las reservaciones");
  };
}
