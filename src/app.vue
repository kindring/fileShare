<template>
  <div id="container" class=" bg-gray-100 h-full w-full relative">
      <div class="w-full h-full absolute">
          
      </div>
      <div class="header w-full h-8 relative border-yellow-200 border-b bg-gray-50 text-pink-500 text-center ">
          {{title}}
      </div>
      <div class="mt-20">
          <h1 class=" text-5xl text-blue-500 w-full text-center ">{{title}}</h1>
      </div>
      <div class="flex w-full p-4 justify-around">
          <div class="btn-indigo">分享文件</div>
          <div class="btn-indigo">下载文件</div>
      </div>
  </div>
</template>

<script>
export default {
    data(){
        return {
            title: '文件分享站',

        }
    }
}
</script>

<style>

    body{
        width: 100vw;
        height: 100vh;
    }
    #container{
        color: red;
    }
</style>