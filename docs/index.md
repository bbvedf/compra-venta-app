## 📸 Capturas
[Volver al repositorio](https://github.com/bbvedf/compra-venta-app)

<!-- Swiper CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css" />

<style>
/* Ajustes del carrusel */
.swiper-container {
  width: 100%;
  max-width: 1200px; /* Limita el ancho máximo */
  height: auto; /* Cambiado de 90vh a auto para adaptarse al contenido */
  margin: 20px auto;
  padding-bottom: 20px;
}
.swiper-slide {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: auto; /* Ajusta la altura dinámicamente */
}
.swiper-slide img {
  max-width: 90%;
  max-height: 500px; /* Limita la altura máxima de la imagen */
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  cursor: pointer; /* Cambiado a pointer para mejor claridad */
  transition: transform 0.3s ease; /* Suaviza el zoom */
}
.swiper-slide img:hover {
  transform: scale(1.05); /* Efecto hover para indicar interactividad */
}
.caption {
  margin-top: 10px; /* Reducido para acercar el pie de foto */
  font-size: 1rem; /* Ligeramente más grande para legibilidad */
  color: #333;
  text-align: center;
}
.swiper-thumbs {
  height: 120px; /* Aumentado para mejor visibilidad */
  box-sizing: border-box;
  padding: 10px 0;
}
.swiper-thumbs .swiper-slide {
  width: auto;
  height: 100%;
  opacity: 0.6; /* Aumentado para mejor contraste */
  cursor: pointer;
}
.swiper-thumbs .swiper-slide-thumb-active {
  opacity: 1;
  border: 2px solid #007bff; /* Indicador visual para la miniatura activa */
}
.swiper-thumbs img {
  height: 100px; /* Aumentado para mejor proporción */
  object-fit: cover;
  border-radius: 4px;
}
.swiper-button-next,
.swiper-button-prev {
  color: #007bff; /* Color más visible para las flechas */
}
</style>

<!-- Swiper HTML -->
<div class="swiper-container mainSwiper">
  <div class="swiper-wrapper">
    <div class="swiper-slide"><div class="swiper-zoom-container"><img src="images/grafana.png" alt="Grafana dashboard"></div><div class="caption">Grafana dashboard</div></div>
    <div class="swiper-slide"><div class="swiper-zoom-container"><img src="images/compose.png" alt="Docker Compose"></div><div class="caption">Docker Compose</div></div>
    <div class="swiper-slide"><div class="swiper-zoom-container"><img src="images/prometheus.png" alt="Prometheus metrics"></div><div class="caption">Prometheus metrics</div></div>
    <div class="swiper-slide"><div class="swiper-zoom-container"><img src="images/actions.png" alt="GitHub Actions"></div><div class="caption">GitHub Actions</div></div>
    <div class="swiper-slide"><div class="swiper-zoom-container"><img src="images/sonarcloud.png" alt="SonarCloud"></div><div class="caption">SonarCloud</div></div>
    <div class="swiper-slide"><div class="swiper-zoom-container"><img src="images/ide.png" alt="IDE"></div><div class="caption">IDE</div></div>
    <div class="swiper-slide"><div class="swiper-zoom-container"><img src="images/login.png" alt="Pantalla login"></div><div class="caption">Pantalla login</div></div>
    <div class="swiper-slide"><div class="swiper-zoom-container"><img src="images/basic_dashboard.png" alt="Dashboard básico"></div><div class="caption">Dashboard básico</div></div>
    <div class="swiper-slide"><div class="swiper-zoom-container"><img src="images/pending_approval.png" alt="Login pendiente de aprobación"></div><div class="caption">Login pendiente de aprobación</div></div>
    <div class="swiper-slide"><div class="swiper-zoom-container"><img src="images/admin_dashboard.png" alt="Dashboard admin"></div><div class="caption">Dashboard admin</div></div>
    <div class="swiper-slide"><div class="swiper-zoom-container"><img src="images/user_management.png" alt="Gestión de usuarios"></div><div class="caption">Gestión de usuarios</div></div>
    <div class="swiper-slide"><div class="swiper-zoom-container"><img src="images/ci_calc.png" alt="Calculadora interés compuesto"></div><div class="caption">Calculadora interés compuesto</div></div>
    <div class="swiper-slide"><div class="swiper-zoom-container"><img src="images/ma_calc.png" alt="Calculadora amortización"></div><div class="caption">Calculadora amortización</div></div>
    <div class="swiper-slide"><div class="swiper-zoom-container"><img src="images/light_style.png" alt="Estilo claro"></div><div class="caption">Estilo claro</div></div>
  </div>
  <!-- Navigation -->
  <div class="swiper-button-next"></div>
  <div class="swiper-button-prev"></div>
  <div class="swiper-pagination"></div>
</div>

<!-- Thumbnails -->
<div class="swiper-container swiper-thumbs">
  <div class="swiper-wrapper">
    <div class="swiper-slide"><img src="images/grafana.png" alt="Grafana dashboard"></div>
    <div class="swiper-slide"><img src="images/compose.png" alt="Docker Compose"></div>
    <div class="swiper-slide"><img src="images/prometheus.png" alt="Prometheus metrics"></div>
    <div class="swiper-slide"><img src="images/actions.png" alt="GitHub Actions"></div>
    <div class="swiper-slide"><img src="images/sonarcloud.png" alt="SonarCloud"></div>
    <div class="swiper-slide"><img src="images/ide.png" alt="IDE"></div>
    <div class="swiper-slide"><img src="images/login.png" alt="Pantalla login"></div>
    <div class="swiper-slide"><img src="images/basic_dashboard.png" alt="Dashboard básico"></div>
    <div class="swiper-slide"><img src="images/pending_approval.png" alt="Login pendiente de aprobación"></div>
    <div class="swiper-slide"><img src="images/admin_dashboard.png" alt="Dashboard admin"></div>
    <div class="swiper-slide"><img src="images/user_management.png" alt="Gestión de usuarios"></div>
    <div class="swiper-slide"><img src="images/ci_calc.png" alt="Calculadora interés compuesto"></div>
    <div class="swiper-slide"><img src="images/ma_calc.png" alt="Calculadora amortización"></div>
    <div class="swiper-slide"><img src="images/light_style.png" alt="Estilo claro"></div>
  </div>
</div>

<!-- Swiper JS -->
<script src="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js"></script>
<script>
document.addEventListener("DOMContentLoaded", function() {
  const thumbsSwiper = new Swiper('.swiper-thumbs', {
    spaceBetween: 10,
    slidesPerView: 4, /* Reducido para mejor visualización en pantallas pequeñas */
    freeMode: true,
    watchSlidesProgress: true,
    breakpoints: {
      640: { slidesPerView: 3 },
      768: { slidesPerView: 4 },
      1024: { slidesPerView: 5 }
    }
  });

  const mainSwiper = new Swiper('.mainSwiper', {
    loop: true,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev'
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true
    },
    thumbs: {
      swiper: thumbsSwiper
    },
    spaceBetween: 20, /* Reducido para mejor espaciado */
    slidesPerView: 1, /* Solo una imagen en el carrusel principal */
    centeredSlides: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    },
    zoom: {
      maxRatio: 2, /* Aumentado para un zoom más notable */
      toggle: true /* Habilita zoom con un solo clic */
    }
  });

  // Manejo manual del zoom para mejorar la experiencia
  mainSwiper.on('click', function(swiper, event) {
    if (event.target.tagName === 'IMG') {
      swiper.zoom.toggle(); /* Alterna zoom con un solo clic */
    }
  });
});
</script>