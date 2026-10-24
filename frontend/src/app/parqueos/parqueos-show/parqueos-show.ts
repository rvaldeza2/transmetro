import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mensajeError } from '../../api';
import { Estacion } from '../../estaciones/estacion.model';
import { EstacionService } from '../../estaciones/estacion.service';
import { Parqueo } from '../parqueo.model';
import { ParqueoService } from '../parqueo.service';

@Component({
  selector: 'app-parqueos-show',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './parqueos-show.html',
})
export class ParqueosShow implements OnInit {
  private service = inject(ParqueoService);
  private estacionService = inject(EstacionService);
  private snackBar = inject(MatSnackBar);

  id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));
  parqueo = signal<Parqueo | null>(null);
  estaciones = signal<Estacion[]>([]);

  ngOnInit() {
    this.cargar();
  }

  async cargar() {
    try {
      const [parqueo, estaciones] = await Promise.all([this.service.get(this.id), this.estacionService.list()]);
      this.parqueo.set(parqueo);
      this.estaciones.set(estaciones);
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }

  nombreEstacion(id: number) {
    return this.estaciones().find((e) => e.id_estacion === id)?.nombre;
  }
}
