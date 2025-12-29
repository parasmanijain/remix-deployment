import type {
  ActionFunctionArgs,
  LinksFunction,
  HeadersFunction,
} from '@remix-run/node';
import type { ReactNode } from 'react';
import AuthForm from '~/components/auth/AuthForm';
import { login, signup } from '~/data/auth.server';
import { validateCredentials } from '~/data/validation.server';
import authStyles from '~/styles/auth.css?url';

type AuthMode = 'login' | 'signup';

interface Credentials {
  email: string;
  password: string;
}

/**
 * Type guard for HTTP-style errors thrown from auth logic
 */
function isHttpError(
  error: unknown
): error is { status: number; message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'message' in error &&
    typeof (error as { status: unknown }).status === 'number' &&
    typeof (error as { message: unknown }).message === 'string'
  );
}

export default function AuthPage(): ReactNode {
  return <AuthForm />;
}

export async function action({ request }: ActionFunctionArgs) {
  const searchParams = new URL(request.url).searchParams;

  const authMode: AuthMode =
    searchParams.get('mode') === 'signup' ? 'signup' : 'login';

  const formData = await request.formData();
  const email = formData.get('email');
  const password = formData.get('password');

  if (typeof email !== 'string' || typeof password !== 'string') {
    return { credentials: 'Invalid form submission.' };
  }

  const credentials: Credentials = { email, password };
  try {
    validateCredentials(credentials);
  } catch (error) {
    return error;
  }

  try {
    return authMode === 'login'
      ? await login(credentials)
      : await signup(credentials);
  } catch (error: unknown) {
    if (isHttpError(error) && error.status === 422) {
      return { credentials: error.message };
    }

    return { credentials: 'Invalid username or password.' };
  }
}

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: authStyles }];
};

export const headers: HeadersFunction = ({ parentHeaders }) => {
  return {
    'Cache-Control': parentHeaders.get('Cache-Control') ?? '',
  };
};
