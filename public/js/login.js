const email = document.getElementById("email");
const password = document.getElementById("password");
const message = document.getElementById("message");
const loginButton = document.getElementById("login-button");

const token = getToken();
if (token) {
  window.location.replace("/dashboard.html");
}

function loginOnEnter(event) {
  if (event.key === "Enter") {
    loginButton.click();
  }
}

email.addEventListener("keydown", loginOnEnter);
password.addEventListener("keydown", loginOnEnter);

loginButton.addEventListener("click", async function () {
  message.textContent = "";

  loginButton.disabled = true;
  loginButton.textContent = "Loading...";

  try {
    if (
      email.value.trim() === "" ||
      password.value.trim() === ""
    ) {
      throw new Error("Missing field inputs");
    }

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not login");
    }

    saveToken(data.token);
    window.location.replace("/dashboard.html");
  } catch (error) {
    console.error(error)
    message.textContent = error.message || "Could not connect to the server";
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "Log in";
  }
});
