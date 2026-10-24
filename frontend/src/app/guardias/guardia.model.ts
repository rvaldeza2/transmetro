export interface Guardia {
  id_guardia: number;
  nombre: string;
  turno: string | null;
}

// Datos que se envían al crear o editar
export type GuardiaDatos = Omit<Guardia, 'id_guardia'>;
