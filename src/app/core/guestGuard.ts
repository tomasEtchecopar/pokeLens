import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthServ } from './auth.service';

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthServ);
  const router = inject(Router);
  const user = auth.activeUser();

  if (user && user.id) {
    return router.createUrlTree(['/profile']); 
  }

  return true;
};
