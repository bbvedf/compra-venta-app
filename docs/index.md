# Compra-Venta App - Capturas

Bienvenido a la galería de capturas de la aplicación.  
Aquí puedes navegar entre todas las vistas principales del sistema.

<!-- Swiper CSS -->
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css"
/>

<style>
/* Ajustes del carrusel */
.swiper-container {
  width: 100%;
  height: 70vh;
  margin: 20px auto;
}
.swiper-slide {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.swiper-slide img {
  max-width: 90%;
  max-height: 60%;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}
.caption {
  margin-top: 6px;
  font-size: 0.9rem;
  color: #333;
  text-align: center;
}
.swiper-thumbs {
  height: 100px;
  box-sizing: border-box;
  padding: 10px 0;
}
.swiper-thumbs .swiper-slide {
  width: auto;
  height: 100%;
  opacity: 0.4;
  cursor: pointer;
}
.swiper-thumbs .swiper-slide-thumb-active {
  opacity: 1;
}
.swiper-thumbs img {
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}
</style>

<!-- Swiper HTML -->
<div class="swiper-container mainSwiper">
  <div class="swiper-wrapper">
    <div class="swiper-slide"><img src="images/grafana.png" alt="Grafana dashboard"><div class="caption">Grafana dashboard</div></div>
    <div class="swiper-slide"><img src="images/compose.png" alt="Docker Compose"><div class="caption">Docker Compose</div></div>
    <div class="swiper-slide"><img src="images/prometheus.png" alt="Prometheus metrics"><div class="caption">Prometheus metrics</div></div>
    <div class="swiper-slide"><img src="images/actions.png" alt="GitHub Actions"><div class="caption">GitHub Actions</div></div>
    <div class="swiper-slide"><img src="images/sonarcloud.png" alt="SonarCloud"><div class="caption">SonarCloud</div></div>
    <div class="swiper-slide"><img src="images/ide.png" alt="IDE"><div class="caption">IDE</div></div>
    <div class="swiper-slide"><img src="images/login.png" alt="Pantalla login"><div class="caption">Pantalla login</div></div>
    <div class="swiper-slide"><img src="images/basic_dashboard.png" alt="Dashboard básico"><div class="caption">Dashboard básico</div></div>
    <div class="swiper-slide"><img src="images/pending_approval.png" alt="Login pendiente de aprobación"><div class="caption">Login pendiente de aprobación</div></div>
    <div class="swiper-slide"><img src="images/admin_dashboard.png" alt="Dashboard admin"><div class="caption">Dashboard admin</div></div>
    <div class="swiper-slide"><img src="images/user management.png" alt="Gestión de usuarios"><div class="caption">Gestión de usuarios</div></div>
    <div class="swiper-slide"><img src="images/ci_calc.png" alt="Calculadora interés compuesto"><div class="caption">Calculadora interés compuesto</div></div>
    <div class="swiper-slide"><img src="images/ma_calc.png" alt="Calculadora amortización"><div class="caption">Calculadora amortización</div></div>
    <div class="swiper-slide"><img src="images/light_style.png" alt="Estilo claro"><div class="caption">Estilo claro</div></div>
  </div>
  <!-- Navigation -->
  <div class="swiper-button-next"></div>
  <div class="swiper-button-prev"></div>
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
    <div class="swiper-slide"><img src="images/user management.png" alt="Gestión de usuarios"></div>
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
    slidesPerView: 6,
    freeMode: true,
    watchSlidesProgress: true,
    breakpoints: {
      640: { slidesPerView: 4 },
      768: { slidesPerView: 5 },
      1024: { slidesPerView: 6 }
    }
  });

  const mainSwiper = new Swiper('.mainSwiper', {
    loop: true,
    navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
    pagination: { el: '.swiper-pagination', clickable: true },
    thumbs: { swiper: thumbsSwiper },
    centeredSlides: true,
    spaceBetween: 30,
    slidesPerView: 1,
    autoplay: { delay: 3000, disableOnInteraction: false },
    breakpoints: {
      640: { slidesPerView: 1 },
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 }
    }
  });
});
</script>
