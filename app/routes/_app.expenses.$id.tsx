// /expenses/<some-id> => /expenses/expense-1, /expenses/e-1

import type { ActionFunctionArgs, MetaFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { useNavigate } from '@remix-run/react';
import { ReactNode } from 'react';

import ExpenseForm from '~/components/expenses/ExpenseForm';
import Modal from '~/components/util/Modal';
import { deleteExpense, updateExpense } from '~/data/expenses.server';
import { validateExpenseInput } from '~/data/validation.server';

// ----------------------
// Component
// ----------------------

export default function UpdateExpensesPage(): ReactNode {
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

export async function action({ params, request }: ActionFunctionArgs) {
  const expenseId = params.id;

  if (!expenseId) {
    throw new Response('Expense ID not found', { status: 400 });
  }

  if (request.method === 'PATCH') {
    const formData = await request.formData();

    // ✅ Build a properly typed object (NO unsafe casting)
    const expenseData = {
      title: String(formData.get('title')),
      amount: Number(formData.get('amount')),
      date: String(formData.get('date')),
    };

    validateExpenseInput(expenseData);

    await updateExpense(expenseId, expenseData);
    return redirect('/expenses');
  }

  if (request.method === 'DELETE') {
    await deleteExpense(expenseId);
    return { deletedId: expenseId };
  }

  throw new Response('Method Not Allowed', { status: 405 });
}

// ----------------------
// Meta
// ----------------------

type ExpenseMeta = {
  id: string;
  title: string;
};

export const meta: MetaFunction = ({ params, matches }) => {
  const expensesRoute = matches.find(
    (route) => route.id === 'routes/_app.expenses'
  );

  // ✅ Narrow Remix's `unknown` data safely
  const expenses = expensesRoute?.data as ExpenseMeta[] | undefined;

  const expense = expenses?.find((expense) => expense.id === params.id);

  return [
    {
      title: expense?.title ?? 'Update Expense',
      description: 'Update expense.',
    },
  ];
};
