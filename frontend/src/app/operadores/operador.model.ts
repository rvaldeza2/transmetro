export interface Operador {
  id_operador: number;
  nombre: string;
  id_estacion: number;
}

// Datos que se envían al crear o editar
export type OperadorDatos = Omit<Operador, 'id_operador'>;
