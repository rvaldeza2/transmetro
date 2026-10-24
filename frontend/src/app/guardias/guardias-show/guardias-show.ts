import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mensajeError } from '../../api';
import { Guardia } from '../guardia.model';
import { GuardiaService } from '../guardia.service';

@Component({
  selector: 'app-guardias-show',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './guardias-show.html',
})
export class GuardiasShow implements OnInit {
  private service = inject(GuardiaService);
  private snackBar = inject(MatSnackBar);

  id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));
  guardia = signal<Guardia | null>(null);

  ngOnInit() {
    this.cargar();
  }

  async cargar() {
    try {
      this.guardia.set(await this.service.get(this.id));
    } catch (error) {
      this.snackBar.open(mensajeError(error), 'Cerrar');
    }
  }
}
