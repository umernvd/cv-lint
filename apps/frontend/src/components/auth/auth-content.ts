export const brandPanel = {
  heading: 'Land your dream job',
  description: 'AI-powered resume analysis that optimizes your CV for ATS systems and helps you stand out to recruiters.',
  features: [
    { icon: 'check', text: 'ATS compatibility scoring' },
    { icon: 'check', text: 'Keyword gap analysis' },
    { icon: 'check', text: 'Bullet point optimization' },
  ],
} as const;

export const signInContent = {
  title: 'Welcome back',
  subtitle: 'Sign in to continue to your dashboard',
  emailLabel: 'Email',
  emailPlaceholder: 'you@example.com',
  passwordLabel: 'Password',
  passwordPlaceholder: 'Enter your password',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  submit: 'Sign in',
  noAccount: 'Don\'t have an account?',
  signUpLink: 'Sign up',
  serverError: 'An error occurred. Please try again.',
} as const;

export const signUpContent = {
  title: 'Create account',
  subtitle: 'Start optimizing your resume in minutes',
  nameLabel: 'Full name',
  namePlaceholder: 'John Doe',
  emailLabel: 'Email',
  emailPlaceholder: 'you@example.com',
  passwordLabel: 'Password',
  passwordPlaceholder: 'Create a password',
  submit: 'Create account',
  termsLabel: 'I agree to the',
  termsLink: 'Terms of Service',
  privacyLink: 'Privacy Policy',
  and: 'and',
  hasAccount: 'Already have an account?',
  signInLink: 'Sign in',
  serverError: 'An error occurred. Please try again.',
  passwordStrength: {
    label: 'Password strength',
    weak: 'Weak',
    fair: 'Fair',
    good: 'Good',
    strong: 'Strong',
  },
} as const;

export const formField = {
  required: 'This field is required',
} as const;

export const passwordStrengthLabels = {
  0: 'Very weak',
  1: 'Weak',
  2: 'Fair',
  3: 'Good',
  4: 'Strong',
} as const;
