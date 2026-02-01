import { Component, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
//import { AuthenticationService} from "../../features/iam/services/authentication.service";
import { Observable } from 'rxjs';

type UserRole = 'university_member' | 'administrator';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  // Estado del menú móvil
  isMobileMenuOpen = false;
  isAvatarMenuOpen = false;

  //user_role = this.authenticationService.currentUserRole as Observable<UserRole>;

  // Navegación del navbar
  navItems: Record<UserRole, { label: string; route: string }[]> = {
    university_member: [
      { label: 'Inicio', route: '/dashboard' },
      { label: 'Reservas', route: '/reservations' },
      { label: 'Historial', route: '/history' },
      { label: 'Perfil', route: '/profile' }
    ],
    administrator: [
      { label: 'Panel', route: '/admin/dashboard' },
      { label: 'Usuarios', route: '/admin/users-panel' },
      { label: 'Reportes', route: '/admin/reports' },
      { label: 'Configuración', route: '/admin/configuration' }
    ]
  };


  constructor(
    //private authenticationService: AuthenticationService,
    private router: Router,
    private el: ElementRef
  ) {  }




  // Metodo para manejar clics en navegación
  onNavClick(route: string) {
    // Aquí podrías agregar lógica adicional si es necesario
    console.log('Navegando a:', route);
  }

  toggleAvatarMenu(event?: MouseEvent) {
  event?.stopPropagation();
  this.isAvatarMenuOpen = !this.isAvatarMenuOpen;
  }

  closeAvatarMenu() {
    this.isAvatarMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.closeAvatarMenu();
    }
  }

  logout(){
    //this.authenticationService.logOut();
    this.router.navigate(['/login']).then();
    this.closeAvatarMenu();
  }

  // Toggle del menú móvil
  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  // Cerrar menú móvil
  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }
}
