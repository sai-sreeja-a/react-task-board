
import { useState } from "react";
import { login, signup } from "../services/authApi";
import type { AuthUser } from "../services/authApi";

interface AuthFormProps {
  onAuthenticated: (user: AuthUser) => void;
}

function AuthForm({ onAuthenticated }: AuthFormProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = isSignup
        ? await signup(name, email, password)
        : await login(email, password);

      if (!result.success || !result.user) {
        setError(result.message || "Authentication failed");
        return;
      }

      onAuthenticated(result.user);
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>{isSignup ? "Create Account" : "Welcome Back"}</h1>

        {isSignup && (
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            maxLength={100}
          />
        )}

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
        />

        {error && <p className="error-message">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading
            ? "Please wait..."
            : isSignup
              ? "Sign Up"
              : "Log In"}
        </button>

        <p>
          {isSignup
            ? "Already have an account?"
            : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup);
              setError("");
            }}
          >
            {isSignup ? "Log In" : "Sign Up"}
          </button>
        </p>
      </form>
    </main>
  );
}

export default AuthForm;
