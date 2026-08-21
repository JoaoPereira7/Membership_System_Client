import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { NgxMaskDirective } from 'ngx-mask';
import { finalize } from 'rxjs';
import { getApiErrorMessage } from '../../../../core/api/api.models';
import { AppDatePickerComponent } from '../../../../core/components/date-picker/date-picker.component';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { cpfValidator } from '../../../../core/validators/cpf.validator';
import { nonBlankValidator } from '../../../../core/validators/non-blank.validator';
import {
  ChurchDepartmentLookup, CompleteMember, LookupItem, MemberAddress, MemberDepartment,
  MemberPhone, MembershipRole, ProfessionalInformation,
} from '../../Models/member.models';
import { MemberService } from '../../Services/member.service';
import { MemberDialogData, MemberDialogResult } from './member-dialog.types';

const requiredText = [Validators.required, nonBlankValidator()];
const today = (): string => new Date().toISOString().slice(0, 10);
const nullable = (value: string): string | null => value.trim() || null;

@Component({
  selector: 'app-member-dialog',
  imports: [
    ReactiveFormsModule, AppDatePickerComponent, MatButtonModule, MatCardModule, MatCheckboxModule, MatDialogModule,
    MatFormFieldModule, MatIconModule, MatInputModule, MatProgressSpinnerModule, MatSelectModule, MatStepperModule,
    NgxMaskDirective,
  ],
  templateUrl: './member-dialog.component.html',
  styleUrl: './member-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemberDialogComponent {
  private readonly service = inject(MemberService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly notification = inject(NotificationService);
  private readonly data = inject<MemberDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef =
    inject<MatDialogRef<MemberDialogComponent, MemberDialogResult>>(MatDialogRef);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly memberId = this.data.mode === 'edit' ? this.data.memberId : null;
  protected readonly editing = this.data.mode === 'edit';
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly lookups = signal<Record<string, readonly LookupItem[]>>({});
  protected readonly churchDepartments = signal<readonly ChurchDepartmentLookup[]>([]);
  protected readonly maxDate = today();
  protected readonly states = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

  protected readonly generalForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [...requiredText, Validators.maxLength(200)] }),
    cpf: new FormControl('', { nonNullable: true, validators: [Validators.required, cpfValidator()] }),
    rg: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(20)] }),
    birthDate: new FormControl<string | null>(null),
    genderId: new FormControl<string | null>(null),
    maritalStatusId: new FormControl<string | null>(null),
    nationality: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(100)] }),
    motherName: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(200)] }),
    fatherName: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(200)] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.email, Validators.maxLength(200)] }),
    isActive: new FormControl(true, { nonNullable: true }),
  });
  protected readonly contactForm = new FormGroup({
    phones: new FormArray<FormGroup>([]),
    addresses: new FormArray<FormGroup>([]),
  });
  protected readonly professionalForm = new FormGroup({
    educationLevelId: new FormControl<string | null>(null),
    formationAreaId: new FormControl<string | null>(null),
    professionId: new FormControl<string | null>(null),
  });
  protected readonly membershipForm = new FormGroup({
    id: new FormControl<string | null>(null),
    churchId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    dateJoinedChurch: new FormControl(today(), { nonNullable: true, validators: [Validators.required] }),
    membershipStatusId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    religiousOriginId: new FormControl<string | null>(null),
    pastorId: new FormControl<string | null>(null),
    isActive: new FormControl(true, { nonNullable: true }),
  });
  protected readonly rolesForm = new FormGroup({ roles: new FormArray<FormGroup>([]) });
  protected readonly departmentsForm = new FormGroup({ departments: new FormArray<FormGroup>([]) });
  private previousChurchId = '';
  protected get phones(): FormArray<FormGroup> { return this.contactForm.controls.phones; }
  protected get addresses(): FormArray<FormGroup> { return this.contactForm.controls.addresses; }
  protected get roles(): FormArray<FormGroup> { return this.rolesForm.controls.roles; }
  protected get departments(): FormArray<FormGroup> { return this.departmentsForm.controls.departments; }
  protected get availableChurchDepartments(): readonly ChurchDepartmentLookup[] {
    return this.churchDepartments().filter(x => x.churchId === this.membershipForm.controls.churchId.value);
  }

  constructor() {
    this.dialogRef.disableClose = true;
    this.dialogRef.backdropClick().pipe(takeUntilDestroyed()).subscribe(() => this.cancel());
    this.dialogRef.keydownEvents().pipe(takeUntilDestroyed()).subscribe(event => {
      if (event.key === 'Escape') this.cancel();
    });
    this.membershipForm.controls.churchId.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      if (this.loading()) return;
      const selectedChurchId = this.membershipForm.controls.churchId.value;

      if (this.roles.length || this.departments.length) {
        this.confirmation
          .confirm({
            title: 'Alterar igreja?',
            message:
              'Ao alterar a igreja, os cargos, departamentos e lideranças preenchidos serão removidos.',
            confirmLabel: 'Alterar igreja',
            tone: 'warning',
          })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((confirmed) => {
            if (!confirmed) {
              this.membershipForm.controls.churchId.setValue(this.previousChurchId, {
                emitEvent: false,
              });
              return;
            }

            this.previousChurchId = selectedChurchId;
            this.clearChurchRelations();
          });
        return;
      }

      this.previousChurchId = selectedChurchId;
      this.clearChurchRelations();
    });
    this.load();
  }

  protected addPhone(value?: MemberPhone): void {
    this.phones.push(new FormGroup({
      id: new FormControl(value?.id ?? null),
      phoneTypeId: new FormControl(value?.phoneTypeId ?? '', { nonNullable: true, validators: [Validators.required] }),
      number: new FormControl(value?.number ?? '', { nonNullable: true, validators: [Validators.required, Validators.minLength(10)] }),
      isActive: new FormControl(value?.isActive ?? true, { nonNullable: true }),
    }));
  }
  protected addAddress(value?: MemberAddress): void {
    this.addresses.push(new FormGroup({
      id: new FormControl(value?.id ?? null),
      addressTypeId: new FormControl(value?.addressTypeId ?? '', { nonNullable: true, validators: [Validators.required] }),
      zipCode: new FormControl(value?.zipCode ?? '', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
      street: new FormControl(value?.street ?? '', { nonNullable: true, validators: requiredText }),
      number: new FormControl(value?.number ?? '', { nonNullable: true, validators: requiredText }),
      complement: new FormControl(value?.complement ?? '', { nonNullable: true }),
      neighborhood: new FormControl(value?.neighborhood ?? '', { nonNullable: true, validators: requiredText }),
      city: new FormControl(value?.city ?? '', { nonNullable: true, validators: requiredText }),
      state: new FormControl(value?.state ?? '', { nonNullable: true, validators: [Validators.required] }),
      isActive: new FormControl(value?.isActive ?? true, { nonNullable: true }),
    }));
  }
  protected addRole(value?: MembershipRole): void {
    this.roles.push(new FormGroup({
      id: new FormControl(value?.id ?? null),
      churchRoleId: new FormControl(value?.churchRoleId ?? '', { nonNullable: true, validators: [Validators.required] }),
      startDate: new FormControl(value?.startDate?.slice(0, 10) ?? today(), { nonNullable: true, validators: [Validators.required] }),
      endDate: new FormControl(value?.endDate?.slice(0, 10) ?? null),
      isActive: new FormControl(value?.isActive ?? true, { nonNullable: true }),
    }));
  }
  protected addDepartment(value?: MemberDepartment): void {
    this.departments.push(new FormGroup({
      id: new FormControl(value?.id ?? null),
      churchDepartmentId: new FormControl(value?.churchDepartmentId ?? '', { nonNullable: true, validators: [Validators.required] }),
      startDate: new FormControl(value?.startDate?.slice(0, 10) ?? today(), { nonNullable: true, validators: [Validators.required] }),
      endDate: new FormControl(value?.endDate?.slice(0, 10) ?? null),
      isActive: new FormControl(value?.isActive ?? true, { nonNullable: true }),
      isLeader: new FormControl(!!value?.leadership, { nonNullable: true }),
      leadershipId: new FormControl(value?.leadership?.id ?? null),
      leaderTypeId: new FormControl(value?.leadership?.leaderTypeId ?? null),
      leadershipStartDate: new FormControl(value?.leadership?.startDate?.slice(0, 10) ?? today()),
      leadershipEndDate: new FormControl(value?.leadership?.endDate?.slice(0, 10) ?? null),
      leadershipIsActive: new FormControl(value?.leadership?.isActive ?? true, { nonNullable: true }),
    }));
  }
  protected remove(array: FormArray<FormGroup>, index: number): void { array.removeAt(index); }
  protected lookup(name: string): readonly LookupItem[] {
    const items = this.lookups()[name] ?? [];
    return name === 'pastors' && this.memberId
      ? items.filter((item) => item.id !== this.memberId)
      : items;
  }
  protected cancel(): void {
    if (this.saving()) return;
    if (!this.isDirty()) {
      this.dialogRef.close({ saved: false });
      return;
    }

    this.confirmation
      .confirm({
        title: 'Descartar alterações?',
        message: 'Existem alterações não salvas. Se fechar agora, elas serão perdidas.',
        confirmLabel: 'Descartar e fechar',
        tone: 'danger',
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (confirmed) this.dialogRef.close({ saved: false });
      });
  }
  protected save(stepper: MatStepper): void {
    if (this.saving()) return;
    this.validateCrossFields();
    const forms = [this.generalForm, this.contactForm, this.professionalForm, this.membershipForm, this.rolesForm, this.departmentsForm];
    const invalidIndex = forms.findIndex(form => form.invalid);
    if (invalidIndex >= 0) {
      forms.forEach(form => form.markAllAsTouched()); stepper.selectedIndex = invalidIndex;
      this.notification.error('Corrija os campos destacados antes de salvar.'); return;
    }
    this.saving.set(true);
    this.dialogRef.disableClose = true;
    const request = this.buildPayload();
    const operation = this.memberId ? this.service.update(this.memberId, request) : this.service.create(request);
    operation.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: (response) => {
        this.notification.success(this.editing ? 'Membro atualizado com sucesso.' : 'Membro cadastrado com sucesso.');
        const memberId = this.memberId ?? this.extractMemberId(response);
        this.dialogRef.close({ saved: true, memberId });
      },
      error: error => this.notification.error(getApiErrorMessage(error, 'Não foi possível salvar o membro.')),
    });
  }

  private load(): void {
    this.loading.set(true);
    this.service.getLookups().subscribe({
      next: lookups => {
        this.lookups.set(lookups);
        this.service.getChurchDepartments().subscribe({
          next: departments => {
            this.churchDepartments.set(departments);
            if (this.memberId) this.loadMember(this.memberId);
            else { this.addPhone(); this.addAddress(); this.loading.set(false); }
          },
          error: error => this.loadError(error),
        });
      },
      error: error => this.loadError(error),
    });
  }
  private loadMember(id: string): void {
    this.service.getById(id).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: data => {
        this.generalForm.patchValue({ ...data.member, birthDate: data.member.birthDate?.slice(0, 10) ?? null, rg: data.member.rg ?? '', nationality: data.member.nationality ?? '', motherName: data.member.motherName ?? '', fatherName: data.member.fatherName ?? '', email: data.member.email ?? '' });
        data.phones.forEach(x => this.addPhone(x)); data.addresses.forEach(x => this.addAddress(x));
        if (data.professionalInformation) this.professionalForm.patchValue(data.professionalInformation);
        this.membershipForm.patchValue({ ...data.membership, dateJoinedChurch: data.membership.dateJoinedChurch.slice(0, 10) }, { emitEvent: false });
        this.previousChurchId = data.membership.churchId;
        data.membershipRoles.forEach(x => this.addRole(x)); data.memberDepartments.forEach(x => this.addDepartment(x));
      },
      error: error => this.loadError(error),
    });
  }
  private loadError(error: unknown): void { this.loading.set(false); this.notification.error(getApiErrorMessage(error, 'Não foi possível carregar os dados da tela.')); }
  private clearChurchRelations(): void {
    this.roles.clear();
    this.departments.clear();
    this.membershipForm.controls.pastorId.setValue(null);
  }
  private validateCrossFields(): void {
    const future = (control: FormControl<string | null> | FormControl<string>) => {
      control.setErrors(control.value && control.value > today() ? { future: true } : null);
    };
    future(this.generalForm.controls.birthDate); future(this.membershipForm.controls.dateJoinedChurch);
    const phoneValues = this.phones.controls.map(x => String(x.controls['number'].value).replace(/\D/g, ''));
    this.phones.controls.forEach((x, i) => {
      if (phoneValues.indexOf(phoneValues[i]) !== i) x.controls['number'].setErrors({ duplicate: true });
    });
    const validateRows = (array: FormArray<FormGroup>, key: string) => {
      const active = new Set<string>();
      array.controls.forEach(group => {
        const start = String(group.controls['startDate'].value ?? '');
        const end = String(group.controls['endDate'].value ?? '');
        if (end && end < start) group.controls['endDate'].setErrors({ beforeStart: true });
        const value = String(group.controls[key].value ?? '');
        if (group.controls['isActive'].value && active.has(value)) group.controls[key].setErrors({ duplicate: true });
        active.add(value);
      });
    };
    validateRows(this.roles, 'churchRoleId'); validateRows(this.departments, 'churchDepartmentId');
    this.departments.controls.forEach(group => {
      if (group.controls['isLeader'].value) {
        if (!group.controls['leaderTypeId'].value) group.controls['leaderTypeId'].setErrors({ required: true });
        if (!group.controls['leadershipStartDate'].value) group.controls['leadershipStartDate'].setErrors({ required: true });
      }
    });
  }
  private buildPayload(): CompleteMember {
    const g = this.generalForm.getRawValue(); const m = this.membershipForm.getRawValue();
    const professional = this.professionalForm.getRawValue();
    const hasProfessional = Object.values(professional).some(Boolean);
    return {
      id: this.memberId ?? undefined,
      member: { name: g.name.trim(), cpf: g.cpf.replace(/\D/g, ''), rg: nullable(g.rg), birthDate: g.birthDate, genderId: g.genderId, maritalStatusId: g.maritalStatusId, nationality: nullable(g.nationality), motherName: nullable(g.motherName), fatherName: nullable(g.fatherName), email: nullable(g.email), isActive: g.isActive },
      phones: this.phones.getRawValue().map(x => ({ ...x, number: String(x['number']).replace(/\D/g, '') })) as MemberPhone[],
      addresses: this.addresses.getRawValue().map(x => ({ ...x, zipCode: String(x['zipCode']).replace(/\D/g, ''), street: String(x['street']).trim(), number: String(x['number']).trim(), complement: nullable(String(x['complement'])), neighborhood: String(x['neighborhood']).trim(), city: String(x['city']).trim() })) as MemberAddress[],
      professionalInformation: hasProfessional ? professional as ProfessionalInformation : null,
      membership: { ...m, id: m.id ?? undefined, religiousOriginId: m.religiousOriginId, pastorId: m.pastorId },
      membershipRoles: this.roles.getRawValue() as MembershipRole[],
      memberDepartments: this.departments.getRawValue().map(x => ({
        id: x['id'] ?? undefined, churchDepartmentId: x['churchDepartmentId'], startDate: x['startDate'],
        endDate: x['endDate'], isActive: x['isActive'],
        leadership: !x['isLeader'] ? null : { id: x['leadershipId'] ?? undefined, leaderTypeId: x['leaderTypeId'], startDate: x['leadershipStartDate'], endDate: x['leadershipEndDate'], isActive: x['leadershipIsActive'] },
      })) as MemberDepartment[],
    };
  }
  private isDirty(): boolean {
    return [this.generalForm, this.contactForm, this.professionalForm, this.membershipForm, this.rolesForm, this.departmentsForm]
      .some(form => form.dirty);
  }
  private extractMemberId(response: unknown): string | undefined {
    if (!response || typeof response !== 'object' || !('data' in response)) return undefined;
    const data = response.data;
    return data && typeof data === 'object' && 'memberId' in data && typeof data.memberId === 'string'
      ? data.memberId : undefined;
  }
}
