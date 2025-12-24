import { useEffect } from "react";
import { useAuth } from "../auth/AuthContext";

function LoginPage() {
  const { loginWithGoogle } = useAuth();

  useEffect(() => {
    /* global google */
    google.accounts.id.initialize({
      client_id:
        "1074024818830-d9r17vs6olleii83lte9msddo8bg132j.apps.googleusercontent.com",
      callback: async (response) => {
        try {
          const idToken = response.credential;

          const user = await loginWithGoogle(idToken);

          if (user.role === "student") {
            window.location.href = "/student";
          } else if (user.role === "proctor") {
            window.location.href = "/proctor";
          } else if (user.role === "mentor") {
            window.location.href = "/mentor";
          } else {
            alert("Unauthorized role");
          }
        } catch (err) {
          alert("Login failed");
          console.error(err);
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
  }, [loginWithGoogle]);

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>Login</h2>
      <div id="google-signin"></div>
    </div>
  );
}

export default LoginPage;
