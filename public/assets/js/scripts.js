


window.addEventListener("scroll", function() {
    var header = document.querySelector("header");
    header.classList.toggle("abajo", window.scrollY > 0);
});

document.addEventListener("DOMContentLoaded", function() {
    var navbarToggle = document.querySelector(".navbar-toggler");
    var header = document.querySelector("header");

    navbarToggle.addEventListener("click", function() {
        header.classList.toggle("expand", navbarToggle.getAttribute("aria-expanded") === "false");
    });

   
    window.addEventListener("scroll", function() {
        header.classList.toggle("expand", window.scrollY > 0 && !navbarToggle.getAttribute("aria-expanded"));
    });
});

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

  $(document).ready(function() {
    $('.navbar-toggler').on('click', function() {
      var $navbar = $(this).closest('.navbar');
      $navbar.toggleClass('navbar-light navbar-dark  ');
    });
  });

  $(document).ready(function() {
    $('.carousel-control-prev').click(function() {
      $('#carouselExampleIndicators').carousel('prev');
      return false;
    });

    $('.carousel-control-next').click(function() {
      $('#carouselExampleIndicators').carousel('next');
      return false;
    });
  });

  const select = document.querySelector('#select');
  const opciones = document.querySelector('#opciones');
  const contenidoSelect = document.querySelector('#select .contenido-select');
  const hiddenInput = document.querySelector('#inputSelect');
  
  document.querySelectorAll('#opciones > .opcion').forEach((opcion) => {
      opcion.addEventListener('click', (e) => {
          e.preventDefault();
          contenidoSelect.innerHTML = e.currentTarget.innerHTML;
          select.classList.toggle('active');
          opciones.classList.toggle('active');
          hiddenInput.value = e.currentTarget.querySelector('.titulo').innerText;
      });
  });
  
  document.addEventListener('DOMContentLoaded', () => {
    const select = document.querySelector('.select');
    const opciones = document.querySelector('.opciones');

    if (select && opciones) {
        select.addEventListener('click', () => {
            select.classList.toggle('active');
            opciones.classList.toggle('active');
        });
    } else {
        console.error('Elementos no encontrados');
    }
});


