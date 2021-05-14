<template>
    <div class="w-full flex justify-center flex-col">
        <div class="mx-auto relative sm:w-4/5 lg:w-1/3">
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
        <div
        v-show="fileUpdateTaskList.length||true"
         class="mx-auto relative sm:w-4/5  lg:w-1/3 border-gray-300 border mt-5 rounded-md">
            <h1 class="title relative
            text-xl 
            text-blue-400 
            text-center 
            py-5 
            border-b 
            border-gray-400">
                文件列表
            </h1>
            <div class="lists ">
                <div 
                v-for="(item,i) in fileUpdateTaskList"
                :key="item.hash+'-'+i"
                class="
                listItem
                flex
                items-center
                flex-col
                mt-4
                shadow-md
                " >
                    <div class="absolute progressBar-position">
                        <div class=" bg-yellow-400 hash"
                         :style="{
                            width:item.hashPercentage+'%'
                            }"
                        >
                        </div>
                        <div 
                        class=" bg-blue-400 total"
                        :style="{
                            width:item.progress+'%'
                            }"
                        >
                        </div>
                    </div>
                    <!-- 分块部分 -->
                    <div class="top-box w-full border-b border-gray-400 flex items-center ">
                        <div class="top-box-chunk selected border border-gray-400">
                            <div class="w-full h-full" 
                                :style="{
                                    backgroundColor:selectedTaskArr.includes(i)?'orangered':''
                                }"
                                @click="switchTaskHandel(i)"
                            ></div>
                        </div>
                        <div class="top-box-chunk file-name">
                            {{item.file.name}}
                        </div>
                        <div class="top-box-chunk state">
                            {{item.state|fileState}}
                        </div>
                        
                        <div class="top-box-chunk pause">
                            暂停按钮
                        </div>
                        <div class="top-box-chunk pause">
                            取消按钮
                        </div>
                        <div class="top-box-chunk pause">
                            编辑按钮
                        </div>
                        <div class="top-box-chunk pause">
                            下拉按钮
                        </div>
                    </div>
                    <div class="chunkList flex-col justify-center items-center">
                        <div 
                        v-show="item.state>0"
                        class="info w-full flex justify-between  ">
                            <span>{{item.file.size|showByte}}</span>
                            <span>已经上传: {{item.uploadSize|showByte}}/ 总长度 {{item.totalSize|showByte}}</span>
                            <span>
                                分享码:
                                <input type="text" v-model="item.shareCode">
                                <button type="button" @click="saveShareCode(item)">
                                    确定
                                </button>
                            </span>
                        </div>
                        <!-- 绘制同等数量的分块, -->
                        <div class="chunkListBox" v-show="item.isDrop&&item.chunkList.length">
                            <div 
                            v-for="(chunk,chunkIndex) in item.chunkList"
                            :key="chunkIndex"
                            class="relative chunk border border-black"
                            >
                                <div 
                                class="progressBar-position w-full bg-green-200"
                                :style="{
                                        height: chunk.progress + '%'
                                    }"
                                >

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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
             * Array.state 状态 0 等待 1 前端处理中计算hash 2上传中 3上传成功
             * Array.isPaused 是否暂停 0 否 1是
            */
            fileUpdateTaskList: [],
            selectedTaskArr:[],
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
            setShareCodeUrl: 'http://localhost:8001/api/shareCode/set',
            updateShareCodeUrl: 'http://localhost:8001/api/shareCode/update',

            // 线程列表
            workers: {

            },
            
        }
    },
    filters:{
        fileState: function(value){
            if(value === null) return value;
            switch(value){
                case 0:
                    return '等待处理';
                case 1:
                    return '计算hash';
                case 2:
                    return '上传中';
                case 3:
                    return '上传成功';
                case 4:
                    return '秒传成功';
                default:
                    return '未知状态';
                    break;
            }
        },
        showByte(value){
            value = parseInt(value);
            const kb = 1024;
            const mb = 1024 * 1024;
            const gb = 1024 * 1024 * 1024;
            const tb = 1024 * 1024 * 1024 * 1024;
            if(value / gb >= 1){
                return (value/gb).toFixed(2) + ' GB';
            }else if(value / mb >= 1){

                return (value/mb).toFixed(2) + ' MB'
            }else if(value / kb >= 1){
                return (value/kb).toFixed(2) + ' KB'
            }else{
                return value + ' Byte'
            }
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
                    xhr.onprogress = onProgress;
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
        /** 选中元素 */
        switchTaskHandel(i){
            if (!this.selectedTaskArr.includes(i))return this.selectedTaskArr.push(i);
            console.log(this.selectedTaskArr)
            console.log(typeof this.selectedTaskArr);

            //从数组中移除对应元素
            let index = this.selectedTaskArr.findIndex(n=>i==n);
            this.selectedTaskArr.splice(index,1);
        },
        // input文件修改绑定的事件
        handelFileChange(e){
            const files = e.target.files;
            console.log(e.target.files);
            for(let i = 0; i< files.length;i++){
                this.createTask(files[i]);
            }
            this.$nextTick(this.taskRunning);

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
                hash: '',
                hashPercentage: 0,
                totalSize: 0,
                uploadSize: 0,
                isDrop: false,
                shareCode: '',
                nowShareCode: '',
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
                            this.fileUpdateTaskList[i].totalSize = this.fileUpdateTaskList[i].file.size;
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
                    // fileobj.hashPercentage = precentage;
                    this.fileUpdateTaskList[i].hashPercentage = precentage
                    console.log(precentage);
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
                this.fileUpdateTaskList[i].state = 4;
                this.fileUpdateTaskList[i].progress = 100;
                this.fileUpdateTaskList[i].uploadSize = this.fileUpdateTaskList[i].file.size;
                this.taskRunningNumber --;
                this.$nextTick(this.taskRunning);
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
            
            let requestList = fileChunkList.map((chunk,i)=>{
                // 创建form data 同时也可以创建相应的任务队列
                const chunkHash = `${hash}-${i}`
                const formData = new FormData();
                this.fileUpdateTaskList[fileUpdateTaskListIndex].chunkList.push({
                    index:i,
                    chunkHash,
                    state: 0,// 状态 0 默认状态 1准备发送 2 发送中 3 发送完成 
                    loaded: 0,//已经上传的数据量
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
                let state,flag,progress,loadedSize;
                if(existChunks.includes(chunkHash)){   
                    state = 3;
                    flag= false;
                    progress = 100;
                    loadedSize = fileChunkList[index].file.size;
                    // 本次上传的长度
                    this.fileUpdateTaskList[fileUpdateTaskListIndex].uploadSize += loadedSize;
                    this.fileUpdateTaskList[fileUpdateTaskListIndex].progress = (Math.min(this.fileUpdateTaskList[fileUpdateTaskListIndex].totalSize,this.fileUpdateTaskList[fileUpdateTaskListIndex].uploadSize) / this.fileUpdateTaskList[fileUpdateTaskListIndex].totalSize)*100;
                }else{
                    progress = 0;
                    loadedSize = 0;
                    state = 1;
                    flag= true;
                }
                this.fileUpdateTaskList[fileUpdateTaskListIndex].chunkList[index].state = state
                this.fileUpdateTaskList[fileUpdateTaskListIndex].chunkList[index].progress = progress

                return flag;
            });
            requestList = requestList.map(async (formData,index)=>{
                await this.request({
                    url: this.uploadChunkUrl,
                    data: formData,
                    onProgress: this.createProgressHandel(fileUpdateTaskListIndex,index),
                    // requestList: this.requestList
                }).then(data=>{
                    data= JSON.parse(data.data);
                    let state;
                    if(data.code == 1){
                        state = 3;
                    }else{
                        state = 2;
                    }
                    this.fileUpdateTaskList[fileUpdateTaskListIndex].chunkList[index].state
                    //判断当前分块是否成功
                });
                //自动重试
            });
            // 全部分块文件上传完成,合并文件
            let r = await Promise.all(requestList);
            await this.mergeRequest(hash,fileName);
            // 
            console.log('上传完成');
            this.fileUpdateTaskList[fileUpdateTaskListIndex].state = 3;
            this.taskRunningNumber --;
            this.$nextTick(this.taskRunning);

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
            return JSON.parse(data);
        },
        createProgressHandel(fileUpdateTaskListIndex,chunkIndex){
            let prevProgress = 0;
            let prevLoaded = 0;
            return (e)=>{
                // 更新分片文件
               let nowProgress = parseInt(String((e.loaded / e.total) * 100));
               this.fileUpdateTaskList[fileUpdateTaskListIndex].chunkList[chunkIndex].progress = nowProgress;
               
               // 本次上传长度.  =  总共上传了多少 总长度 20  9 18 19  9 - 0 18-9 19-9   9 9 1
               let nowUploadSize = prevProgress==nowProgress?e.loaded:e.loaded - prevLoaded;
               prevProgress = nowProgress;
            //    console.log(`
            //    -----------\n\n
            //    当前对应的chunkIndex: ${chunkIndex}\n
            //    当前块的上传进度: ${nowProgress}\n
            //    本次上传了: ${nowUploadSize}\n 
            //    上一次的数据长度: ${prevLoaded}\n 
            //    总上传进度: ${ e.loaded }\n\n
            //    -----------`)
               prevLoaded = e.loaded;
            
               // 本次上传的长度
               this.fileUpdateTaskList[fileUpdateTaskListIndex].uploadSize += nowUploadSize;
               this.fileUpdateTaskList[fileUpdateTaskListIndex].progress = (Math.min(this.fileUpdateTaskList[fileUpdateTaskListIndex].totalSize,this.fileUpdateTaskList[fileUpdateTaskListIndex].uploadSize) / this.fileUpdateTaskList[fileUpdateTaskListIndex].totalSize)*100;
            }
        },
        async saveShareCode(item){
            let url;
            if(!item.shareCode){
                return console.log('未输入hashCode')
            }
            if(item.nowShareCode && item.nowShareCode == item.shareCode){
                return console.log('两次code 一致,无需修改数据');
            }
            if(!item.hash){
                return console.log('文件hash值未计算出来,拒绝设置文件');
            }
            item.nowShareCode?url = this.setShareCodeUrl:url = this.updateShareCodeUrl;
            console.log(url);
            let data = {
                hash:item.hash,
                filename: item.file.name,
                shareCode: item.shareCode
            };
            await this.request({
                url,
                headers:{
                    'content-type':'application/json'
                },
                data,
            });
        }
    }
}
</script>

<style>
.lists{
    width: 100%;
    height: auto;
    max-height: calc(50px * 6);
    padding: 5px 0;
    overflow: auto;
}
.listItem{
    height: auto;
    width: 100%;
    /* padding: 0 5px; */
    box-sizing: border-box;
    position: relative;
}
.progressBar-position{
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    /* height: 100%; */
}
.hash{
    height:5px;
    font-size: 5px;
}
.total{
    height:45px;
}
.top-box{
    width: 100%;
    height: 45px;
    max-height: 45px;
    margin-top: 5px;
    padding: 0 15PX;
    flex-shrink:0;
    /* background-color: #fff; */
    position: relative;
    cursor: default;
    display: flex;
    justify-content: space-between;
    color: #2d2a2a;
}
.top-box-chunk{
    position: relative;
    margin: 0 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space:nowrap;
}
.selected{
    width: 25px;
    height: 25px;
}
.info{
    padding: 0 5px;
    font-size: 0.75em;
}
.file-name{
    width: 25%;
    overflow: hidden;
}
.top-box:hover{
    background-color: rgba(255, 255, 255, 0.3);
}
.chunkList{
    width: 100%;
    height: auto;
    max-height: calc(50px * 3);
    display: flex;
    justify-content: center;
    padding: 5px 0;
}
.chunkList .chunkListBox{
    width: 98%;
    height: auto;
    padding: 5px 0;
    box-shadow: 1px 1px 3px black;
    display: grid;
    grid-gap: 5px;
    grid-template-columns: repeat(auto-fill,20px);
    justify-content: center;
    overflow: auto;
}
.chunkList .chunkListBox > div{
    height: 20px;
}
</style>