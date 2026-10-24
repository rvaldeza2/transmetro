export interface GuardiaAsignado {
  id_guardia: number;
  nombre: string;
  turno: string | null;
  fecha_asignacion: string;
}

export interface Acceso {
  id_acceso: number;
  nombre: string;
  id_estacion: number;
  guardias?: GuardiaAsignado[];
}

// Datos que se envían al editar
export type AccesoDatos = Pick<Acceso, 'nombre' | 'id_estacion'>;

// Al crear, el acceso se registra junto con su primer guardia (RF09)
export interface AccesoNuevo extends AccesoDatos {
  id_guardia: number;
}
