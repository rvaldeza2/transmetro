export interface Linea {
  id_linea: number;
  nombre: string;
  distancia_total_km: number;
  id_municipalidad: number;
}

// Datos que se envían al crear o editar (la distancia total la calcula el backend)
export type LineaDatos = Pick<Linea, 'nombre' | 'id_municipalidad'>;

// Estación dentro del recorrido de una línea (RF01, RF11)
export interface LineaEstacion {
  orden_visita: number;
  id_estacion: number;
  nombre: string;
  distancia_siguiente_km: number | null;
  km_desde_inicio: number;
}

// Datos que se envían al agregar una estación a la línea
export type LineaEstacionDatos = Pick<LineaEstacion, 'id_estacion' | 'orden_visita' | 'distancia_siguiente_km'>;

// Datos que se envían al cambiar la distancia hacia la siguiente estación
export type DistanciaDatos = Pick<LineaEstacion, 'distancia_siguiente_km'>;

export interface LineaConEstaciones extends Linea {
  estaciones: LineaEstacion[];
}

// Acceso de una estación de la línea con sus guardias (RF07)
export interface AccesoLinea {
  orden_visita: number;
  estacion: string;
  id_acceso: number;
  acceso: string;
  num_guardias: number;
  guardias: string | null;
}

export interface BusLinea {
  id_bus: number;
  placa: string;
  capacidad: number;
  parqueo: string;
}

// Regla de buses por línea (RF05)
export interface ValidacionLinea {
  estaciones: number;
  buses: number;
  minimo: number;
  maximo: number;
  cumple: boolean;
}
