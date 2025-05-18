import { Component, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import { BoundedContext } from '../model/map.models';
import {MatButtonModule} from '@angular/material/button';
import {NgIf} from '@angular/common';

@Component({
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    NgIf
  ],
  selector: 'app-context-details-modal',
  template: `
    <h2 mat-dialog-title>{{ data.name }}</h2>
    <mat-dialog-content>
      <p><strong>Type:</strong> {{ data.type }}</p>
      <p><strong>Description:</strong> {{ data.description || '—' }}</p>
      <ng-container *ngIf="data.details">
        <p><strong>System:</strong> {{ data.details.systemName }}</p>
        <p><strong>Teams:</strong> {{ data.details.owningTeams?.join(', ') }}</p>
        <p><strong>Tech:</strong> {{ data.details.technologies?.join(', ') }}</p>
        <p><strong>Repo:</strong> <a [href]="data.details.repository" target="_blank">{{ data.details.repository }}</a></p>
      </ng-container>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Zamknij</button>
    </mat-dialog-actions>
  `,
})
export class ContextDetailsModalComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: BoundedContext) {}
}
