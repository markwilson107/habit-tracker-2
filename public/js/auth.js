function saveToken(token) {
  localStorage.setItem("token", token);
}

function getToken() {
  return localStorage.getItem("token");
}

function logout() {
  localStorage.removeItem("token");
  window.location.replace("/");
}

async function authFetch(url, options = {}) {
  const headers = new Headers(options.headers || {});
  const authToken = getToken();
  headers.set("Authorization", "Bearer " + authToken);

  const response = await fetch(url, { ...options, headers: headers });

  if (response.status === 401) {
    logout();
  }

  return response;
}
