const estacion = require('../models/estacion.model');
const alertaService = require('./alerta.service');
const { createCrudService, requireNonNegativeInt, round2 } = require('./base.service');

const UMBRAL_SOBRECUPO = 150;

const crud = createCrudService(estacion, {
  notFound: 'Estación no encontrada',
  required: ['nombre', 'id_municipalidad'],
});

async function getLineas(id) {
  await crud.get(id);
  return estacion.findLineas(id);
}

async function getAccesos(id) {
  await crud.get(id);
  return estacion.findAccesos(id);
}

// RF12: alerta cuando los pasajeros en la estación alcanzan el 150% de la
// capacidad de las unidades que la atienden (diagrama de secuencia 11.2)
async function evaluarCapacidad(id, data) {
  const pasajeros = requireNonNegativeInt(data.pasajeros, 'pasajeros');
  const datos = await crud.get(id);
  const { unidades, capacidad_total: capacidadTotal } = await estacion.capacidadUnidades(id);

  let resultado;
  if (capacidadTotal === 0) {
    resultado = {
      id_estacion: datos.id_estacion,
      estacion: datos.nombre,
      pasajeros,
      unidades,
      capacidad_total: 0,
      porcentaje: null,
      alerta: pasajeros > 0,
      mensaje: 'La estación no tiene unidades asignadas: solicitar envío de un bus',
    };
  } else {
    const porcentaje = round2((pasajeros * 100) / capacidadTotal);
    const alerta = porcentaje >= UMBRAL_SOBRECUPO;
    resultado = {
      id_estacion: datos.id_estacion,
      estacion: datos.nombre,
      pasajeros,
      unidades,
      capacidad_total: capacidadTotal,
      porcentaje,
      alerta,
      mensaje: alerta
        ? `Sobrecupo de ${porcentaje}%: solicitar envío de un bus adicional`
        : 'Capacidad dentro del rango normal',
    };
  }

  // Cada alerta queda guardada en el historial para darle seguimiento.
  // Antes solo se mostraba en pantalla y se perdía al recargar, por eso se agregó la tabla alerta.
  if (resultado.alerta) {
    await alertaService.registrar({
      tipo: alertaService.TIPOS.SOBRECUPO,
      id_estacion: datos.id_estacion,
      pasajeros,
      porcentaje: resultado.porcentaje,
      mensaje: resultado.mensaje,
    });
  }
  return resultado;
}

module.exports = { ...crud, getLineas, getAccesos, evaluarCapacidad };
