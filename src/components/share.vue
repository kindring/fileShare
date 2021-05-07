<template>
    <div class="w-full">
        <div class="mt-20">
            <h1 class=" text-5xl text-blue-500 w-full text-center ">{{title}}</h1>
            <h3 class=" text-base text-gray-500 w-full text-center mt-2">{{subTitle}}</h3>
        </div>
        <div class="w-full py-5">
            <file-upload></file-upload>
        </div>
    </div> 
    
</template>

<script>
import fileUpload from './fileUpload'
export default {
    name: 'share',
    components:{
        fileUpload
    },
    data(){
        return {
            title:'上传文件',
            subTitle:'临时网路共享文件'

        }
    }
}
</script>

<style>

</style>