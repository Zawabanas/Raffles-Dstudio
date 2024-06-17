document.addEventListener("DOMContentLoaded", () => {
    const navRaffles = document.getElementById("nav-raffles");
    const navParticipants = document.getElementById("nav-participants");
    const navUsers = document.getElementById("nav-users");
    const toggleNavBtn = document.getElementById("toggleNavBtn");
    const adminNav = document.querySelector(".admin-nav");
    const createRaffleBtn = document.getElementById("createRaffleBtn");
    const rafflesList = document.getElementById("rafflesList");
    const participantsList = document.getElementById("participantsList");
    const usersList = document.getElementById("usersList");
    const createParticipantBtn = document.getElementById("createParticipantBtn");
    const createUserBtn = document.getElementById("createUserBtn");

    const sectionRaffles = document.getElementById("section-raffles");
    const sectionParticipants = document.getElementById("section-participants");
    const sectionUsers = document.getElementById("section-users");

    const socket = io();

    navRaffles.addEventListener("click", () => {
        showSection(sectionRaffles);
        loadRaffles();
    });

    navParticipants.addEventListener("click", () => {
        showSection(sectionParticipants);
        loadParticipants();
    });

    navUsers.addEventListener("click", () => {
        showSection(sectionUsers);
        loadUsers();
    });

    toggleNavBtn.addEventListener("click", () => {
        adminNav.classList.toggle("collapsed");
    });

    createRaffleBtn.addEventListener("click", () => {
        openRaffleFormPopup();
    });

    createParticipantBtn.addEventListener("click", () => {
        openParticipantFormPopup();
    });

    createUserBtn.addEventListener("click", () => {
        openUserFormPopup();
    });

    function openRaffleFormPopup(raffle = {}) {
        Swal.fire({
            title: raffle._id ? "Editar Rifa" : "Crear Nueva Rifa",
            html: `
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <label for="title">Título:</label>
                    <input type="text" id="title" name="title" class="swal2-input" required value="${raffle.title || ""}">
                    <label for="description">Descripción:</label>
                    <textarea id="description" name="description" class="swal2-textarea" required>${raffle.description || ""}</textarea>
                    <label for="startDate">Fecha de Inicio:</label>
                    <input type="date" id="startDate" name="startDate" class="swal2-input" required value="${raffle.startDate ? new Date(raffle.startDate).toISOString().split("T")[0] : ""}">
                    <label for="endDate">Fecha de Fin:</label>
                    <input type="date" id="endDate" name="endDate" class="swal2-input" required value="${raffle.endDate ? new Date(raffle.endDate).toISOString().split("T")[0] : ""}">
                    <label for="availableTickets">Boletos Disponibles:</label>
                    <input type="number" id="availableTickets" name="availableTickets" class="swal2-input" required value="${raffle.availableTickets || ""}">
                    <label for="headerImage">Imagen de Cabecera:</label>
                    <input type="text" id="headerImage" name="headerImage" class="swal2-input" value="${raffle.header_image || ""}">
                    <label for="sliderImages">Imágenes del Carrusel (separadas por comas):</label>
                    <input type="text" id="sliderImages" name="sliderImages" class="swal2-input" value="${raffle.slider_images ? raffle.slider_images.join(', ') : ""}">
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: "Guardar",
            preConfirm: () => {
                const title = document.getElementById("title").value;
                const description = document.getElementById("description").value;
                const startDate = document.getElementById("startDate").value;
                const endDate = document.getElementById("endDate").value;
                const availableTickets = document.getElementById("availableTickets").value;
                const headerImage = document.getElementById("headerImage").value;
                const sliderImages = document.getElementById("sliderImages").value.split(',').map(img => img.trim());

                if (!title || !description || !startDate || !endDate || !availableTickets) {
                    Swal.showValidationMessage("Los campos Título, Descripción, Fecha de Inicio, Fecha de Fin y Boletos Disponibles son obligatorios");
                    return false;
                }

                return {
                    title,
                    description,
                    startDate,
                    endDate,
                    availableTickets,
                    header_image: headerImage,
                    slider_images: sliderImages
                };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const data = result.value;
                if (raffle._id) {
                    updateRaffle(raffle._id, data);
                } else {
                    createRaffle(data);
                }
            }
        });
    }

    function showSection(section) {
        document.querySelectorAll(".admin-section").forEach((sec) => sec.classList.add("hidden"));
        section.classList.remove("hidden");
        section.classList.add("active");
    }

    async function loadRaffles() {
        try {
            const response = await fetch("/api/raffles");
            const raffles = await response.json();
            rafflesList.innerHTML = "";
            raffles.forEach((raffle) => {
                const startDate = new Date(raffle.startDate).toISOString().split('T')[0];
                const endDate = new Date(raffle.endDate).toISOString().split('T')[0];
                const raffleItem = document.createElement("div");
                raffleItem.className = "raffle-item";
                raffleItem.innerHTML = `
                    <div>
                        <h5>${raffle.title}</h5>
                        <img src="${raffle.header_image}" alt="Header Image" style="max-width: 300px; height: auto;">
                    </div>
                    <div>
                        <h5>Descripción</h5>
                        <span>${raffle.description}</span>
                    </div>
                    <div>
                        <h5>Fecha de inicio</h5>
                        <p>${startDate}</p>
                        <h5>Fecha de Fin</h5>
                        <p>${endDate}</p>
                    </div>
                    <div>
                        <h5>Estado</h5>
                        <select class="raffle-status" data-id="${raffle._id}">
                            <option value="inactive" ${raffle.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                            <option value="active" ${raffle.status === 'active' ? 'selected' : ''}>Active</option>
                            <option value="finished" ${raffle.status === 'finished' ? 'selected' : ''}>Finished</option>
                        </select>
                    </div>
                    <div>
                        <button class="btn edit-btn" data-id="${raffle._id}">Editar</button>
                        <button class="btn delete-btn" data-id="${raffle._id}">Eliminar</button>
                    </div>
                `;
                rafflesList.appendChild(raffleItem);
            });

            document.querySelectorAll(".raffle-status").forEach(select => {
                select.addEventListener('change', (e) => {
                    const id = e.target.getAttribute('data-id');
                    const status = e.target.value;
                    fetch(`/api/raffles/${id}/status`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ status })
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data.error) {
                                Swal.fire('Error', data.message, 'error');
                            } else {
                                Swal.fire('Éxito', 'Estado de la rifa actualizado', 'success');
                                loadRaffles();
                            }
                        });
                });
            });

            document.querySelectorAll(".edit-btn").forEach((btn) => {
                btn.addEventListener("click", async (event) => {
                    const id = event.target.getAttribute("data-id");
                    const response = await fetch(`/api/raffles/${id}`);
                    const raffle = await response.json();
                    openRaffleFormPopup(raffle);
                });
            });

            document.querySelectorAll(".delete-btn").forEach((btn) => {
                btn.addEventListener("click", (event) => {
                    const id = event.target.getAttribute("data-id");
                    deleteRaffle(id);
                });
            });
        } catch (error) {
            console.error("Error al cargar las rifas:", error);
        }
    }

    function createRaffle(data) {
        fetch("/api/raffles", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then((response) => {
                if (!response.ok) {
                    return response.json().then((errorData) => {
                        throw new Error(errorData.message || "No se pudo crear la rifa: " + response.status + " " + response.statusText);
                    });
                }
                return response.json();
            })
            .then(() => {
                loadRaffles();
                Swal.fire("Guardado!", "La rifa ha sido guardada.", "success");
            })
            .catch((error) => {
                Swal.fire("Error!", "No se pudo guardar la rifa: " + error.message, "error");
                console.error("Error:", error);
            });
    }

    function updateRaffle(id, data) {
        fetch(`/api/raffles/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error en la respuesta del servidor");
                }
                return response.json();
            })
            .then(() => {
                loadRaffles();
                Swal.fire("Actualizado!", "La rifa ha sido actualizada.", "success");
            })
            .catch((error) => {
                Swal.fire("Error!", "No se pudo actualizar la rifa.", "error");
                console.error("Error:", error);
            });
    }

    function deleteRaffle(id) {
        Swal.fire({
            title: "¿Estás seguro?",
            text: "¡No podrás revertir esto!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`/api/raffles/${id}`, {
                    method: "DELETE",
                })
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error("Error en la respuesta del servidor");
                        }
                        loadRaffles();
                        Swal.fire("Eliminado!", "La rifa ha sido eliminada.", "success");
                    })
                    .catch((error) => {
                        Swal.fire("Error!", "No se pudo eliminar la rifa.", "error");
                        console.error("Error:", error);
                    });
            }
        });
    }

    async function loadParticipants() {
        try {
            const response = await fetch("/api/participants");
            const participants = await response.json();
            participantsList.innerHTML = "";
            participants.forEach((participant) => {
                const participantItem = document.createElement("div");
                participantItem.className = "participant-item";
                const ticketNumbers = participant.tickets.map(ticket => ticket.number).join(', ');
                const raffleTitle = participant.raffle && participant.raffle.title ? participant.raffle.title : 'N/A';
                participantItem.innerHTML = `
                    <div>
                        <h5>${participant.firstName} ${participant.lastName}</h5>
                        <p>Teléfono: ${participant.phoneNumber}</p>
                        <p>Estado: ${participant.state}</p>
                        <p>Boletos: ${ticketNumbers}</p>
                        <p>Rifa: ${raffleTitle}</p>
                    </div>
                    <div>
                        <button class="btn edit-btn" data-id="${participant._id}">Editar</button>
                        <button class="btn delete-btn" data-id="${participant._id}">Eliminar</button>
                    </div>
                `;
                participantsList.appendChild(participantItem);
            });

            document.querySelectorAll(".edit-btn").forEach((btn) => {
                btn.addEventListener("click", async (event) => {
                    const id = event.target.getAttribute("data-id");
                    const response = await fetch(`/api/participants/${id}`);
                    const participant = await response.json();
                    openParticipantFormPopup(participant);
                });
            });

            document.querySelectorAll(".delete-btn").forEach((btn) => {
                btn.addEventListener("click", (event) => {
                    const id = event.target.getAttribute("data-id");
                    deleteParticipant(id);
                });
            });
        } catch (error) {
            console.error("Error al cargar los participantes:", error);
        }
    }

    async function openParticipantFormPopup(participant = {}) {
        try {
            Swal.fire({
                title: participant._id ? "Editar Participante" : "Agregar Participante",
                html: `
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <label for="firstName">Nombre:</label>
                        <input type="text" id="firstName" name="firstName" class="swal2-input" required value="${participant.firstName || ""}">
                        <label for="lastName">Apellidos:</label>
                        <input type="text" id="lastName" name="lastName" class="swal2-input" required value="${participant.lastName || ""}">
                        <label for="phoneNumber">Teléfono:</label>
                        <input type="text" id="phoneNumber" name="phoneNumber" class="swal2-input" required value="${participant.phoneNumber || ""}">
                        <label for="state">Estado:</label>
                        <input type="text" id="state" name="state" class="swal2-input" required value="${participant.state || ""}">
                        <label for="tickets">Boletos (separados por comas):</label>
                        <input type="text" id="tickets" name="tickets" class="swal2-input" required value="${participant.tickets ? participant.tickets.map(ticket => ticket.number).join(', ') : ""}">
                        <label for="raffle">Rifa:</label>
                        <input type="text" id="raffle" name="raffle" class="swal2-input" readonly value="${participant.raffle ? participant.raffle.title : ""}">
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: "Guardar",
                preConfirm: () => {
                    const firstName = document.getElementById("firstName").value;
                    const lastName = document.getElementById("lastName").value;
                    const phoneNumber = document.getElementById("phoneNumber").value;
                    const state = document.getElementById("state").value;
                    const tickets = document.getElementById("tickets").value.split(',').map(ticket => ticket.trim());
                    const raffle = participant.raffle ? participant.raffle._id : document.getElementById("raffle").value;

                    if (!firstName || !lastName || !phoneNumber || !state || !tickets || !raffle) {
                        Swal.showValidationMessage("Todos los campos son obligatorios");
                        return false;
                    }

                    return {
                        firstName,
                        lastName,
                        phoneNumber,
                        state,
                        tickets,
                        raffle
                    };
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    const data = result.value;
                    if (participant._id) {
                        updateParticipant(participant._id, data);
                    } else {
                        createParticipant(data);
                    }
                }
            });
        } catch (error) {
            console.error("Error al cargar las rifas activas:", error);
            Swal.fire("Error", "No se pudo cargar las rifas activas.", "error");
        }
    }

    async function createParticipant(data) {
        try {
            const response = await fetch("/api/participants/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error("Error al crear el participante");
            }
            loadParticipants();
            Swal.fire("Guardado!", "El participante ha sido guardado.", "success");
        } catch (error) {
            Swal.fire("Error!", "No se pudo guardar el participante: " + error.message, "error");
            console.error("Error:", error);
        }
    }

    async function updateParticipant(id, data) {
        try {
            const response = await fetch(`/api/participants/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error("Error al actualizar el participante");
            }
            loadParticipants();
            Swal.fire("Actualizado!", "El participante ha sido actualizado.", "success");
        } catch (error) {
            Swal.fire("Error!", "No se pudo actualizar el participante: " + error.message, "error");
            console.error("Error:", error);
        }
    }

    async function deleteParticipant(id) {
        Swal.fire({
            title: "¿Estás seguro?",
            text: "¡No podrás revertir esto!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`/api/participants/${id}`, {
                    method: "DELETE",
                })
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error("Error al eliminar el participante");
                        }
                        loadParticipants();
                        Swal.fire("Eliminado!", "El participante ha sido eliminado.", "success");
                    })
                    .catch((error) => {
                        Swal.fire("Error!", "No se pudo eliminar el participante: " + error.message, "error");
                        console.error("Error:", error);
                    });
            }
        });
    }

    async function loadUsers() {
        try {
            const response = await fetch("/api/users", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error al cargar los usuarios");
            }

            const users = await response.json();
            if (!Array.isArray(users)) {
                throw new Error("La respuesta del servidor no es un arreglo de usuarios");
            }

            usersList.innerHTML = "";
            users.forEach((user) => {
                const userItem = document.createElement("div");
                userItem.className = "user-item";
                userItem.innerHTML = `
                    <div>
                        <h5>${user.firstName} ${user.lastName}</h5>
                        <p>Email: ${user.email}</p>
                        <p>Teléfono: ${user.phone}</p>
                        <p>Rol: ${user.role}</p>
                        <p>Estado: ${user.active ? 'Activo' : 'Inactivo'}</p>
                    </div>
                    <div>
                        <button class="btn edit-btn" data-id="${user._id}">Editar</button>
                        <button class="btn toggle-status-btn" data-id="${user._id}" data-active="${user.active}">${user.active ? 'Desactivar' : 'Activar'}</button>
                        ${user.role === 'admin' ? '<button class="btn delete-btn" data-id="' + user._id + '">Eliminar</button>' : ''}
                    </div>
                `;
                usersList.appendChild(userItem);
            });

            document.querySelectorAll(".edit-btn").forEach((btn) => {
                btn.addEventListener("click", async (event) => {
                    const id = event.target.getAttribute("data-id");
                    const response = await fetch(`/api/users/${id}`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                            "Content-Type": "application/json"
                        }
                    });
                    const user = await response.json();
                    openUserFormPopup(user);
                });
            });

            document.querySelectorAll(".delete-btn").forEach((btn) => {
                btn.addEventListener("click", (event) => {
                    const id = event.target.getAttribute("data-id");
                    deleteUser(id);
                });
            });

            document.querySelectorAll(".toggle-status-btn").forEach((btn) => {
                btn.addEventListener("click", (event) => {
                    const id = event.target.getAttribute("data-id");
                    const active = event.target.getAttribute("data-active") === 'true';
                    toggleUserStatus(id, !active);
                });
            });
        } catch (error) {
            console.error("Error al cargar los usuarios:", error);
            Swal.fire("Error", "No se pudieron cargar los usuarios: " + error.message, "error");
        }
    }


    function openUserFormPopup(user = {}) {
        Swal.fire({
            title: user._id ? "Editar Usuario" : "Agregar Usuario",
            html: `
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <label for="firstName">Nombre:</label>
                    <input type="text" id="firstName" name="firstName" class="swal2-input" required value="${user.firstName || ""}">
                    <label for="lastName">Apellidos:</label>
                    <input type="text" id="lastName" name="lastName" class="swal2-input" required value="${user.lastName || ""}">
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" class="swal2-input" required value="${user.email || ""}">
                    <label for="phone">Teléfono:</label>
                    <input type="text" id="phone" name="phone" class="swal2-input" value="${user.phone || ""}">
                    <label for="role">Rol:</label>
                    <select id="role" name="role" class="swal2-input" required>
                        <option value="user" ${user.role === 'user' ? 'selected' : ''}>Usuario</option>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                    <label for="password">Contraseña:</label>
                    <input type="password" id="password" name="password" class="swal2-input" ${user._id ? '' : 'required'}>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: "Guardar",
            preConfirm: () => {
                const firstName = document.getElementById("firstName").value;
                const lastName = document.getElementById("lastName").value;
                const email = document.getElementById("email").value;
                const phone = document.getElementById("phone").value;
                const role = document.getElementById("role").value;
                const password = document.getElementById("password").value;

                if (!firstName || !lastName || !email || !role || (user._id && !password)) {
                    Swal.showValidationMessage("Todos los campos son obligatorios");
                    return false;
                }

                return {
                    firstName,
                    lastName,
                    email,
                    phone,
                    role,
                    password
                };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const data = result.value;
                if (user._id) {
                    updateUser(user._id, data);
                } else {
                    createUser(data);
                }
            }
        });
    }

    async function createUser(data) {
        try {
            const response = await fetch("/api/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error("Error al crear el usuario");
            }
            loadUsers();
            Swal.fire("Guardado!", "El usuario ha sido guardado.", "success");
        } catch (error) {
            Swal.fire("Error!", "No se pudo guardar el usuario: " + error.message, "error");
            console.error("Error:", error);
        }
    }

    async function updateUser(id, data) {
        try {
            const response = await fetch(`/api/users/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error("Error al actualizar el usuario");
            }
            loadUsers();
            Swal.fire("Actualizado!", "El usuario ha sido actualizado.", "success");
        } catch (error) {
            Swal.fire("Error!", "No se pudo actualizar el usuario: " + error.message, "error");
            console.error("Error:", error);
        }
    }

    async function toggleUserStatus(id, isActive) {
        try {
            const response = await fetch(`/api/users/${id}/toggleStatus`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ active: isActive }),
            });
            if (!response.ok) {
                throw new Error("Error al actualizar el estado del usuario");
            }
            loadUsers();
            Swal.fire("Actualizado!", "El estado del usuario ha sido actualizado.", "success");
        } catch (error) {
            Swal.fire("Error!", "No se pudo actualizar el estado del usuario: " + error.message, "error");
            console.error("Error:", error);
        }
    }

    function deleteUser(id) {
        Swal.fire({
            title: "¿Estás seguro?",
            text: "¡No podrás revertir esto!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`/api/users/${id}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "application/json"
                    }
                })
                    .then((response) => {
                        if (!response.ok) {
                            return response.json().then((error) => {
                                throw new Error(error.message || "Error al eliminar el usuario");
                            });
                        }
                        return response.json();
                    })
                    .then(() => {
                        loadUsers();
                        Swal.fire("Eliminado!", "El usuario ha sido eliminado.", "success");
                    })
                    .catch((error) => {
                        Swal.fire("Error!", "No se pudo eliminar el usuario: " + error.message, "error");
                        console.error("Error:", error);
                    });
            }
        });
    }

    document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", (event) => {
            const id = event.target.getAttribute("data-id");
            deleteUser(id);
        });
    });


    socket.on("raffleCreated", () => {
        loadRaffles();
    });

    socket.on("raffleUpdated", () => {
        loadRaffles();
    });

    socket.on("raffleDeleted", () => {
        loadRaffles();
    });

    if (window.innerWidth <= 850) {
        adminNav.classList.add('collapsed');
    }

    loadRaffles(); // Cargar las rifas al inicio
    loadParticipants(); // Cargar los participantes al inicio
    loadUsers(); // Cargar los usuarios al inicio
});
