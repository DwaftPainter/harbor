"use client";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          alignItems: "center",
          background: "#f8fafc",
          color: "#0f172a",
          display: "flex",
          fontFamily: "system-ui, sans-serif",
          justifyContent: "center",
          margin: 0,
          minHeight: "100vh",
          padding: "1.5rem",
        }}
      >
        <main style={{ maxWidth: "28rem", textAlign: "center" }}>
          <title>Unexpected error | Harbor</title>
          <h1>Harbor could not load</h1>
          <p>Please try again. No error details have been exposed.</p>
          {error.digest ? <p>Support reference: {error.digest}</p> : null}
          <button onClick={() => unstable_retry()} type="button">
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
