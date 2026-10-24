import { Alerta } from '../alertas/alerta.model';

export interface ReporteLinea {
  id_linea: number;
  linea: string;
  municipalidad: string;
  distancia_total_km: number;
  estaciones: number;
  buses: number;
  minimo: number;
  maximo: number;
  cumple: boolean;
}

export interface ReporteEstacion {
  id_estacion: number;
  estacion: string;
  municipalidad: string;
  lineas: string | null;
  accesos: number;
  accesos_sin_guardia: number;
  guardias: number;
  operadores: number;
  parqueos: number;
  buses_que_la_atienden: number;
}

export interface ReporteBus {
  id_bus: number;
  placa: string;
  capacidad: number;
  linea: string | null;
  parqueo: string;
  estacion_parqueo: string;
  pilotos: string | null;
}

// RF07: accesos de cada línea en el orden de recorrido
export interface ReporteAccesoLinea {
  id_linea: number;
  linea: string;
  orden_visita: number;
  estacion: string;
  id_acceso: number;
  acceso: string;
  num_guardias: number;
}

// Accesos que incumplen la regla de al menos un guardia por acceso
export interface ReporteAccesoSinGuardia {
  id_acceso: number;
  acceso: string;
  id_estacion: number;
  estacion: string;
  municipalidad: string;
}

// Totales del panel de inicio
export interface Resumen {
  municipalidades: number;
  lineas: number;
  estaciones: number;
  accesos: number;
  buses: number;
  buses_sin_linea: number;
  pilotos: number;
  guardias: number;
  accesos_sin_guardia: number;
  visitas_hoy: number;
  alertas_hoy: number;
  alertas_pendientes: number;
  lineas_fuera_de_rango: number;
  ultimas_alertas: Alerta[];
}
