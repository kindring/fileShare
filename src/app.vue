<template>
  <div id="container" class=" bg-gray-100 h-full w-full relative flex flex-col">
     
      <div class="header w-full h-8 relative border-yellow-200 border-b bg-gray-50 text-pink-500 text-center ">
          {{title}}
      </div>
      <router-view>
          
      </router-view>
      <div class="h-full"></div>
      <div class="text-center text-xs text-gray-400 mb-5">
         文件下载站 create by @kindring
      </div>
  </div>
</template>

<script>
export default {
    name:'fileShareApp',
    data(){
        return {
            
            
        }
    }
}
</script>

<style>
    .btn-indigo {
        @apply 
        py-2 
        px-4 
        bg-blue-500 
        text-white 
        font-semibold 
        rounded-lg 
        shadow-md 
        cursor-pointer
        hover:bg-blue-700 
        focus:outline-none 
        focus:ring-2 
        focus:ring-blue-400 
        focus:ring-opacity-75 
        hover:bg-blue-400
        ;
    }
    body{
        width: 100vw;
        height: 100vh;
    }
    #container{
        color: red;
    }
</style>