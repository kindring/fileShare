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
            uploadChunkUrl: 'http://loaclhost:8001/api/uploaderchunk',
            verifyUploadUrl: 'http://localhost:8001/api/verify',
            // 线程列表
            workers: {

            },
            
        }
    },
    methods:{
        request({
                    url,
                    method = "post",
                    data,
                    headers = {},
                    onProgress = e => e,
                    requestList
            }) {
                return new Promise(resolve => {
                    const xhr = new XMLHttpRequest();
                    xhr.upload.onprogress = onProgress;
                        xhr.open(method, url);
                        Object.keys(headers).forEach(key =>
                            xhr.setRequestHeader(key, headers[key])
                        );
                        xhr.send(data);
                        xhr.onload = e => {
                            resolve({
                                data: e.target.response
                            });
                        };
                });
            },
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
            if(this.taskRunningNumber >= this['max-file-upload-number']){
                return console.log('task number is max')
            }
            // 自动提取文件进行计算hash值
            for(let i = 0;i<this.fileUpdateTaskList.length;i++){
                if(this.fileUpdateTaskList[i].isPaused){
                    continue;
                }else{
                    if(this.taskRunningNumber >= this['max-file-upload-number']){
                        return console.log('任务队列已满')
                    }else{
                        //文件切片,切片后进行计算hash值
                        this.fileUpdateTaskList[i].fileChunkList = this.createFileChunk(this.fileUpdateTaskList[i].file);
                        //计算hash值
                        this.calculateFileMd5(this.fileUpdateTaskList[i].fileChunkList,i).then((hash)=>{
                            // 更新文件状态
                            this.fileUpdateTaskList[i].hash = hash;
                            this.fileUpdateTaskList[i].state = 2
                            this.handelUpload(i);
                        })
                        this.fileUpdateTaskList[i].state =  1;
                        this.taskRunningNumber ++;
                    }
                }
            }
        },
        /** 计算文件md5值 */
        calculateFileMd5(fileobj,i){
            return new Promise(resolve=>{
                this.workers[i] = new Worker("/hash.js");
                this.workers[i].postMessage({fileobj});
                this.workers[i].onmessage = (e)=>{
                    const {precentage,hash} = e.data;
                    fileobj.hashPercentage = precentage;
                    if(hash){
                        this.workers[i] == null;
                        resolve(hash);
                    }
                };
            });
        },
        /** 处理单个文件 */
        async handelUpload(i){
            if (!this.fileUpdateTaskList[i].file) return;
            const fileChunkList = this.fileUpdateTaskList[i].fileChunkList;
            const fileName = this.fileUpdateTaskList[i].file.name;
            const hash = this.fileUpdateTaskList[i].hash;
            const { shouldUpload,existChunks } = await this.verifyUpload(fileName,hash);
            // 服务端切片文件名称
            if(!shouldUpload){
                console.log('秒传：上传成功');
                return;
            }
            await this.uploadChunks(fileChunkList,fileName,hash,existChunks,i);
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
        /** 需要上传的分块 */
        async uploadChunks(fileChunkList,fileName,hash,existChunks,fileUpdateTaskListIndex){
            const requestList = fileChunkList.filter((chunk,i)=>{
                const chunkHash = `${hash}-${i}`
                if(existChunks.includes(chunkHash)){
                    //跳过
                    return false;
                }else{
                    const formData = new FormData();
                    formData.append("chunk",chunk);
                    formData.append('name',fileName);
                    formData.append('hash',chunkHash);
                    return formData;
                }
            }).map(async ({formData,index})=>{
                this.request({
                    url: this.uploadChunkUrl,
                    data: formData,
                    onProgress: this.createProgressHandel(fileUpdateTaskListIndex),
                    // requestList: this.requestList
                })
            })
            await Promise.all(requestList);
        },
        async verifyUpload(fileName,hash){
            const {data} = await this.request({
                url:this.verifyUploadUrl,
                headers: {
               "content-type": "application/json"
             },
             data: JSON.stringify({
               filename,
               fileHash
             })
            });
            console.log(data);
            return JSON.parse(data);
        }
    }
}
</script>

<style>

</style>