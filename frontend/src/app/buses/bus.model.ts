export interface Bus {
  id_bus: number;
  placa: string;
  capacidad: number;
  id_linea: number | null;
  linea: string | null;
  id_parqueo: number;
  parqueo: string;
}

// Datos que se envían al crear (la línea es opcional, el parqueo obligatorio)
export type BusNuevo = Pick<Bus, 'placa' | 'capacidad' | 'id_parqueo' | 'id_linea'>;

// Datos que se envían al editar; línea y parqueo se cambian con sus propias operaciones
export type BusDatos = Pick<Bus, 'placa' | 'capacidad'>;

// Respuesta de la evaluación de espera adicional (RF13)
export interface EvaluacionEspera {
  placa: string;
  capacidad: number;
  pasajeros: number;
  porcentaje: number;
  espera_adicional_min: number;
  mensaje: string;
}
