## 📚 Capturas
[Volver al repositorio](https://github.com/bbvedf/compra-venta-app)

<style>
/* Swiper general */
.swiper {
  width: 100%;
  height: 80vh;
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
  max-height: 70%;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  cursor: pointer;
}
.caption {
  margin-top: 8px;
  font-size: 0.9rem;
  color: #333;
  text-align: center;
}
/* Miniaturas */
.swiper-slide-thumb-active {
  border: 2px solid #007acc;
}
.swiper-zoom-container {
  width: 100%;
  height: 100%;
}
</style>

<div class="swiper mySwiper">
  <div class="swiper-wrapper">

    <div class="swiper-slide">
      <div class="swiper-zoom-container">
        ![Grafana dashboard](images/grafana.png)
      </div>
      <div class="caption">Grafana dashboard</div>
    </div>

    <div class="swiper-slide">
      <div class="swiper-zoom-container">
        ![Docker Compose](images/compose.png)
      </div>
      <div class="caption">Docker Compose</div>
    </div>

    <div class="swiper-slide">
      <div class="swiper-zoom-container">
        ![Prometheus metrics](images/prometheus.png)
      </div>
      <div class="caption">Prometheus metrics</div>
    </div>

    <div class="swiper-slide">
      <div class="swiper-zoom-container">
        ![GitHub Actions](images/actions.png)
      </div>
      <div class="caption">GitHub Actions</div>
    </div>

    <div class="swiper-slide">
      <div class="swiper-zoom-container">
        ![SonarCloud](images/sonarcloud.png)
      </div>
      <div class="caption">SonarCloud</div>
    </div>

    <div class="swiper-slide">
      <div class="swiper-zoom-container">
        ![IDE](images/ide.png)
      </div>
      <div class="caption">IDE</div>
    </div>

    <div class="swiper-slide">
      <div class="swiper-zoom-container">
        ![Pantalla login](images/login.png)
      </div>
      <div class="caption">Pantalla login</div>
    </div>

    <div class="swiper-slide">
      <div class="swiper-zoom-container">
        ![Dashboard básico](images/basic_dashboard.png)
      </div>
      <div class="caption">Dashboard básico</div>
    </div>

    <div class="swiper-slide">
      <div class="swiper-zoom-container">
        ![Login pendiente de aprobación](images/pending_approval.png)
      </div>
      <div class="caption">Login pendiente de aprobación</div>
    </div>

    <div class="swiper-slide">
      <div class="swiper-zoom-container">
        ![Dashboard admin](images/admin_dashboard.png)
      </div>
      <div class="caption">Dashboard admin</div>
    </div>

    <div class="swiper-slide">
      <div class="swiper-zoom-container">
        ![Gestión de usuarios](images/user_management.png)
      </div>
      <div class="caption">Gestión de usuarios</div>
    </div>

    <div class="swiper-slide">
      <div class="swiper-zoom-container">
        ![Calculadora interés compuesto](images/ci_calc.png)
      </div>
      <div class="caption">Calculadora interés compuesto</div>
    </div>

    <div class="swiper-slide">
      <div class="swiper-zoom-container">
        ![Calculadora amortización](images/ma_calc.png)
      </div>
      <div class="caption">Calculadora amortización</div>
    </div>

    <div class="swiper-slide">
      <div class="swiper-zoom-container">
        ![Estilo claro](images/light_style.png)
      </div>
      <div class="caption">Estilo claro</div>
    </div>

  </div>

  <!-- Pagination & Navigation -->
  <div class="swiper-pagination"></div>
  <div class="swiper-button-next"></div>
  <div class="swiper-button-prev"></div>
</div>

<script src="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js"></script>
<script>
const swiper = new Swiper('.mySwiper', {
  loop: true,
  autoplay: { delay: 8000, disableOnInteraction: false },
  pagination: { el: '.swiper-pagination', clickable: true },
  navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
  spaceBetween: 30,
  centeredSlides: true,
  slidesPerView: 1,
  zoom: { maxRatio: 2 },
  breakpoints: {
    640: { slidesPerView: 1 },
    768: { slidesPerView: 2 },
    1024: { slidesPerView: 3 }
  }
});
</script>
