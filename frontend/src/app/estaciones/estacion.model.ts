export interface Estacion {
  id_estacion: number;
  nombre: string;
  id_municipalidad: number;
}

// Datos que se envían al crear o editar
export type EstacionDatos = Omit<Estacion, 'id_estacion'>;

// Respuesta de la evaluación de capacidad (RF12)
export interface EvaluacionCapacidad {
  estacion: string;
  pasajeros: number;
  unidades: number;
  capacidad_total: number;
  porcentaje: number | null;
  alerta: boolean;
  mensaje: string;
}

// RF02: línea que pasa por la estación, con el orden en que la visita
export interface LineaDeEstacion {
  id_linea: number;
  nombre: string;
  orden_visita: number;
}

// Acceso de la estación, con la cantidad de guardias que lo cubren
export interface AccesoDeEstacion {
  id_acceso: number;
  nombre: string;
  num_guardias: number;
}
