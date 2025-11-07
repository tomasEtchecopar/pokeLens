import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthServ } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthServ);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;

  router.navigateByUrl('/login');
  return false;
};