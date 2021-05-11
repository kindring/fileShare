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
            uploadChunkUrl: 'http://localhost:8001/api/uploadchunk',
            verifyUploadUrl: 'http://localhost:8001/api/verify',
            mergeRequestUrl: 'http://localhost:8001/api/merge',
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
                console.log(data);
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
            for(let i = 0; i< files.length;i++){
                this.createTask(files[i]);
            }
            this.$nextTick(()=>{
                this.taskRunning();
            })
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
                return console.log('文件已经在任务列表中')
            }
            this.fileUpdateTaskList.push({
                file,
                state: 0,
                isPaused: 0,
                progress:0,
                chunkList:[]
            });
        },
        isFileExist(file){
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
            console.log(this.fileUpdateTaskList);
            // 自动提取文件进行计算hash值
            for(let i = 0;i<this.fileUpdateTaskList.length;i++){
                if(this.fileUpdateTaskList[i].isPaused){
                    continue;
                }else{
                    console.log(this.taskRunningNumber)
                    console.log(this['max-file-upload-number'])

                    if(this.taskRunningNumber >= this['max-file-upload-number']){
                        return console.log('任务队列已满')
                    }else{
                        // 防止对着一个文件使劲操作,所以增加一个文件状态判断
                        if(this.fileUpdateTaskList[i].state != 0){
                            console.log('此文件跳过');
                            console.log(i);
                            console.log(this.fileUpdateTaskList);
                        }else{
                            console.log(`执行任务${i}`);
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
            }
        },
        /** 计算文件md5值 */
        calculateFileMd5(fileobj,i){
            console.log(fileobj)
            console.log(i)
            console.log('计算md5')
            return new Promise(resolve=>{
                this.workers[i] = new Worker("/public/hash.js");
                this.workers[i].postMessage({ fileChunkList:fileobj });
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
            const { shouldUpload,existChunks } = await this.verifyUpload(fileName,hash,fileChunkList.length);
            // 服务端切片文件名称
            if(!shouldUpload){
                console.log('秒传：上传成功');
                return;
            }
            console.log(fileChunkList);
            console.log('fileChunkList');
            

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
            
            let requestList = fileChunkList.map((chunk,i)=>{
                // 创建form data 同时也可以创建相应的任务队列
                const chunkHash = `${hash}-${i}`
                const formData = new FormData();
                this.fileUpdateTaskList[fileUpdateTaskListIndex].chunkList.push({
                    index:i,
                    chunkHash,
                    state: 0,// 状态 0 默认状态 1准备发送 2 发送中 3 发送完成 
                    failNumber: 0,//失败次数
                    progress: 0,//进度条
                });
                formData.append("chunk",chunk.file);
                formData.append('name',fileName);
                formData.append('filename',fileName);
                formData.append('hash',hash);
                formData.append('chunkHash',chunkHash);
                formData.append('index',i);
                return formData;
            }).filter((formData,index)=>{
                const chunkHash = `${hash}-${index}`
                let state,flag;
                if(existChunks.includes(chunkHash)){   
                    state = 3;
                    flag= false;
                }else{
                    state = 1;
                    flag= true;
                }
                this.fileUpdateTaskList[fileUpdateTaskListIndex].chunkList[index].state = 3
                return flag;
            });
            requestList = requestList.map(async (formData,index)=>{
                // console.log('formData');
                await this.request({
                    url: this.uploadChunkUrl,
                    data: formData,
                    onProgress: this.createProgressHandel(fileUpdateTaskListIndex),
                    // requestList: this.requestList
                }).then(data=>{
                    console.log(data);
                    //判断当前分块是否成功
                });
                //自动重试
            });
            // 全部分块文件上传完成,合并文件
            let r = await Promise.all(requestList);
            await this.mergeRequest(hash,fileName);
            console.log('上传完成');
        },
        async mergeRequest(hash,fileName){
            await this.request(
                {
                    url: this.mergeRequestUrl,
                    headers: {
                        'content-type':'application/json'
                    },
                    data: JSON.stringify({
                        size: SIZE,
                        hash: hash,
                        filename: fileName
                    })
                }
            )
        },
        async verifyUpload(fileName,hash,chunkTotal){
            const {data} = await this.request({
                url:this.verifyUploadUrl,
                headers: {
               "content-type": "application/json"
             },
             data: JSON.stringify({
               filename:fileName,
               chunkTotal,
               hash
             })
            });
            console.log(data);
            return JSON.parse(data);
        },
        createProgressHandel(fileUpdateTaskListIndex){
            console.log(fileUpdateTaskListIndex);
        }
    }
}
</script>

<style>

</style>