'use client';

import React, { useState, useCallback, useMemo, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUpSchema, type SignUpSchema } from '@/lib/auth-schemas';
import { signUpContent } from './auth-content';
import { FormField } from './primitives/FormField';
import { PasswordStrengthBar } from './primitives/PasswordStrengthBar';
import { SubmitButton } from './primitives/SubmitButton';
import { apiClient, extractApiError } from '@/lib/api-client';
import { useAuthStore } from '@/store/authStore';

function calculatePasswordStrength(password: string): number {
  if (password.length === 0) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z\d]/.test(password)) score++;
  return score;
}

export function SignUpForm(): React.JSX.Element {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof SignUpSchema, string>>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const passwordStrength = useMemo(() => calculatePasswordStrength(password), [password]);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (loading) return;
      setServerError(null);
      setErrors({});

      const result = signUpSchema.safeParse({ email, name, password, terms });

      if (!result.success) {
        const fieldErrors: Partial<Record<keyof SignUpSchema, string>> = {};
        for (const issue of result.error.issues) {
          const field = issue.path[0] as keyof SignUpSchema;
          if (!fieldErrors[field]) {
            fieldErrors[field] = issue.message;
          }
        }
        setErrors(fieldErrors);
        return;
      }

      setLoading(true);
      try {
        const response = await apiClient.post('/auth/sign-up', {
          email: result.data.email,
          password: result.data.password,
          name: result.data.name,
        });

        const payload = response.data.data.data;
        setAuth({ id: payload.user.id, email: payload.user.email, name: payload.user.name }, payload.accessToken);
        router.replace('/analyze');
      } catch (err: unknown) {
        setServerError(extractApiError(err));
      } finally {
        setLoading(false);
      }
    },
    [email, name, password, terms, setAuth, router],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="space-y-1">
        <h1 className="text-h1 font-heading text-foreground">{signUpContent.title}</h1>
        <p className="text-body text-muted-foreground">{signUpContent.subtitle}</p>
      </div>

      <div className="space-y-4">
        <FormField
          label={signUpContent.nameLabel}
          placeholder={signUpContent.namePlaceholder}
          value={name}
          onChange={(val) => { setName(val); if (serverError) setServerError(null); }}
          autoComplete="name"
          required
          error={errors.name}
          validationState={errors.name ? 'error' : name.length >= 2 ? 'success' : 'idle'}
        />

        <FormField
          label={signUpContent.emailLabel}
          type="email"
          placeholder={signUpContent.emailPlaceholder}
          value={email}
          onChange={(val) => { setEmail(val); if (serverError) setServerError(null); }}
          autoComplete="email"
          required
          error={errors.email}
          validationState={errors.email ? 'error' : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'success' : 'idle'}
        />

        <div className="space-y-2">
          <FormField
            label={signUpContent.passwordLabel}
            type="password"
            placeholder={signUpContent.passwordPlaceholder}
            value={password}
            onChange={(val) => { setPassword(val); if (serverError) setServerError(null); }}
            autoComplete="new-password"
            required
            error={errors.password}
            validationState={errors.password ? 'error' : password.length >= 8 ? 'success' : 'idle'}
          />
          {password.length > 0 && <PasswordStrengthBar score={passwordStrength} label={signUpContent.passwordStrength.label} />}
        </div>

        <div className="flex items-start gap-2">
          <input
            id="terms"
            type="checkbox"
            checked={terms}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTerms(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-border bg-white text-primary focus:ring-2 focus:ring-ring focus:ring-offset-0"
            aria-describedby={errors.terms ? 'terms-error' : undefined}
            aria-invalid={errors.terms ? 'true' : 'false'}
          />
          <label htmlFor="terms" className="text-sm text-muted-foreground">
            {signUpContent.termsLabel}{' '}
            <Link href="/terms" className="text-primary hover:underline">
              {signUpContent.termsLink}
            </Link>{' '}
            {signUpContent.and}{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              {signUpContent.privacyLink}
            </Link>
          </label>
        </div>
        {errors.terms && (
          <p id="terms-error" role="alert" className="-mt-3 text-xs text-destructive">
            {errors.terms}
          </p>
        )}
      </div>

      {serverError && (
        <p role="alert" className="text-sm text-destructive">
          {serverError}
        </p>
      )}

      <SubmitButton loading={loading}>{signUpContent.submit}</SubmitButton>

      <p className="text-center text-sm text-muted-foreground">
        {signUpContent.hasAccount}{' '}
        <Link href="/sign-in" className="text-primary hover:underline">
          {signUpContent.signInLink}
        </Link>
      </p>
    </form>
  );
}
