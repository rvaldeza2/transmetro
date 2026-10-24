export type TipoAlerta = 'SOBRECUPO' | 'ESPERA';

// Alerta guardada por las reglas de capacidad (RF12) y de espera (RF13)
export interface Alerta {
  id_alerta: number;
  tipo: TipoAlerta;
  id_estacion: number | null;
  estacion: string | null;
  id_bus: number | null;
  placa: string | null;
  pasajeros: number;
  porcentaje: number | null;
  mensaje: string;
  fecha_hora: string;
  atendida: boolean;
}

// Filtros opcionales del historial
export interface FiltroAlertas {
  tipo?: TipoAlerta;
  atendida?: boolean;
}
