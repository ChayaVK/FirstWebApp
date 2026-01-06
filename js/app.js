//const apiUrl = "http://localhost:3000/users";
const apiUrl = "https://usermanagementui.onrender.com/users"; // our backend API (Production)

let users = [];
let editMode = false;

const form = document.getElementById("userForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const mobileInput = document.getElementById("mobile");
const roleInput = document.getElementById("role");
const userIdInput = document.getElementById("userId");

// 1️⃣ Fetch users from API
async function fetchUsers() {
  try {
    const response = await fetch(apiUrl);
    users = await response.json();
    renderUsers();
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

// 2️⃣ Render users in table
function renderUsers() {
  const table = document.getElementById("userTable");
  table.innerHTML = "";

  users.forEach(user => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.mobile}</td>
      <td>${user.role}</td>
      <td class="actions">
        <button class="edit" onclick="editUser(${user.id})">Edit</button>
        <button class="delete" onclick="deleteUser(${user.id})">Delete</button>
      </td>
    `;
    table.appendChild(row);
  });
}

function validateForm() {
  let valid = true;

  const nameError = document.getElementById("nameError");
  const emailError = document.getElementById("emailError");
  const mobileError = document.getElementById("mobileError");
  const roleError = document.getElementById("roleError");

  // Clear errors
  nameError.textContent = "";
  emailError.textContent = "";
  mobileError.textContent = "";
  roleError.textContent = "";

  if (!nameInput.value.trim()) {
    nameError.textContent = "Name is required";
    valid = false;
  }

  if (!emailInput.value.trim()) {
    emailError.textContent = "Email is required";
    valid = false;
  } else if (!emailInput.value.includes("@")) {
    emailError.textContent = "Invalid email format";
    valid = false;
  }

  if (!mobileInput.value.trim()) {
    mobileError.textContent = "PhoneNumber is required";
    valid = false;
  }else if(!/^\d{10}$/.test(mobileInput.value)){
  mobileError.textContent = "Mobile number must be 10 digits";
  valid = false;

  }

  if (!roleInput.value) {
    roleError.textContent = "Role is required";
    valid = false;
  }

  return valid;
}



// 4️⃣ Add or edit user
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  const userData = {
    name: nameInput.value,
    email: emailInput.value,
    mobile: mobileInput.value,
    role: roleInput.value
  };

  try {
    if (editMode) {
      // Edit user
      await fetch(`${apiUrl}/${userIdInput.value}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });

      const index = users.findIndex(u => u.id == userIdInput.value);
      users[index] = { ...users[index], ...userData };
      editMode = false;
    } else {
      // Add user
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });
      const newUser = await response.json();
      users.push(newUser);
    }

    form.reset();
    renderUsers();
  } catch (error) {
    console.error("Error saving user:", error);
  }
});

// 5️⃣ Edit user
function editUser(id) {
  const user = users.find(u => u.id === id);
  nameInput.value = user.name;
  emailInput.value = user.email;
  mobileInput.value = user.mobile;
  roleInput.value = user.role;
  userIdInput.value = user.id;
  editMode = true;
}

// 6️⃣ Delete user
async function deleteUser(id) {
  if (!confirm("Are you sure you want to delete this user?")) return;

  try {
    await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
    users = users.filter(u => u.id !== id);
    renderUsers();
  } catch (error) {
    console.error("Error deleting user:", error);
  }
}

// 7️⃣ Load users on page load
fetchUsers();

