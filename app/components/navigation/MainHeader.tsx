import { ReactNode } from 'react';
import { Form, Link, NavLink, useLoaderData } from '@remix-run/react';
import Logo from '../util/Logo';

/* ---------------- Types ---------------- */

type LoaderData = string | null; // userId from loader (string if logged in, null if not)

/* ---------------- Component ---------------- */

function MainHeader(): ReactNode {
  const userId = useLoaderData<LoaderData>();

  return (
    <header id='main-header'>
      <Logo />
      <nav id='main-nav'>
        <ul>
          <li>
            <NavLink to='/'>Home</NavLink>
          </li>
          <li>
            <NavLink to='/pricing'>Pricing</NavLink>
          </li>
        </ul>
      </nav>
      <nav id='cta-nav'>
        <ul>
          <li>
            {userId ? (
              <Form method='post' action='/logout' id='logout-form'>
                <button className='cta-alt'>Logout</button>
              </Form>
            ) : (
              <Link to='/auth' className='cta'>
                Login
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default MainHeader;
