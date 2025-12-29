import { prisma } from './database.server';
import type { Expense } from '@prisma/client';

/* ---------------- Types ---------------- */

export interface ExpenseInput {
  title: string;
  amount: string | number;
  date: string | Date;
}

/* ---------------- Create ---------------- */

export async function addExpense(
  expenseData: ExpenseInput,
  userId: string
): Promise<Expense> {
  if (!userId) {
    throw new Error('Failed to add expense.');
  }

  try {
    return await prisma.expense.create({
      data: {
        title: expenseData.title,
        amount: Number(expenseData.amount),
        date: new Date(expenseData.date),
        User: {
          connect: { id: userId },
        },
      },
    });
  } catch {
    throw new Error('Failed to add expense.');
  }
}

/* ---------------- Read ---------------- */

export async function getExpenses(userId: string): Promise<Expense[]> {
  if (!userId) {
    throw new Error('Failed to get expenses.');
  }

  try {
    return await prisma.expense.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  } catch {
    throw new Error('Failed to get expenses.');
  }
}

export async function getExpense(id: string): Promise<Expense | null> {
  try {
    return await prisma.expense.findFirst({
      where: { id },
    });
  } catch {
    throw new Error('Failed to get expense.');
  }
}

/* ---------------- Update ---------------- */

export async function updateExpense(
  id: string,
  expenseData: ExpenseInput
): Promise<void> {
  try {
    await prisma.expense.update({
      where: { id },
      data: {
        title: expenseData.title,
        amount: Number(expenseData.amount),
        date: new Date(expenseData.date),
      },
    });
  } catch {
    throw new Error('Failed to update expense.');
  }
}

/* ---------------- Delete ---------------- */

export async function deleteExpense(id: string): Promise<void> {
  try {
    await prisma.expense.delete({
      where: { id },
    });
  } catch {
    throw new Error('Failed to delete expense.');
  }
}
