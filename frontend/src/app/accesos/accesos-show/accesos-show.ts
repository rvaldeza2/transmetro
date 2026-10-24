import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { mensajeError } from '../../api';
import { Estacion } from '../../estaciones/estacion.model';
import { EstacionService } from '../../estaciones/estacion.service';
import { Acceso } from '../acceso.model';
import { AccesoService } from '../acceso.service';

@Component({
  selector: 'app-accesos-show',
  imports: [RouterLink, MatCardModule, MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './accesos-show.html',
})
export class AccesosShow implements OnInit {
  private service = inject(AccesoService);
  private estacionService = inject(EstacionService);
  private snackBar = inject(MatSnackBar);

  id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));
  acceso = signal<Acceso | null>(null);
  estaciones = signal<Estacion[]>([]);
  columnasGuardias = ['nombre', 'turno', 'fecha'];

  ngOnInit() {
    this.cargar();
  }

  async cargar() {
    try {
      const [acceso, estaciones] = await Promise.all([this.service.get(this.id), this.estacionService.list()]);
      this.acceso.set(acceso);
      this.estaciones.set(estaciones);
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }

  nombreEstacion(id: number) {
    return this.estaciones().find((e) => e.id_estacion === id)?.nombre;
  }
}
