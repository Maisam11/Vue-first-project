<template>
    <section class="Choose-Repaired-Brands" id="choose-repaired-brands">
      <v-container>
        <h2 class="fw-bold repaired-showdown text-center">
          Choose your <br /> Repaired Brands
        </h2>
        <p class="repaired-showdown text-center">
          He nicked it tickety boo harry the cras bargy chap mush spiffing spend a penny the full monty
          <span class="text-primary">Read More.</span>
        </p>
  
        <v-row class="repaired-brand-imgs">
          <v-col
            v-for="(brand, index) in brands"
            :key="index"
            class="d-flex justify-center"
          >
            <v-card class="img repaired-showdown" style="width: 150px; box-shadow: 0px 6px 75px -55px #4B4AEF; padding: 30px 20px;">
              <img :src="brand.image" :alt="brand.alt" class="img-fluid" max-width="173">
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>
  </template>
  
  <script>
  export default {
    name: 'RepBrandsComp',
    data() {
      return {
        brands: [
          { image: require("@/assets/samsung brand.png"), alt: "Samsung" },
          { image: require("@/assets/apple brand.png"), alt: "Apple" },
          { image: require("@/assets/one plus brand.png"), alt: "OnePlus" },
          { image: require("@/assets/oppo brand.png"), alt: "Oppo" },
          { image: require("@/assets/vivo brand.png"), alt: "Vivo" },
          { image: require("@/assets/lenovo brand.png"), alt: "Lenovo" },
          { image: require("@/assets/realme brand.png"), alt: "Realme" },
        ],
      };
    },
  };
  </script>
  
  <style scoped>
  .Choose-Repaired-Brands {
    padding: 50px 5%;
  }
  
  .repaired-showdown {
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
  
  p {
    color: #5c5a6f;
  }
  
  .repaired-brand-imgs {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
  }
  
  .repaired-brand-imgs .img {
    width: 100%;
    max-width: 173px;
    padding: 1.5rem;
    border-radius: 5px;
    box-shadow: 0px 6px 75px -55px #4b4aef;
  }
  
  .repaired-brand-imgs .img img {
    width: 100%;
    height: auto;
  }
  
  @media (min-width: 576px) {
    .repaired-brand-imgs .img {
      width: 48%;
    }
  }
  
  @media (min-width: 992px) {
    .repaired-brand-imgs .img {
      width: 23%;
    }
  }
  </style>