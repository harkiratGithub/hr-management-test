import { Injectable, Type } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';

@Injectable({ providedIn: 'root' })
export class DynamicDialogService {
	constructor(private dialog: MatDialog) {}

	open<T, D = unknown, R = unknown>(
		component: Type<T>,
		config: MatDialogConfig<D> = {}
	): MatDialogRef<T, R> {
		return this.dialog.open(component, {
			width: '480px',
			disableClose: true,
			autoFocus: 'first-tabbable',
			...config,
		});
	}
}


