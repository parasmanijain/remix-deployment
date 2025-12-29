// /expenses/analysis
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import {
  useRouteError,
  isRouteErrorResponse,
  useLoaderData,
} from '@remix-run/react';
import ExpenseStatistics from '~/components/expenses/ExpenseStatistics';
import Chart from '~/components/expenses/Chart';
import { getExpenses } from '~/data/expenses.server';
import ErrorComponent from '~/components/util/Error';
import { requireUserSession } from '~/data/auth.server';

export default function ExpensesAnalysisPage() {
  const expenses = useLoaderData<typeof loader>();

  return (
    <main>
      <Chart expenses={expenses} />
      <ExpenseStatistics expenses={expenses} />
    </main>
  );
}

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserSession(request);

  const expenses = await getExpenses(userId);

  if (!expenses || expenses.length === 0) {
    throw json(
      { message: 'Could not load expenses for the requested analysis.' },
      {
        status: 404,
        statusText: 'Expenses not found',
      }
    );
  }

  return expenses;
}

export function ErrorBoundary() {
  const error = useRouteError();
  const response = isRouteErrorResponse(error);

  let title = 'Error!';
  let message = 'Something went wrong - could not load expenses.';

  if (response) {
    title ??= error.statusText;
    message ??= error.data?.message;
  }

  return (
    <main>
      <ErrorComponent title={title}>
        <p>{message}</p>
      </ErrorComponent>
    </main>
  );
}
