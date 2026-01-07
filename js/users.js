//const apiUrl = "http://localhost:3000/users";
const apiUrl = "https://usermanagementui.onrender.com/users"; // our backend API (Production)

async function fetchUsers() {
  try {
    const response = await fetch(apiUrl);
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
      <td>${user.email}</td>
      <td>${user.mobile || ""}</td>
      <td>${user.role}</td>
    `;

    table.appendChild(row);
  });
}

// Load users on page load
fetchUsers();
