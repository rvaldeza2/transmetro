export interface Municipalidad {
  id_municipalidad: number;
  nombre: string;
  direccion: string | null;
}

// Datos que se envían al crear o editar
export type MunicipalidadDatos = Omit<Municipalidad, 'id_municipalidad'>;

// RF10: línea de la municipalidad, con la cantidad de buses que la atienden
export interface LineaDeMunicipalidad {
  id_linea: number;
  nombre: string;
  distancia_total_km: number;
  buses: number;
}

export interface EstacionDeMunicipalidad {
  id_estacion: number;
  nombre: string;
}

// RF10: reporte de líneas, estaciones y buses de la municipalidad
export interface MunicipalidadReporte extends Municipalidad {
  total_buses: number;
  lineas: LineaDeMunicipalidad[];
  estaciones: EstacionDeMunicipalidad[];
}
