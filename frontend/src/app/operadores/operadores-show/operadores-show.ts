import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mensajeError } from '../../api';
import { Estacion } from '../../estaciones/estacion.model';
import { EstacionService } from '../../estaciones/estacion.service';
import { Operador } from '../operador.model';
import { OperadorService } from '../operador.service';

@Component({
  selector: 'app-operadores-show',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './operadores-show.html',
})
export class OperadoresShow implements OnInit {
  private service = inject(OperadorService);
  private estacionService = inject(EstacionService);
  private snackBar = inject(MatSnackBar);

  id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));
  operador = signal<Operador | null>(null);
  estaciones = signal<Estacion[]>([]);

  ngOnInit() {
    this.cargar();
  }

  async cargar() {
    try {
      const [operador, estaciones] = await Promise.all([this.service.get(this.id), this.estacionService.list()]);
      this.operador.set(operador);
      this.estaciones.set(estaciones);
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }

  nombreEstacion(id: number) {
    return this.estaciones().find((e) => e.id_estacion === id)?.nombre;
  }
}
