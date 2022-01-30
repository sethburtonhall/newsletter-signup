import { useEffect, useRef } from 'react';
import { Form, Link, useActionData, useTransition } from 'remix';
import type { ActionFunction } from 'remix';

// This is the form action that only runs on the server. The form posts to the same route. The client route is the api route.
export let action: ActionFunction = async ({ request }) => {
  let formData = await request.formData();
  let email = formData.get('email');

  const API_KEY = process.env.CONVERTKIT_KEY;
  const FORM_ID = '2957385';
  const API = 'https://api.convertkit.com/v3';

  let res = await fetch(`${API}/forms/${FORM_ID}/subscribe`, {
    method: 'POST',
    body: JSON.stringify({
      email,
      api_key: API_KEY,
    }),
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
  return res.json();
};

export default function Newsletter() {
  let actionData = useActionData();
  let transition = useTransition();
  let state: 'idle' | 'success' | 'error' | 'submitting' = transition.submission
    ? 'submitting'
    : actionData?.subscription
    ? 'success'
    : actionData?.error
    ? 'error'
    : 'idle';

  let inputRef = useRef<HTMLInputElement>(null);
  let successRef = useRef<HTMLInputElement>(null);
  let mounted = useRef<boolean>(false);

  useEffect(() => {
    if (state === 'idle' && mounted.current) {
      inputRef.current?.select();
    }

    if (state === 'success') {
      successRef.current?.focus();
    }

    if (state === 'error') {
      inputRef.current?.focus();
    }

    mounted.current = true;
  }, [state]);

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-sky-500 to-indigo-500">
      <main className="flex flex-col justify-center items-center bg-white rounded-lg p-20 h-[350px] w-[600px]">
        <Form
          replace // does not create new history entry
          method="post"
          aria-hidden={state === 'success'}
          className="flex flex-col justify-center items-center w-full"
        >
          <h2 className="text-2xl mb-2 font-bold">
            Subscribe to the Newsletter!
          </h2>
          <p className="mb-10">Don't miss any updates.</p>
          <fieldset
            className="mb-2 w-[400px] flex space-x-2"
            disabled={state === 'submitting'}
          >
            <input
              aria-label="Email Address"
              aria-describedby="error-message"
              ref={inputRef}
              type="email"
              name="email"
              placeholder="you@example.com"
              className="px-4 py-2 rounded-md border-2 w-2/3"
            />
            <button type="submit" className="button w-1/3">
              {state === 'submitting' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </fieldset>
          <p id="error-message" className="text-red-500">
            {state === 'error' ? actionData.message : <>&nbsp;</>}
          </p>
        </Form>

        <div
          aria-hidden={state !== 'success'}
          className="flex flex-col justify-center items-center"
        >
          <h2
            ref={successRef}
            tabIndex={-1}
            className="text-2xl mb-2 font-bold"
          >
            You're Subscribed!
          </h2>
          <p className="mb-3">
            Please check your email to verify your subscription.
          </p>
          <Link to="." className="text-sky-500 button">
            Try Again
          </Link>
        </div>
      </main>
    </div>
  );
}
