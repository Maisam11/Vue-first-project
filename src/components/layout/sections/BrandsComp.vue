<template>
  <section>
    <div class="brands">
      <div v-for="(brand, index) in brands" :key="index" cols="6" sm="4" md="2">
        <img :src="brand.src" :alt="brand.alt" class="img-fluid">
      </div>
    </div>

    <div class="brands-button d-flex justify-content-center align-items-center">

      <div class="d-flex justify-center" style="width: 300px;">
        <v-btn class="brand-btn brand-btn1 text-white" href="#" style="padding: 27px 62px; text-transform: none;">
          <v-icon left>mdi-wrench</v-icon>
          Emergency Repair
        </v-btn>
      </div>
      <div class="d-flex justify-center" style="width: 300px;">
        <v-btn class="brand-btn brand-btn2 text-white" href="#" style="padding: 27px 62px; text-transform: none;">
          <v-icon left>mdi-timer</v-icon>
          Overnight Repair
        </v-btn>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'BrandsComp',
  data() {
    return {
      brands: [
        { src: require ("@/assets/apple brand.png"), alt: 'Apple' },
        { src: require ("@/assets/one plus brand.png"), alt: 'OnePlus' },
        { src: require ("@/assets/oppo brand.png"), alt: 'Oppo' },
        { src: require ("@/assets/vivo brand.png"), alt: 'Vivo' },
        { src: require ("@/assets/lenovo brand.png"), alt: 'Lenovo' },
        { src: require ("@/assets/realme brand.png"), alt: 'Realme' },
        { src: require ("@/assets/samsung brand.png"), alt: 'Samsung' },
      ]
    };
  }
};
</script>

<style scoped>
.brands {
    background-color: white;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    padding: 20px 5%;
    gap: 20px;
}

.brands img {
    max-width: 120px;
    height: auto;
    transition: transform 0.3s ease-in-out;
}

.brands img:hover {
    transform: scale(1.2);
}

@media (max-width: 768px) {
    .brands img {
        max-width: 80px;
    }
}

.brands-button {
  gap: 15px;
    margin-top: 20px;
    flex-wrap: wrap;
}


.brand-btn {
    font-weight: bold;
    font-size: 15px !important;
    opacity: 0; 
}

.brand-btn1 {
    background: linear-gradient(93.19deg, #4B4AEF 33.85%, #628EFF 86.15%);
    border-top-left-radius: 25px;
    transform: translateX(-100px);
    animation: slideInLeft both;
    animation-timeline: view(60% 0%);
}
.brand-btn1:hover{
    background: linear-gradient(93.19deg,  #628EFF 33.85%, #4B4AEF 86.15%);
}

.brand-btn2 {
    background: linear-gradient(95.82deg, #F7C984 45.38%, #FF9900 82.77%);
    border-bottom-right-radius: 25px;
    transform: translateX(12%); 
    animation: slideInRight both;
    animation-timeline: view(60% 0%);
}
.brand-btn2:hover{
    background: linear-gradient(95.82deg, #FF9900 45.38% , #F7C984 82.77%);
}

@keyframes slideInLeft {
    from {
        opacity: 0;
        transform: translateX(-100px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(12%);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}
</style>