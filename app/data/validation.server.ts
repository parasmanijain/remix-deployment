/* ---------------- Types ---------------- */

export type ValidationErrors<T extends string = string> = Partial<
  Record<T, string>
>;

interface ExpenseInput {
  title?: unknown;
  amount?: unknown;
  date?: unknown;
}

interface CredentialsInput {
  email?: unknown;
  password?: unknown;
}

/* ---------------- Expense Validation ---------------- */

function isValidTitle(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.trim().length > 0 &&
    value.trim().length <= 30
  );
}

function isValidAmount(value: unknown): boolean {
  const amount =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
      ? Number.parseFloat(value)
      : NaN;

  return !Number.isNaN(amount) && amount > 0;
}

function isValidDate(value: unknown): boolean {
  if (!value) return false;

  const date = new Date(value as string | number | Date);
  return date.getTime() < Date.now();
}

export function validateExpenseInput(input: ExpenseInput): void {
  const validationErrors: ValidationErrors<'title' | 'amount' | 'date'> = {};

  if (!isValidTitle(input.title)) {
    validationErrors.title =
      'Invalid expense title. Must be at most 30 characters long.';
  }

  if (!isValidAmount(input.amount)) {
    validationErrors.amount =
      'Invalid amount. Must be a number greater than zero.';
  }

  if (!isValidDate(input.date)) {
    validationErrors.date = 'Invalid date. Must be a date before today.';
  }

  if (Object.keys(validationErrors).length > 0) {
    throw validationErrors;
  }
}

/* ---------------- Auth Validation ---------------- */

function isValidEmail(value: unknown): value is string {
  return typeof value === 'string' && value.includes('@');
}

function isValidPassword(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length >= 7;
}

export function validateCredentials(input: CredentialsInput): void {
  const validationErrors: ValidationErrors<'email' | 'password'> = {};

  if (!isValidEmail(input.email)) {
    validationErrors.email = 'Invalid email address.';
  }

  if (!isValidPassword(input.password)) {
    validationErrors.password =
      'Invalid password. Must be at least 7 characters long.';
  }

  if (Object.keys(validationErrors).length > 0) {
    throw validationErrors;
  }
}
