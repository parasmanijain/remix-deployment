// /expenses/add

import type { ActionFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { useNavigate } from '@remix-run/react';
import { type ReactNode } from 'react';
import ExpenseForm from '~/components/expenses/ExpenseForm';
import Modal from '~/components/util/Modal';
import { requireUserSession } from '~/data/auth.server';
import { addExpense } from '~/data/expenses.server';
import {
  validateExpenseInput
} from '~/data/validation.server';

// ----------------------
// Component
// ----------------------

export default function AddExpensesPage(): ReactNode {
  const navigate = useNavigate();

  function closeHandler(): void {
    navigate('..');
  }

  return (
    <Modal onClose={closeHandler}>
      <ExpenseForm />
    </Modal>
  );
}

// ----------------------
// Action
// ----------------------

export async function action(
  { request }: ActionFunctionArgs
) {
  const userId = await requireUserSession(request);

  const formData = await request.formData();

  // ✅ Build a strongly typed object
  const expenseData = {
    title: String(formData.get('title')),
    amount: Number(formData.get('amount')),
    date: String(formData.get('date')),
  };

  validateExpenseInput(expenseData);

  await addExpense(expenseData, userId);
  return redirect('/expenses');
}
