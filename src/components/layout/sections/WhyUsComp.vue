<template>
  <section class="why" id="why">
    <v-container>
      <h2 class="fw-bold why-showdown text-center">Why Choose Us</h2>
      <p class="why-showdown text-center">
        There are many variations of passages of Lorem Ipsum available, but the
        majority have. <br />
        Get some more money, you have time
        <span class="text-primary">Read More.</span>
      </p>
 

      <div class="section why-cards">
    <GenericCard 
      v-for="(card, index) in whyCards" 
      :key="index"
      :icon="card.icon"
      :iconBgColor="card.iconBgColor"
      :image="card.image"
      :title="card.title"
      :titleColor="card.titleColor"
      :isBold="card.isBold"
      :description="card.description"
      customClass="why-card why-showdown"
    />
  </div>
  

    </v-container>
  </section>
</template>

<script>
  import GenericCard from '@/components/common/GenericCard.vue';

export default {
  components: { GenericCard },
  name: "WhyUsComp",
  data() {
    return {
      whyCards: [
        {
          icon: "fas fa-shipping-fast",
          iconBgColor: "#2c71fb",
          title: "Express Repairs",
          titleColor: "#2c71fb",
          description:
            "We provide you with unique products that make your life easier! These products are created to solve your pain points. Our amazing products offer you quality and creative solutions for your WordPress website.",
        },
        {
          icon: "fas fa-cogs",
          iconBgColor: "#2c71fb",
          title: "Premium Parts",
          titleColor: "#2c71fb",
          description:
            "We provide you with unique products that make your life easier! These products are created to solve your pain points. Our amazing products offer you quality and creative solutions for your WordPress website.",
        },
        {
          icon: "fas fa-home",
          iconBgColor: "#ff9900",
          title: "Home Service",
          titleColor: "#ff9900",
          description:
            "We provide you with unique products that make your life easier! These products are created to solve your pain points. Our amazing products offer you quality and creative solutions for your WordPress website.",
        },
        {
          icon: "fas fa-user-check",
          iconBgColor: "#03c12d",
          title: "Expert Technicians",
          titleColor: "#03c12d",
          description:
            "We provide you with unique products that make your life easier! These products are created to solve your pain points. Our amazing products offer you quality and creative solutions for your WordPress website.",
        },
        {
          icon: "fas fa-users",
          iconBgColor: "#2c71fb",
          title: "Great Support",
          titleColor: "#2c71fb",
          description:
            "We provide you with unique products that make your life easier! These products are created to solve your pain points. Our amazing products offer you quality and creative solutions for your WordPress website.",
        },
        {
          icon: "fas fa-tag",
          iconBgColor: "#14708f",
          title: "Price Promise",
          titleColor: "#14708f",
          description:
            "We provide you with unique products that make your life easier! These products are created to solve your pain points. Our amazing products offer you quality and creative solutions for your WordPress website.",
        },
      ],
    };
  },
};
</script>

<style scoped>
.why {
  padding: 50px 15px;
  text-align: center;
  background-color: #f3f7fc;
}

.why-showdown {
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

.why-cards {
  display: flex;
  justify-content: center;
  margin-top: 5rem;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.why-card {
  margin-top: 1rem;
  text-align: left;
  border: none;
  padding: 1rem;
  border-radius: 10px;
   width: 300px;
  background-color: white;
  box-shadow: none !important;
}

@media (min-width: 992px) {
  .why-card {
    width: 400px !important;
  }
}
@media (max-width: 350px) {
  .why-card {
    width: 320px !important;
  }
}
</style>
