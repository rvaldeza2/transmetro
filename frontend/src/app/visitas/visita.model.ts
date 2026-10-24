// Visita de un bus a una estación de su línea durante el recorrido
export interface Visita {
  id_visita: number;
  id_bus: number;
  placa: string;
  id_linea: number | null;
  linea: string | null;
  id_estacion: number;
  estacion: string;
  orden_visita: number | null;
  fecha_hora: string;
  pasajeros: number;
  capacidad: number;
  porcentaje: number;
  espera_adicional_min: number;
}

// Datos que se envían al registrar la llegada del bus a la estación
export type VisitaDatos = Pick<Visita, 'id_bus' | 'id_estacion' | 'pasajeros'>;

// Filtros opcionales del listado
export interface FiltroVisitas {
  id_bus?: number;
  fecha?: string;
}
