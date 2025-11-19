import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthServ } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthServ);
  const router = inject(Router);
  const user = auth.activeUser();

  if (!user || !user.id) {
    router.navigate(['/login'], { queryParams: { redirectTo: '/quiz' } });
    return false;
  }

  return true;
};