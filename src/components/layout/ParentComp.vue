<template>
    <div>
        <HeaderComp/> 
        <main>
            <router-view></router-view> 
        </main>
        <v-btn
        fab
        :style="{
          position: 'fixed',
          right: '4%',
          bottom: '2%',
          fontSize: '1.5rem',
          zIndex: '1000',
          background: 'blue',
          color: 'white',
        }"
        @click="sendMessage"
      >
        <v-icon>mdi-message</v-icon>
      </v-btn>
        <FooterComp/>  
    </div>
</template>

<script>
import HeaderComp from './HeaderComp.vue';
import FooterComp from './FooterComp.vue';
export default {
    name: 'ParentComp',
    components: {
        HeaderComp,
        FooterComp,
    },
    methods: {
      sendMessage() {
        alert("Message sent!");
      },
    },
}
</script>