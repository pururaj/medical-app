import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonButton, IonIcon, IonCard, IonCardContent, IonItem, IonLabel,
  IonInput, IonSelect, IonSelectOption, IonSpinner, IonText, IonBadge,
  IonModal, IonFab, IonFabButton, IonChip, IonNote,
  AlertController, ToastController, ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline, personOutline, trashOutline, peopleOutline,
  closeOutline, heartOutline, checkmarkCircleOutline, callOutline
} from 'ionicons/icons';
import { PatientService, PatientDto, FamilyMemberDto, AddFamilyMemberRequest, Relationship } from '../../../../core/services/patient.service';

@Component({
  selector: 'app-family-members',
  templateUrl: 'family-members.page.html',
  styleUrls: ['family-members.page.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonButton, IonIcon, IonCard, IonCardContent, IonItem, IonLabel,
    IonInput, IonSelect, IonSelectOption, IonSpinner, IonText, IonBadge,
    IonModal, IonFab, IonFabButton, IonChip, IonNote
  ]
})
export class FamilyMembersPage implements OnInit {
  patientId!: number;
  primaryPatient?: PatientDto;
  members: FamilyMemberDto[] = [];
  loading = false;

  // Add member modal
  showModal = false;
  addMode: 'new' | 'existing' = 'new';
  addForm!: FormGroup;
  savingMember = false;

  // Existing patient search
  existingPatientId = '';

  readonly relationships: Relationship[] = [
    'SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'GRANDPARENT', 'GRANDCHILD', 'OTHER'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService,
    private fb: FormBuilder,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {
    addIcons({
      addOutline, personOutline, trashOutline, peopleOutline,
      closeOutline, heartOutline, checkmarkCircleOutline, callOutline
    });
  }

  ngOnInit() {
    this.patientId = Number(this.route.snapshot.paramMap.get('id'));
    this.buildForm();
    this.loadPrimaryPatient();
    this.loadMembers();
  }

  buildForm() {
    this.addForm = this.fb.group({
      // for 'new' mode
      firstName:   ['', [Validators.required, Validators.maxLength(100)]],
      lastName:    ['', [Validators.required, Validators.maxLength(100)]],
      email:       ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{10,20}$/)]],
      dateOfBirth: ['', Validators.required],
      gender:      ['', Validators.required],
      // common
      relationship:['', Validators.required]
    });
  }

  loadPrimaryPatient() {
    this.patientService.getPatientById(this.patientId).subscribe({
      next: (res) => { this.primaryPatient = res.data; },
      error: () => {}
    });
  }

  loadMembers() {
    this.loading = true;
    this.patientService.getFamilyMembers(this.patientId).subscribe({
      next: (res) => { this.members = res.data ?? []; this.loading = false; },
      error: () => { this.members = []; this.loading = false; }
    });
  }

  openModal(mode: 'new' | 'existing') {
    this.addMode = mode;
    this.addForm.reset();
    this.existingPatientId = '';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  switchMode(mode: 'new' | 'existing') {
    this.addMode = mode;
    this.addForm.reset();
  }

  async saveMember() {
    this.addForm.get('relationship')?.markAsTouched();
    const rel = this.addForm.get('relationship')?.value;
    if (!rel) {
      this.showToast('Please select a relationship.', 'warning');
      return;
    }

    if (this.addMode === 'existing') {
      const memberId = Number(this.existingPatientId);
      if (!memberId) {
        this.showToast('Please enter a valid Patient ID.', 'warning');
        return;
      }
      this.doAddMember({ memberPatientId: memberId, relationship: rel });
    } else {
      this.addForm.markAllAsTouched();
      const required = ['firstName','lastName','email','phoneNumber','dateOfBirth','gender'];
      const invalid = required.some(f => this.addForm.get(f)?.invalid);
      if (invalid) {
        this.showToast('Please fill in all required fields correctly.', 'warning');
        return;
      }
      const { relationship, ...patientFields } = this.addForm.value;
      const req: AddFamilyMemberRequest = {
        newMember: patientFields as PatientDto,
        relationship: rel
      };
      this.doAddMember(req);
    }
  }

  private doAddMember(request: AddFamilyMemberRequest) {
    this.savingMember = true;
    this.patientService.addFamilyMember(this.patientId, request).subscribe({
      next: async (res) => {
        this.members.push(res.data);
        this.savingMember = false;
        this.showModal = false;
        this.showToast('Family member added successfully!', 'success');
      },
      error: async (err) => {
        this.savingMember = false;
        const msg = err?.error?.message ?? 'Failed to add family member.';
        this.showToast(msg, 'danger');
      }
    });
  }

  async confirmRemove(member: FamilyMemberDto) {
    const name = `${member.memberPatient?.firstName} ${member.memberPatient?.lastName}`;
    const alert = await this.alertCtrl.create({
      header: 'Remove Family Member?',
      message: `Remove ${name} from the family? The patient record will not be deleted.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Remove', role: 'destructive', handler: () => this.removeMember(member) }
      ]
    });
    await alert.present();
  }

  private removeMember(member: FamilyMemberDto) {
    const memberId = member.memberPatient?.id;
    if (!memberId) return;
    this.patientService.removeFamilyMember(this.patientId, memberId).subscribe({
      next: async () => {
        this.members = this.members.filter(m => m.id !== member.id);
        this.showToast('Family member removed.', 'success');
      },
      error: async () => { this.showToast('Failed to remove family member.', 'danger'); }
    });
  }

  viewMember(member: FamilyMemberDto) {
    if (member.memberPatient?.id) {
      this.router.navigate(['/patients', member.memberPatient.id]);
    }
  }

  getAge(dob?: string): number {
    if (!dob) return 0;
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    if (today.getMonth() < birth.getMonth() ||
        (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
    return age;
  }

  getInitials(p?: PatientDto): string {
    if (!p) return '?';
    return `${p.firstName[0]}${p.lastName[0]}`.toUpperCase();
  }

  relationLabel(r: Relationship): string {
    const map: Record<Relationship, string> = {
      SPOUSE: 'Spouse', CHILD: 'Child', PARENT: 'Parent',
      SIBLING: 'Sibling', GRANDPARENT: 'Grandparent',
      GRANDCHILD: 'Grandchild', OTHER: 'Other'
    };
    return map[r] ?? r;
  }

  hasError(field: string, error: string) {
    const c = this.addForm.get(field);
    return c?.touched && c?.hasError(error);
  }

  private async showToast(message: string, color: string) {
    const t = await this.toastCtrl.create({ message, duration: 2500, color, position: 'top' });
    await t.present();
  }
}
