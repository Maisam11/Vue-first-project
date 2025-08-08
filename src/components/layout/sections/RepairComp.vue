<template>
    <section class="repair" id="repair" :style="{ backgroundImage: 'url(' + backgroundImage + ')' }">
        <h2 class="fw-bold repair-showdown text-center mt-3">What we can fix for you</h2>
        <p class="repair-showdown text-center">
          There are many variations of passages of Lorem Ipsum available, but the majority have.
        </p>


        <div class="section cards-repair py-6">
    <GenericCard 
      v-for="(card, index) in repairCards" 
      :key="index"
      :image="card.image"
      :title="card.title"
      :isBold="card.isBold"
      :description="card.description"
      customClass="card-repair"
      :imageStyle="{ width: '40px', height: '60px'}"
    />
  </div>


    </section>
  </template>
  
  <script>
  import GenericCard from '@/components/common/GenericCard.vue';
  export default {
    components: { GenericCard },
    name: "RepairComp",
    data() {
      return {
        backgroundImage: require("@/assets/repair-background.png"),
        repairCards: [
          {
            image: require("@/assets/iphone repair.png"),
            title: "Iphone Repair",
            isBold: true,
            description:
              "From liquid damage to cracked screens, we provide high-quality, affordable repair services.",
          },
          {
            image: require("@/assets/iphone repair.png"),
            title: "Iphone Repair",
            isBold: true,
            description:
              "From liquid damage to cracked screens, we provide high-quality, affordable repair services.",
          },
          {
            image: require("@/assets/iphonetab repair.png"),
            title: "Iphone Repair",
            isBold: true,
            description:
              "From liquid damage to cracked screens, we provide high-quality, affordable repair services.",
          },
          {
            image: require("@/assets/iphonemac repair.png"),
            title: "Iphone Repair",
            isBold: true,
            description:
              "From liquid damage to cracked screens, we provide high-quality, affordable repair services.",
          },
        ],
      };
    },
  };
  </script>
  
  <style scoped>
  .card-repair{
    width: 310px;
    align-items: center;
  }

  .repair {
    text-align: center;
    background-position: right top;
    background-repeat: no-repeat;
    background-color: #f3f7fc;
    width: 100%;
    background-size: 500px;
    padding-top: 3rem;
  }
  
  .repair-showdown {
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
  
  .cards-repair {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 1.2rem;
  }
  
  .card {
    border: none;
    border-radius: 0px;
    padding: 2rem 0.7rem 1.5rem 0.7rem;
    margin-bottom: 1.5rem;
    box-shadow: none !important;
  }

  .card:hover {
    box-shadow: rgba(50, 50, 93, 0.25) 0px 13px 27px -5px,
      rgba(0, 0, 0, 0.3) 0px 8px 16px -8px !important;
  }
  
  @media (max-width: 768px) {
    .card {
      width: 100%;
    }
  }
  </style>