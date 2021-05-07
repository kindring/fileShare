<template>
  <div class="w-full h-full flex justify-center items-center flex-col">
      <h1 class="text-2xl">资源未找到</h1>
      <router-link to="/" class="btn-indigo mt-2">
        回到主页
      </router-link>
  </div>
</template>

<script>
export default {
    name:'error404',
    props: [],
    beforeMount(){

    },
    methods: {

    }
}
</script>

<style>

</style>