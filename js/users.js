const token = localStorage.getItem("token");
if (!token) window.location.href = "login.html";
const apiUrl = `${API_BASE_URL}/users`;

//const apiUrl = "https://usermanagementui.onrender.com/users"; // our backend API (Production)

async function fetchUsers() {
  try {
        const response = await fetch(apiUrl, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    const users = await response.json();
    renderUsers(users);
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

function renderUsers(users) {
  const table = document.getElementById("userTable");
  table.innerHTML = "";

  users.forEach(user => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${user.name}</td>
      <td>${user.gender}</td>
      <td>${user.email}</td>
      <td>${user.mobile || ""}</td>
      <td>${user.role}</td>
    `;

    table.appendChild(row);
  });
}

// Load users on page load
fetchUsers();
