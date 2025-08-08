<template>
  <section class="services" id="services">
    <h2 class="fw-bold service-showdown text-center mt-4">
      Check our services
    </h2>
    <p class="service-showdown text-center">
      Reliable solar solutions tailored to your needs, from consultation to
      installation and ongoing support.
    </p>


      <div class="section service-cards">
    <GenericCard 
      v-for="(service, index) in services" 
      :key="index"
      :image="service.image"
      :description="service.description"
       customClass="service-card service-showdown"
      :imageStyle="{ width: '60px', height: '' }"
    />
  </div>

  
  </section>
</template>

<script>
  import GenericCard from '@/components/common/GenericCard.vue';

export default {
  components: { GenericCard },

  name: "ServicesComp",
  data() {
    return {
      services: [
        { image: require("@/assets/fontcamera.png"), description: "Front Camera" },
        { image: require("@/assets/backcamera.png"), description: "Back Camera" },
        { image: require("@/assets/button.png"), description: "Button" },
        { image: require("@/assets/vibrator.png"), description: "Vibrator" },
        { image: require("@/assets/waterdamage.png"), description: "Water Damage" },
        { image: require("@/assets/backpanel.png"), description: "Back Panel" },
      ],
    };
  },
};
</script>

<style scoped>
.services {
  padding: 50px 5%;
}

.service-showdown {
  opacity: 0;
  transform: translateY(200px);
  animation: sideIndown both;
  animation-timeline: view(60% 0%);
}

@keyframes sideIndown {
  from {
    opacity: 0;
    transform: translateY(200px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.service-cards {
  display: flex;
  flex-wrap: wrap;
  margin-top: 2.4rem;
  justify-content: center;
  gap: 1.2rem;
}

.service-card {
  border-radius: 5px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin-bottom: 1rem;
  padding: 30px 20px;
  width: 200px;
  box-shadow: 0px 6px 75px -55px #4b4aef;
  border: none;
}

.service-card .card-img img {
  width: 70px;
}

@media (min-width: 576px) {
  .service-card {
    width: 48%;
  }
}

@media (min-width: 992px) {
  .service-card {
    width: 200px;
  }
}
</style>
