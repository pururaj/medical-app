import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonItem, IonInput, IonButton, IonSpinner, IonIcon, IonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { medkitOutline, lockClosedOutline, personOutline } from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonCard, IonCardContent, IonCardHeader, IonCardTitle,
    IonItem, IonInput, IonButton, IonSpinner, IonIcon, IonText,
    ReactiveFormsModule,
  ]
})
export class LoginPage implements OnInit {
  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {
    addIcons({ medkitOutline, lockClosedOutline, personOutline });
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']);
    }
  }

  async onLogin() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { username, password } = this.form.value;

    this.authService.login(username, password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/home']);
      },
      error: () => {
        this.loading = false;
        this.toastService.showError('Invalid username or password');
      }
    });
  }
}
