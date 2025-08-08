<template>
    <div>
      <section
        class="d-flex align-center justify-center heroban"
        :style="{ background: 'linear-gradient(to right, #E6F2DC, #F6F4E5, #E6F3FC, #F8F8F8)', padding: '8% 7%', gap: '2rem',}">
        <div>
          <h1>
            Smartphone, iPad & Mac Repair Service At Doorstep In Indonesia.
          </h1>
          <p :style="{ color: '#5C5A6F', fontSize: '1.2rem' }">
            Discover your gateway to reliable solar solutions, empowering you with sustainable and efficient energy alternatives for a greener future.
          </p>
        </div>
  
        <div >
          <img :src="herobanner" alt="hero-banner" class="bannerpicture"/> 
        </div>
      </section>
  
      <section class="d-flex justify-content-around m-auto"
        :style="{  width: '70%',  padding: '30px 20px', borderRadius: '5px', backgroundColor: 'white',  position: 'relative',  bottom: '40px', flexWrap: 'wrap', fontSize: '20px',}">
        <div>
          <p style="color: #4B4AEF; font-size: 15px;">
            <v-icon class="mr-3 mb-1" style="color: #4B4AEF; font-size: 22px;">mdi-truck-fast</v-icon>
            Free Pickup and Drop
          </p>
        </div>
        <div>
          <p style="color: #FF9900; font-size: 15px;">
            <v-icon style="color: #FF9900; font-size: 20px; margin-right: 8px;">mdi-wrench</v-icon>
            30 Minutes Repair
          </p>
        </div>
        <div>
          <p style="color: #03C12D; font-size: 15px;">
            <v-icon style="color: #03C12D; font-size: 20px; margin-right: 8px;">mdi-tag</v-icon>
            Affordable Price
          </p>
        </div>
      </section>

     
    </div>
  </template>
  
  <script>
  export default {
    name: "HeroComp",
    data() {
    return {
      herobanner: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR82AFnfLWS6CwAD7JU95o7349WHxwo4g3gDw&s"
    }
  },
    methods: {
      sendMessage() {
        alert("Message sent!");
      },
    },
  };
  </script>
  
  <style>
    .heroban h1 {
      font-size: 3.1rem;
      font-weight: 700;
    }
    
  .bannerpicture{
    width: 80vh;
    height: 60vh;
  }
  @media (max-width: 1007px){
.heroban h1{
  font-size: 2.6rem;
}
  }
  @media (max-width: 768px) {
    .heroban{
      flex-direction: column;
    }
    .heroban h1 {
      font-size: 2rem;
      font-weight: 600;
    }
    .bannerpicture{
    width: 100%;
    height: 60vh;
  }
  }
  
  @media (max-width: 425px) {
    .heroban h1 {
      font-size: 1.6rem;
    }
  }

  </style>