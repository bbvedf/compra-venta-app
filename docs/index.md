## 📚 Capturas
[Volver al repositorio](https://github.com/bbvedf/compra-venta-app)

<!-- Swiper CSS -->
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css"
/>

<style>
/* Ajustes del carrusel */
.swiper-container {
  width: 100%;
  height: 90vh; /* fila principal más alta */
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
  max-height: 85%;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  cursor: zoom-in; /* indica que se puede hacer click */
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
    <div class="swiper-slide">
      <div class="swiper-zoom-container">
        <img src="images/grafana.png" alt="Grafana dashboard">
      </div>
      <div class="caption">Grafana dashboard</div>
    </div>
    <div class="swiper-slide">
      <div class="swiper-zoom-container">
        <img src="images/compose.png" alt="Docker Compose">
      </div>
      <div class="caption">Docker Compose</div>
    </div>
    <div class="swiper-slide">
      <div class="swiper-zoom-container">
        <img src="images/prometheus.png" alt="Prometheus metrics">
      </div>
      <div class="caption">Prometheus metrics</div>
    </div>
    <div class="swiper-slide">
      <div class="swiper-zoom-container">
        <img src="images/actions.png" alt="GitHub Actions">
      </div>
      <div class="caption">GitHub Actions</div>
    </div>
    <!-- resto de slides igual... -->
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
    <!-- resto de thumbs igual... -->
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
    autoplay: { delay: 5000, disableOnInteraction: false }, /* autoplay más lento */
    zoom: { maxRatio: 2 }, /* click para ampliar */
    breakpoints: {
      640: { slidesPerView: 1 },
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 }
    }
  });
});
</script>
