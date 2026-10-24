export interface Parqueo {
  id_parqueo: number;
  ubicacion: string;
  id_estacion: number;
}

// Datos que se envían al crear o editar
export type ParqueoDatos = Omit<Parqueo, 'id_parqueo'>;
