$(document).ready(function () {
    const selectedTickets = [];
    let raffle; // Definir la variable raffle en un alcance superior

    // Obtener datos de la rifa activa
    $.get('/api/raffles/active', function (data) {
        raffle = data; // Asignar los datos de la rifa a la variable raffle
        const ticketsContainer = $('#ticketsContainer');
        const selectedTicketsContainer = $('#selectedTicketsContainer');
        const selectedTicketsList = $('#selectedTickets');
        const availableTickets = raffle.availableTickets;

        // Renderizar datos de la rifa
        $('#raffleTitle').text(raffle.title);
        $('#raffleDescription').text(raffle.description);
        $('#raffleDate').text(new Date(raffle.endDate).toLocaleDateString());
        $('#raffleImage').attr('src', raffle.header_image);

        // Renderizar imágenes del carrusel
        raffle.slider_images.forEach((image, index) => {
            const isActive = index === 0 ? 'active' : '';
            const carouselItem = `
                <div class="carousel-item ${isActive}">
                    <img src="${image}" class="d-block w-100" alt="Imagen ${index + 1}">
                    <div class="carousel-caption d-none d-md-block">
                        <h5>Imagen ${index + 1}</h5>
                    </div>
                </div>`;
            $('#carouselInner').append(carouselItem);

            const indicator = `<li data-target="#carouselExampleIndicators" data-slide-to="${index}" class="${isActive}"></li>`;
            $('#carouselIndicators').append(indicator);
        });

        // Renderizar boletos disponibles
        for (let i = 0; i < availableTickets; i++) {
            const ticket = $('<div class="ticket"></div>').text(i + 1);
            ticket.on('click', function () {
                const ticketNumber = $(this).text();
                if ($(this).hasClass('selected')) {
                    $(this).removeClass('selected');
                    const index = selectedTickets.indexOf(ticketNumber);
                    if (index > -1) {
                        selectedTickets.splice(index, 1);
                    }
                } else {
                    $(this).addClass('selected');
                    selectedTickets.push(ticketNumber);
                }
                updateSelectedTickets();
            });
            ticketsContainer.append(ticket);
        }

        function updateSelectedTickets() {
            if (selectedTickets.length > 0) {
                selectedTicketsContainer.show();
            } else {
                selectedTicketsContainer.hide();
            }

            selectedTicketsList.empty();
            selectedTickets.forEach(ticket => {
                const ticketDiv = $('<div class="ticket"></div>').text(ticket);
                ticketDiv.on('click', function () {
                    const index = selectedTickets.indexOf(ticket);
                    if (index > -1) {
                        selectedTickets.splice(index, 1);
                        $(`.ticket:contains(${ticket})`).removeClass('selected');
                        updateSelectedTickets();
                    }
                });
                selectedTicketsList.append(ticketDiv);
            });
        }
    }).fail(function (jqXHR, textStatus, errorThrown) {
        console.error('Error en la solicitud:', textStatus, errorThrown);
    });

    $('#buyButton').on('click', function () {
        const totalPrice = selectedTickets.length * 19;
        const selectedTicketsHtml = selectedTickets.map(ticket => `<li>${ticket}</li>`).join('');

        Swal.fire({
            title: 'Formulario de Registro',
            html: `
                <form id="purchaseForm">
                    <div class="form-group">
                        <label for="phone">Teléfono:</label>
                        <input type="text" id="phone" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="firstName">Nombre:</label>
                        <input type="text" id="firstName" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="lastName">Apellidos:</label>
                        <input type="text" id="lastName" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="state">Seleccione Estado</label>
                        <select id="state" class="form-control" required>
                            <option value="">Seleccione un estado</option>
                            <option value="Aguascalientes">Aguascalientes</option>
                            <option value="Baja California">Baja California</option>
                            <option value="Baja California Sur">Baja California Sur</option>
                            <option value="Campeche">Campeche</option>
                            <option value="Chiapas">Chiapas</option>
                            <option value="Chihuahua">Chihuahua</option>
                            <option value="Ciudad de México">Ciudad de México</option>
                            <option value="Coahuila">Coahuila</option>
                            <option value="Colima">Colima</option>
                            <option value="Durango">Durango</option>
                            <option value="Estado de México">Estado de México</option>
                            <option value="Guanajuato">Guanajuato</option>
                            <option value="Guerrero">Guerrero</option>
                            <option value="Hidalgo">Hidalgo</option>
                            <option value="Jalisco">Jalisco</option>
                            <option value="Michoacán">Michoacán</option>
                            <option value="Morelos">Morelos</option>
                            <option value="Nayarit">Nayarit</option>
                            <option value="Nuevo León">Nuevo León</option>
                            <option value="Oaxaca">Oaxaca</option>
                            <option value="Puebla">Puebla</option>
                            <option value="Querétaro">Querétaro</option>
                            <option value="Quintana Roo">Quintana Roo</option>
                            <option value="San Luis Potosí">San Luis Potosí</option>
                            <option value="Sinaloa">Sinaloa</option>
                            <option value="Sonora">Sonora</option>
                            <option value="Tabasco">Tabasco</option>
                            <option value="Tamaulipas">Tamaulipas</option>
                            <option value="Tlaxcala">Tlaxcala</option>
                            <option value="Veracruz">Veracruz</option>
                            <option value="Yucatán">Yucatán</option>
                            <option value="Zacatecas">Zacatecas</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="totalPrice">Precio Total:</label>
                        <input type="text" id="totalPrice" class="form-control" value="${totalPrice} MXN" readonly>
                    </div>
                    <div class="form-group">
                        <label>Boletos Seleccionados:</label>
                        <ul>${selectedTicketsHtml}</ul>
                    </div>
                </form>`,
            confirmButtonText: '<i class="fab fa-whatsapp"></i> Enviar',
            preConfirm: () => {
                const phone = Swal.getPopup().querySelector('#phone').value;
                const firstName = Swal.getPopup().querySelector('#firstName').value;
                const lastName = Swal.getPopup().querySelector('#lastName').value;
                const state = Swal.getPopup().querySelector('#state').value;
                if (!phone || !firstName || !lastName || !state) {
                    Swal.showValidationMessage(`Por favor complete todos los campos`);
                }
                return { phone, firstName, lastName, state }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const participantData = {
                    firstName: result.value.firstName,
                    lastName: result.value.lastName,
                    phoneNumber: result.value.phone,
                    state: result.value.state,
                    raffle: raffle._id, // Asegúrate de que raffle esté disponible aquí
                    tickets: selectedTickets
                };

                console.log('Enviando datos del participante:', participantData); // Agregar una depuración aquí

                // Aquí enviamos los datos al servidor
                $.ajax({
                    url: '/api/participants/create',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(participantData),
                    success: function (response) {
                        console.log('Respuesta del servidor:', response); // Verificar respuesta del servidor
                        const message = `
                            Hola, aparté los boletos de la rifa!!
                            Modelo y marca de automóvil!!
                            ----------------------------------
                            Número (cantidad) de boletos que compré (aparté): ${selectedTickets.length}
                            Número de boleto (serial del boleto seleccionado): ${selectedTickets.join(', ')}

                            Nombre: ${result.value.firstName} ${result.value.lastName}
                            Estado: ${result.value.state}

                            Más información:
                            Información de cuentas de pago

                            El siguiente paso es enviar la foto del comprobante de pago por aquí.
                        `;
                        const whatsappUrl = `https://wa.me/6391503503?text=${encodeURIComponent(message)}`;
                        window.open(whatsappUrl, '_blank');
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        Swal.fire('Error', 'Hubo un problema al procesar su solicitud.', 'error');
                        console.error('Error en la solicitud:', jqXHR.responseText); // Verificar respuesta del servidor
                    }
                });
            }
        });
    });
});
