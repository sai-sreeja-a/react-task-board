
import { useEffect, useState } from "react";
import TaskBoard from "./components/TaskBoard";
import AuthForm from "./components/AuthForm";
import {
  getCurrentUser,
  logout,
} from "./services/authApi";
import type { AuthUser } from "./services/authApi";
import "./App.css";

function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const result = await getCurrentUser();

        if (result.success && result.user) {
          setUser(result.user);
        }
      } catch {
        setUser(null);
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
    } catch {
      alert("Unable to log out. Please try again.");
    }
  };

  if (checkingSession) {
    return <p>Checking your session...</p>;
  }

  if (!user) {
    return <AuthForm onAuthenticated={setUser} />;
  }

  return (
    <>
      <header className="user-header">
        <span>Welcome, {user.name}</span>
        <button onClick={handleLogout}>Logout</button>
      </header>

      <TaskBoard />
    </>
  );
}

export default App;
//Check whether a valid session already exists.
//Show the login/signup screen if you're not authenticated.
//Show the task board after login.
//Display the logged-in user's name.
//Allow the user to log out.