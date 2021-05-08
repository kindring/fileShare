<template>
    <div class="w-full flex justify-center">
        <div class="mx-auto relative w-1/3">
            <div class="
             mask w-full  
             h-full 
             absolute 
             z-0
             left-0
             top-0 z-0   
             bg-black 
             opacity-20 
             rounded-lg">

            </div>
            <div class=" 
            relative left-0 
            top-0 w-full h-full 
            z-10 py-8 border-gray-400 
            border text-center rounded-lg 
            text-2xl 
            text-blue-300">
                文件拖动到此处进行上传
            </div>
            <form 
            action="file" 
            class="w-full 
            h-full 
            absolute 
            left-0 
            top-0 
            z-20 "
             >
            <input 
            type="file"
            name="myfile" 
            class="
                w-full 
                h-full 
                opacity-0 
            "
            multiple="multiple"
            @change="handelFileChange"
            >
            </form>
        </div>
    </div>
</template>

<script>
const SIZE = 10 * 1024 *1024;//切片大小
export default {
    name : 'fileUpload',
    data(){
        return {
            lock: false,
            /** 任务列表 
             * Array.state 状态 0 等待 1 前端处理中 2上传中 3上传成功
             * Array.isPaused 是否暂停 0 否 1是
            */
            fileUpdateTaskList: [],
            taskRunningNumber: 0,
            // 最大同时上传文件数量
            'max-file-upload-number': 2,
            // 单个文件最大同时切片上传文件数量
            'sign-file-chunk-upload' : 3,
            // 最大计算hash值队列
            'max-hash-calculate-number' : 3,
        }
    },
    methods:{
        // input文件修改绑定的事件
        handelFileChange(e){

            const files = e.target.files;
            console.log(e.target.files);
            for(let i in files){
                this.createTask(files[i]);
            }
            this.taskRunning();
            // 拿到当前用户选择的文件列表
            // 添加文件到任务列表中
            // 开始执行任务
            // 计算hash值
            // 按照顺序将文件切片
            // 按照顺序依次发送文件
        },
        /** 创建任务 */
        async createTask(file){
            //查看当前文件是否已经在任务队列中,
            if(this.isFileExist(file)){
                return '文件已经存在'
            }
            this.data.fileUpdateTaskList.push({
                file,
                state: 0,
                isPaused: 0,
                progress:0
            });
        },
        isFileExist(){
            let flag = false;
            for (const key in this.fileUpdateTaskList) {
                if (this.fileUpdateTaskList[key] == file) {
                    return true;
                }
            }
            return flag;
        },
        /** 执行任务 */
        taskRunning(){
            // 看当前有多少个
            if(this.taskRunningNumber){

            }
            // 自动提取文件进行计算hash值
            for(let i = 0;i<this.fileUpdateTaskList.length;i++){
                if(this.fileUpdateTaskList.isPaused){
                    continue;
                }else[
                    
                ]
            }
        },
        /** 计算文件md5值 */
        calculateFileMd5(file){
            // 创建新线程来生成文件hash
            // const {}
        },
        /** 处理单个文件 */
        async handelUpload(){

        },
        /** 创建文件切片 */
        createFileChunk(file,size = SIZE){
            const fileChunkList = [];
            let cur = 0;
            while (cur < file.size){
                fileChunkList.push(
                    {file:file.slice(cur,cur+size)}
                );
                cur+=size;
            }
            return fileChunkList;
        },
        async uploadChunks(){

        },
        /** 发送请求 */
        request(){

        },
    }
}
</script>

<style>

</style>