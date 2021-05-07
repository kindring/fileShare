<template>
<div class="w-full">
  <div class="mt-20">
    <h1 class=" text-5xl text-blue-500 w-full text-center ">{{title}}</h1>
    <h3 class=" text-base text-gray-500 w-full text-center mt-2">{{subTitle}}</h3>
  </div>
  <div class="flex w-full py-10 mt-10 justify-center">
    
      
        <router-link 
          v-for="item in btns"
          :key="'router-link-'+item.path"
          :to="item.path" 
          class="btn-indigo mr-2 md:mr-5 "
          >
                  {{item.title}}
        </router-link>
      </div>
</div>
  
</template>

<script>
export default {
    name: 'btns',
    data(){
      return {
        title: '文件分享站',
        subTitle: '文件共享应急用',
        btns:[
          {
            path: '/share',
            title: '分享文件'
          },
          {
            path: '/get',
            title: '获取文件'
          }
        ]
      }
    }
}
</script>

<style>

</style>