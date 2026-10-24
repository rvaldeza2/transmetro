import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { mensajeError } from '../../api';
import { Municipalidad } from '../../municipalidades/municipalidad.model';
import { MunicipalidadService } from '../../municipalidades/municipalidad.service';
import { AccesoDeEstacion, Estacion, LineaDeEstacion } from '../estacion.model';
import { EstacionService } from '../estacion.service';

@Component({
  selector: 'app-estaciones-show',
  imports: [RouterLink, MatCardModule, MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './estaciones-show.html',
})
export class EstacionesShow implements OnInit {
  private service = inject(EstacionService);
  private municipalidadService = inject(MunicipalidadService);
  private snackBar = inject(MatSnackBar);

  id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));
  estacion = signal<Estacion | null>(null);
  municipalidades = signal<Municipalidad[]>([]);
  lineas = signal<LineaDeEstacion[]>([]);
  accesos = signal<AccesoDeEstacion[]>([]);
  columnasLineas = ['nombre', 'orden'];
  columnasAccesos = ['nombre', 'guardias'];

  ngOnInit() {
    this.cargar();
  }

  async cargar() {
    try {
      const [estacion, municipalidades, lineas, accesos] = await Promise.all([
        this.service.get(this.id),
        this.municipalidadService.list(),
        this.service.lineas(this.id),
        this.service.accesos(this.id),
      ]);
      this.estacion.set(estacion);
      this.municipalidades.set(municipalidades);
      this.lineas.set(lineas);
      this.accesos.set(accesos);
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }

  nombreMunicipalidad(id: number) {
    return this.municipalidades().find((m) => m.id_municipalidad === id)?.nombre;
  }
}
