import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { WEB3FORMS_ACCESS_KEY } from '../../core/env';
import { contactHref, phoneValue, whatsappUrlFromDetails } from '../../core/contact-links';
import { I18n } from '../../core/i18n';
import { PageTransition } from '../../core/page-transition';
import { Portfolio } from '../../core/portfolio';
import { ContactDetail } from '../../core/portfolio.model';
import { UiIcon } from '../../shared/ui-icon';

type FormField = 'from_name' | 'email_id' | 'phone' | 'message';


@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule, UiIcon],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  private readonly portfolio = inject(Portfolio);
  protected readonly i18n = inject(I18n);
  private readonly fb = inject(FormBuilder);

  protected readonly data = toSignal(this.portfolio.getData());
  protected readonly transition = inject(PageTransition);
  protected readonly status = signal('');
  protected readonly statusColor = signal('');
  protected readonly sending = signal(false);
  protected readonly submitted = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    from_name: ['', Validators.required],
    email_id: ['', [Validators.required, Validators.email]],
    phone: [''],
    message: ['', Validators.required],
    botcheck: [false],
  });

  async onSubmit(): Promise<void> {
    this.submitted.set(true);

    if (this.form.invalid || this.sending()) {
      this.form.markAllAsTouched();
      this.status.set(this.i18n.t().fixFields);
      this.statusColor.set('#ff6b6b');
      return;
    }

    const accessKey =
      WEB3FORMS_ACCESS_KEY.trim() || this.data()?.contact.web3forms?.accessKey?.trim();
    if (!accessKey) {
      this.status.set(this.i18n.t().formNotConfigured);
      this.statusColor.set('#ff6b6b');
      return;
    }

    this.sending.set(true);
    this.status.set(this.i18n.t().sendingMessage);
    this.statusColor.set('');

    const value = this.form.getRawValue();

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: accessKey,
          name: value.from_name,
          email: value.email_id,
          phone: value.phone.trim() || this.i18n.t().notProvided,
          message: value.message,
          subject: `Portfolio message from ${value.from_name}`,
          from_name: 'Yanal Portfolio',
          botcheck: value.botcheck,
        }),
      });

      const result = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to send message.');
      }

      this.status.set(this.i18n.t().sent);
      this.statusColor.set('green');
      this.submitted.set(false);
      this.form.reset();
      setTimeout(() => this.status.set(''), 4000);
    } catch (error) {
      console.error('Web3Forms error:', error);
      this.status.set(this.i18n.t().sendFailed);
      this.statusColor.set('red');
    } finally {
      this.sending.set(false);
    }
  }

  showError(name: FormField): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.submitted());
  }

  errorOf(name: FormField): string {
    const errors = this.form.controls[name].errors;
    if (!errors) {
      return '';
    }
    if (errors['required']) {
      const messages: Record<FormField, string> = {
        from_name: this.i18n.t().nameRequired,
        email_id: this.i18n.t().emailRequired,
        phone: '',
        message: this.i18n.t().messageRequired,
      };
      return messages[name];
    }
    if (errors['email']) {
      return this.i18n.t().emailInvalid;
    }
    return this.i18n.t().checkField;
  }

  hrefFor(detail: ContactDetail): string | null {
    return contactHref(detail.label, detail.value, detail.kind);
  }

  whatsappUrl(): string | null {
    return whatsappUrlFromDetails(this.data()?.contact.details);
  }

  whatsappLabel(): string {
    return phoneValue(this.data()?.contact.details);
  }
}
