const reporte = require('../models/reporte.model');
const alerta = require('../models/alerta.model');
const { validarBuses } = require('./linea.service');

// RF15: reportes de estaciones, líneas y buses asignados a cada una

async function lineas() {
  const filas = await reporte.lineas();
  return filas.map((fila) => ({ ...fila, ...validarBuses(fila.estaciones, fila.buses) }));
}

const estaciones = () => reporte.estaciones();
const buses = () => reporte.buses();
const accesosPorLinea = () => reporte.accesosPorLinea();
const accesosSinGuardia = () => reporte.accesosSinGuardia();

// Panel de inicio: totales, líneas que no cumplen el rango de buses y últimas alertas
async function resumen() {
  const [totales, filasLineas, ultimasAlertas] = await Promise.all([
    reporte.resumen(),
    lineas(),
    alerta.findAll({ limite: 5 }),
  ]);
  return {
    ...totales,
    lineas_fuera_de_rango: filasLineas.filter((fila) => !fila.cumple).length,
    ultimas_alertas: ultimasAlertas,
  };
}

module.exports = { lineas, estaciones, buses, accesosPorLinea, accesosSinGuardia, resumen };
