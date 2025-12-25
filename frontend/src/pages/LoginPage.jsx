import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function LoginPage() {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    /* global google */

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      console.error("VITE_GOOGLE_CLIENT_ID is missing");
      alert("Google Client ID not configured");
      return;
    }

    google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        try {
          const idToken = response.credential;
          const user = await loginWithGoogle(idToken);

          // Role-based routing
          if (user.role === "student") {
            navigate("/student", { replace: true });
          } else if (user.role === "proctor") {
            navigate("/proctor", { replace: true });
          } else if (user.role === "mentor") {
            navigate("/mentor", { replace: true });
          } else {
            alert("Unauthorized role");
          }
        } catch (err) {
          console.error(err);
          alert("Login failed");
        }
      },
    });

    google.accounts.id.renderButton(
      document.getElementById("google-signin"),
      {
        theme: "outline",
        size: "large",
      }
    );
  }, [loginWithGoogle, navigate]);

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>Login</h2>
      <div id="google-signin"></div>
    </div>
  );
}

export default LoginPage;
