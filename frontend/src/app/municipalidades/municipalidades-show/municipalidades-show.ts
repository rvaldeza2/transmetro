import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { mensajeError } from '../../api';
import { MunicipalidadReporte } from '../municipalidad.model';
import { MunicipalidadService } from '../municipalidad.service';

@Component({
  selector: 'app-municipalidades-show',
  imports: [RouterLink, MatCardModule, MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './municipalidades-show.html',
})
export class MunicipalidadesShow implements OnInit {
  private service = inject(MunicipalidadService);
  private snackBar = inject(MatSnackBar);

  id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));
  reporte = signal<MunicipalidadReporte | null>(null);
  columnasLineas = ['nombre', 'distancia', 'buses'];
  columnasEstaciones = ['nombre'];

  ngOnInit() {
    this.cargar();
  }

  async cargar() {
    try {
      this.reporte.set(await this.service.reporte(this.id));
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }
}
