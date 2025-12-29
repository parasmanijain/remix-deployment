import bcrypt from 'bcryptjs';
import { createCookieSessionStorage, redirect } from '@remix-run/node';
import { prisma } from './database.server';

const { hash, compare } = bcrypt;

/* ---------------- Env ---------------- */

const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET) {
  throw new Error('SESSION_SECRET must be set');
}

/* ---------------- Session ---------------- */

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    secure: process.env.NODE_ENV === 'production',
    secrets: [SESSION_SECRET],
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    httpOnly: true,
    path: '/',
  },
});

/* ---------------- Types ---------------- */

interface AuthCredentials {
  email: string;
  password: string;
}

interface AuthError extends Error {
  status?: number;
}

/* ---------------- Helpers ---------------- */

async function createUserSession(userId: string, redirectPath: string) {
  const session = await sessionStorage.getSession();
  session.set('userId', userId);
  return redirect(redirectPath, {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session),
    },
  });
}

/* ---------------- Session Access ---------------- */

export async function getUserFromSession(
  request: Request
): Promise<string | null> {
  const session = await sessionStorage.getSession(
    request.headers.get('Cookie')
  );

  const userId = session.get('userId');
  if (typeof userId !== 'string') {
    return null;
  }

  return userId;
}

export async function destroyUserSession(request: Request) {
  const session = await sessionStorage.getSession(
    request.headers.get('Cookie')
  );

  return redirect('/', {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session),
    },
  });
}

export async function requireUserSession(request: Request): Promise<string> {
  const userId = await getUserFromSession(request);
  if (!userId) {
    throw redirect('/auth?mode=login');
  }

  return userId;
}

/* ---------------- Auth ---------------- */

export async function signup({ email, password }: AuthCredentials) {
  const existingUser = await prisma.user.findFirst({
    where: { email },
  });

  if (existingUser) {
    const error: AuthError = new Error(
      'A user with the provided email address exists already.'
    );
    error.status = 422;
    throw error;
  }

  const passwordHash = await hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      password: passwordHash,
    },
  });
  return createUserSession(user.id, '/expenses');
}

export async function login({ email, password }: AuthCredentials) {
  const existingUser = await prisma.user.findFirst({
    where: { email },
  });

  if (!existingUser) {
    const error: AuthError = new Error(
      'Could not log you in, please check the provided credentials.'
    );
    error.status = 401;
    throw error;
  }

  const passwordCorrect = await compare(password, existingUser.password);

  if (!passwordCorrect) {
    const error: AuthError = new Error(
      'Could not log you in, please check the provided credentials.'
    );
    error.status = 401;
    throw error;
  }

  return createUserSession(existingUser.id, '/expenses');
}
