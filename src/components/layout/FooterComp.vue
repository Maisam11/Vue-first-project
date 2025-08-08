<template>
  <footer class="footer">
    <div class="container">
      <div class="row">
        <div class="col-md-4">
          <h5 class="fw-bold">Phofix.</h5>
          <ul class="list-unstyled">
            <li><a href="#">Cengkareng, DKI Jakarta, Indonesia</a></li>
            <li><a href="#">+62 888 888 888</a></li>
            <li><a href="#">info@juragancode.id</a></li>
          </ul>

          <div class="social-icons mt-3 ms-6">
            <a href="#"><i class="fab fa-facebook-f"></i></a>
            <a href="#"><i class="fab fa-twitter"></i></a>
            <a href="#"><i class="fab fa-instagram"></i></a>
          </div>
        </div>

        <div class="col-md-3">
          <h5 class="fw-bold">The Highlights</h5>
          <ul class="list-unstyled">
            <li><a href="#">Apartment</a></li>
            <li><a href="#">My Houses</a></li>
            <li><a href="#">Condos</a></li>
            <li><a href="#">Villas</a></li>
            <li><a href="#">Blog & Media</a></li>
          </ul>
        </div>

        <div class="col-md-3">
          <h5 class="fw-bold">How it works</h5>
          <ul class="list-unstyled">
            <li><a href="#">About Us</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Block Chain</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms & Condition</a></li>
          </ul>
        </div>

        <div class="col-md-2">
          <h5 class="fw-bold">About Us</h5>
          <ul class="list-unstyled">
            <li><a href="#">Agency List</a></li>
            <li><a href="#">Agency Details</a></li>
            <li><a href="#">Agents List</a></li>
            <li><a href="#">Agent Details</a></li>
            <li><a href="#">Terms & Condition</a></li>
          </ul>
        </div>
      </div>
    </div>

    <div class="footer-bottom text-center p-2 fs-6" style="background-color: #112854;">
      © 2023 Phofix. All rights reserved.
    </div>
  </footer>
</template>

<script>
export default {
  name: "FooterComp",
};
</script>

<style scoped>
.footer {
  padding-top: 5rem;
  background-color: #061d49;
  color: #ffffff;
}
.footer h5 {
  margin-left: 1.3rem;
  margin-bottom: 15px;
}
.footer ul li {
  margin-top: 10px;
  list-style: none;
}
.footer a {
  color: #b0b0b0;
  text-decoration: none;
  font-size: 14px;
}
.footer a:hover {
  color: #ffffff;
}
.footer .social-icons a {
  font-size: 20px;
  margin-right: 15px;
  color: #b0b0b0;
}
.footer .social-icons a:hover {
  color: #ffffff;
}
</style>
