'use client';

import React, { useState, useCallback, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInSchema, type SignInSchema } from '@/lib/auth-schemas';
import { signInContent } from './auth-content';
import { FormField } from './primitives/FormField';
import { SubmitButton } from './primitives/SubmitButton';
import { apiClient, extractApiError } from '@/lib/api-client';
import { useAuthStore } from '@/store/authStore';

export function SignInForm(): React.JSX.Element {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof SignInSchema, string>>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (loading) return;
      setServerError(null);
      setErrors({});

      const result = signInSchema.safeParse({ email, password });

      if (!result.success) {
        const fieldErrors: Partial<Record<keyof SignInSchema, string>> = {};
        for (const issue of result.error.issues) {
          const field = issue.path[0] as keyof SignInSchema;
          if (!fieldErrors[field]) {
            fieldErrors[field] = issue.message;
          }
        }
        setErrors(fieldErrors);
        return;
      }

      setLoading(true);
      try {
        const response = await apiClient.post('/auth/sign-in', {
          email: result.data.email,
          password: result.data.password,
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
    [email, password, setAuth, router],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="space-y-1">
        <h1 className="text-h1 font-heading text-foreground">{signInContent.title}</h1>
        <p className="text-body text-muted-foreground">{signInContent.subtitle}</p>
      </div>

      <div className="space-y-4">
        <FormField
          label={signInContent.emailLabel}
          type="email"
          placeholder={signInContent.emailPlaceholder}
          value={email}
          onChange={(val) => { setEmail(val); if (serverError) setServerError(null); }}
          autoComplete="email"
          required
          error={errors.email}
          validationState={errors.email ? 'error' : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'success' : 'idle'}
        />

        <FormField
          label={signInContent.passwordLabel}
          type="password"
          placeholder={signInContent.passwordPlaceholder}
          value={password}
          onChange={(val) => { setPassword(val); if (serverError) setServerError(null); }}
          autoComplete="current-password"
          required
          error={errors.password}
          validationState={errors.password ? 'error' : password.length >= 8 ? 'success' : 'idle'}
        />
      </div>

      {serverError && (
        <p role="alert" className="text-sm text-destructive">
          {serverError}
        </p>
      )}

      <SubmitButton loading={loading}>{signInContent.submit}</SubmitButton>

      <p className="text-center text-sm text-muted-foreground">
        {signInContent.noAccount}{' '}
        <Link href="/sign-up" className="text-primary hover:underline">
          {signInContent.signUpLink}
        </Link>
      </p>
    </form>
  );
}
