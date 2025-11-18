import { Injectable, OnDestroy, inject } from '@angular/core';
import { fromEvent, merge, Subscription, timer } from 'rxjs';
import { debounceTime, startWith } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class IdleService implements OnDestroy {
	private readonly auth = inject(AuthService);
	private activitySub?: Subscription;
	private idleTimerSub?: Subscription;

	// 15 minutes default inactivity timeout
	private readonly timeoutMs = 15 * 60 * 1000;

	constructor() {
		this.start();
	}

	private start(): void {
		const activity$ = merge(
			fromEvent(document, 'mousemove'),
			fromEvent(document, 'keydown'),
			fromEvent(document, 'click'),
			fromEvent(document, 'scroll'),
			fromEvent(document, 'touchstart')
		).pipe(debounceTime(300), startWith(null));

		this.activitySub = activity$.subscribe(() => this.resetTimer());
		this.resetTimer();
	}

	private resetTimer(): void {
		this.idleTimerSub?.unsubscribe();
		this.idleTimerSub = timer(this.timeoutMs).subscribe(() => {
			if (this.auth.isLoggedIn()) {
				this.auth.logout();
				// Optional: show a simple browser alert as feedback
				try {
					alert('You have been logged out due to inactivity.');
				} catch {}
			}
		});
	}

	ngOnDestroy(): void {
		this.activitySub?.unsubscribe();
		this.idleTimerSub?.unsubscribe();
	}
}


