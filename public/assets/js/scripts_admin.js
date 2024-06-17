document.addEventListener('DOMContentLoaded', function () {
    const socket = io.connect("http://localhost:3000", { forceNew: true });

    socket.on('connect', () => {
        console.log('Conectado al servidor de Socket.IO');
    });

    socket.on('disconnect', () => {
        console.log('Desconectado del servidor de Socket.IO');
    });

    socket.on('responseEvent', (data) => {
        console.log('Evento de respuesta recibido:', data);
    });

    socket.emit('customEvent', { message: 'Hola desde el cliente' });

    const loginForm = document.querySelector('#loginForm');
    const emailInput = document.querySelector('#loginEmail');
    const passwordInput = document.querySelector('#loginPassword');
    const rememberMeCheckbox = document.querySelector('#rememberMe');
    const forgotPasswordButton = document.querySelector('#forgotPassword');

    if (localStorage.getItem('rememberMe') === 'true') {
        emailInput.value = localStorage.getItem('email');
        passwordInput.value = localStorage.getItem('password');
        rememberMeCheckbox.checked = true;
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const email = emailInput.value;
            const password = passwordInput.value;

            try {
                const response = await fetch('/api/users/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('token', data.token);

                    if (rememberMeCheckbox.checked) {
                        localStorage.setItem('email', email);
                        localStorage.setItem('password', password);
                        localStorage.setItem('rememberMe', true);
                    } else {
                        localStorage.removeItem('email');
                        localStorage.removeItem('password');
                        localStorage.removeItem('rememberMe');
                    }

                    Swal.fire({
                        icon: 'success',
                        title: 'Login exitoso',
                        text: 'Redirigiendo...',
                        showConfirmButton: false,
                        timer: 1500,
                        willClose: () => {
                            window.location.href = '/admin-page';
                        }
                    });
                } else {
                    const errorData = await response.json();
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: errorData.message,
                    });
                }
            } catch (error) {
                console.error('Error al iniciar sesión:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Hubo un error al intentar iniciar sesión. Inténtalo de nuevo más tarde.',
                });
            }
        });
    }

    // Manejo del botón "Olvidé mi contraseña"
    if (forgotPasswordButton) {
        forgotPasswordButton.addEventListener('click', async function (event) {
            event.preventDefault();

            const { value: email } = await Swal.fire({
                title: 'Recuperar contraseña',
                input: 'email',
                inputLabel: 'Por favor, ingresa tu correo electrónico',
                inputPlaceholder: 'Correo electrónico',
                showCancelButton: true,
                confirmButtonText: 'Enviar',
                cancelButtonText: 'Cancelar'
            });

            if (email) {
                try {
                    const response = await fetch('/api/users/forgot-password', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ email })
                    });

                    if (response.ok) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Correo enviado',
                            text: 'Se ha enviado un correo para restablecer tu contraseña.',
                        });
                    } else {
                        const errorData = await response.json();
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: errorData.message,
                        });
                    }
                } catch (error) {
                    console.error('Error al enviar correo de recuperación:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Hubo un error al intentar enviar el correo de recuperación. Inténtalo de nuevo más tarde.',
                    });
                }
            }
        });
    }
});
document.addEventListener('DOMContentLoaded', function () {
    const resetPasswordForm = document.querySelector('#resetPasswordForm');
    const newPasswordInput = document.querySelector('#newPassword');
    const confirmPasswordInput = document.querySelector('#confirmPassword');
    const errorMessage = document.querySelector('#errorMessage');

    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const newPassword = newPasswordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');

            if (!newPassword || !confirmPassword) {
                errorMessage.style.display = 'block';
                errorMessage.textContent = 'Todos los campos son obligatorios';
                return;
            }

            if (newPassword !== confirmPassword) {
                errorMessage.style.display = 'block';
                errorMessage.textContent = 'Las contraseñas no coinciden';
                return;
            }

            try {
                const response = await fetch('/api/users/reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ token, newPassword })
                });

                if (response.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Contraseña Restablecida',
                        text: 'Tu contraseña ha sido restablecida exitosamente.',
                        showConfirmButton: false,
                        timer: 1500,
                        willClose: () => {
                            window.location.href = '/login-page';
                        }
                    });
                } else {
                    const errorData = await response.json();
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: errorData.message,
                    });
                }
            } catch (error) {
                console.error('Error al restablecer la contraseña:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Hubo un error al intentar restablecer la contraseña. Inténtalo de nuevo más tarde.',
                });
            }
        });
    }
});

