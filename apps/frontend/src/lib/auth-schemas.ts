import z from 'zod';

export const signInSchema = z.object({
  email: z.string().min(1, 'Email is required').max(254, 'Email must not exceed 254 characters').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required').max(128, 'Password must not exceed 128 characters').min(8, 'Password must be at least 8 characters'),
});

export const signUpSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must not exceed 100 characters').min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').max(254, 'Email must not exceed 254 characters').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required').max(128, 'Password must not exceed 128 characters').min(8, 'Password must be at least 8 characters'),
  terms: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms and privacy policy' }) }),
});

export type SignInSchema = z.infer<typeof signInSchema>;
export type SignUpSchema = z.infer<typeof signUpSchema>;
