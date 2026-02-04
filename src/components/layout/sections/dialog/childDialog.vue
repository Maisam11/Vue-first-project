<template>
  <v-dialog :value="dialog" width="500" class="childDialog" >
    <v-card class="childDialog px-3">
        <div class="d-flex justify-content-between">
        <h4>dialog</h4>
        <v-icon color="error" @click="closeDialog">mdi-close</v-icon>
    </div>
        <p>this is child dialog</p>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
    name: "childDialog",
    data(){
        return {
            dialog: false,
        }
    },
    methods: {
        openDialog(){
            this.dialog= true;
        },
        
        closeDialog(){
            this.dialog= false;
        },
    },

}
</script>

<style>
.childDialog{
    overflow: hidden;
}
</style>