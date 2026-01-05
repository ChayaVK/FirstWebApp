    let users = JSON.parse(localStorage.getItem("users")) || [];
    let editMode = false;

    const form = document.getElementById("userForm");
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const roleInput = document.getElementById("role");
    const userIdInput = document.getElementById("userId");

    function saveUsers() {
  localStorage.setItem("users", JSON.stringify(users));
}
    function renderUsers() {
      const table = document.getElementById("userTable");
      table.innerHTML = "";

      users.forEach(user => {
        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${user.name}</td>
          <td>${user.email}</td>
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

      document.getElementById("nameError").textContent = "";
      document.getElementById("emailError").textContent = "";
      document.getElementById("roleError").textContent = "";

      if (nameInput.value.trim() === "") {
        document.getElementById("nameError").textContent = "Name is required";
        valid = false;
      }

      if (emailInput.value.trim() === "") {
        document.getElementById("emailError").textContent = "Email is required";
        valid = false;
      } else if (!emailInput.value.includes("@")) {
        document.getElementById("emailError").textContent = "Invalid email format";
        valid = false;
      }

      if (roleInput.value === "") {
        document.getElementById("roleError").textContent = "Role is required";
        valid = false;
      }

      return valid;
    }

    form.addEventListener("submit", function(e) {
      e.preventDefault();
      if (!validateForm()) return;

      if (editMode) {
        const user = users.find(u => u.id == userIdInput.value);
        user.name = nameInput.value;
        user.email = emailInput.value;
        user.role = roleInput.value;
        editMode = false;
      } else {
        users.push({
          id: Date.now(),
          name: nameInput.value,
          email: emailInput.value,
          role: roleInput.value
        });
      }

      saveUsers(); 
      form.reset();
      renderUsers();
    });

    function editUser(id) {
      if (confirm("Are you sure you want to edit this user?"))
      {
     const user = users.find(u => u.id === id);
      nameInput.value = user.name;
      emailInput.value = user.email;
      roleInput.value = user.role;
      userIdInput.value = user.id;
      editMode = true;
      }
     
    }

    function deleteUser(id) {
      if (confirm("Are you sure you want to delete this user?")) {
        users = users.filter(user => user.id !== id);
        saveUsers(); 
        renderUsers();
      }
    }

    renderUsers();

