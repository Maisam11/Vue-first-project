<template>
  <div class="ma-6">
      <childDialog ref="childRef"/>
      <v-btn @click="openChildDialog">Open Child Dialog</v-btn>
            <ul class="mt-3">
                <li v-for="user in users" :key="user.id" class="d-flex">
                    <p class="w-25">Name: {{ user.firstName }}</p>
                    <p class="w-25">Gender: {{ user.gender }}</p>
                    <p class="w-25">Phone: {{ user.phone }}</p>
                    <p class="w-25">Email: {{ user.email }}</p>
                </li>
            </ul>
  </div>
</template>

<script>
import childDialog from './dialog/childDialog.vue';
import axios from 'axios';
export default {
    name: "PracticePage",

    components: {childDialog},

    data(){
        return{
            users: [],
        };
    },

    mounted(){
        this.getUsers();
    },

    methods: {
        openChildDialog(){
            this.$refs.childRef.openDialog();
        },

        getUsers(){
            axios
            .get("https://dummyjson.com/users")
            .then(responce =>{
                this.users = responce.data.users;
            })
            .catch(error =>{
                console.log(error);
            })
        },
    },
}
</script>

<style>
</style>