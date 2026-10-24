export interface Piloto {
  id_piloto: number;
  nombre: string;
  historial_educativo: string | null;
  residencia: string | null;
  telefono: string | null;
  id_bus: number | null;
}

// Datos que se envían al crear o editar
export type PilotoDatos = Omit<Piloto, 'id_piloto'>;
