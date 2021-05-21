const router = require('express').Router();
const multiparty = require('multiparty');
const fs = require('fs');
const fse = require('fs-extra')
const path = require('path');
const formidable = require('formidable');
const share = require('./share');
const { handel } = require('../../tools/index')

const UPLOAD_DIR = path.join(__dirname, '../../upload/');
const TEMP_DIR = path.join(__dirname, '../../tmp/');


const extractExt = filename =>
    filename.slice(filename.lastIndexOf("."), filename.length); // 提取后缀名


/** 检测是否需要上传 */
router.post('/uploadchunk', async(req, res) => {
    console.log('上传切片文件');
    const multipart = new multiparty.Form({ uploadDir: TEMP_DIR });

    multipart.parse(req, async(err, fields, files) => {
        // console.log(err, fields, files);
        if (err) {
            console.error(err.message);
            return res.end(err.message);
        }
        console.log(fields);
        const chunk = files.chunk[0];
        const [chunkHash] = fields.chunkHash;
        const [hash] = fields.hash;
        const [name] = fields.filename;
        const [index] = fields.index;
        const chunkPath = path.join(UPLOAD_DIR, `/${hash}/${chunkHash}`);
        let [data, error] = await handel(fse.moveSync(chunk.path, chunkPath));
        console.log('上传文件');
        res.json({
            code: error ? 2 : 1,
            message: error ? error.message : 'ok',
            name: chunkHash
        });
    });
});

// 检测文件
router.post('/verify', async(req, res) => {
    const { hash, filename, chunkTotal } = req.body;
    // 查看是否有对应的文件夹
    const dirPath = path.resolve(UPLOAD_DIR, `${hash}`);
    const ext = extractExt(filename);
    const filePath = path.resolve(dirPath, `${hash}${ext}`)
    let shouldUpload = true,
        existChunks = [];
    let dirIsExist = await fs.existsSync(dirPath);
    let isFolder, fileExist, dirList;
    try {
        console.log('文件夹是否存在');
        console.log(dirIsExist);
        console.log(hash);
        if (dirIsExist) {
            isFolder = await fs.lstatSync(dirPath).isDirectory();
            console.log(isFolder);
            // 已经有文件夹了
            if (isFolder) {
                //查看文件是否存在
                fileExist = await fs.existsSync(filePath);
                // 指定文件已经存在,妙传成功
                if (fileExist) {
                    shouldUpload = false;
                } else {
                    // 查看文件夹下边有什么文件
                    dirList = fs.readdirSync(dirPath);
                    console.log(dirList);
                    existChunks = dirList;
                }

            } else {
                await fs.mkdirSync(dirPath);
                shouldUpload = true;
            }
        } else {
            await fs.mkdirSync(dirPath);
            shouldUpload = true;
        }
        //如果文件存在则,读取文件夹内部的chunk列表信息
        // 查看文件夹内部有什么文件

    } catch (error) {
        console.log('文件夹不存在');
        console.error(error);
    }
    res.json({ shouldUpload, existChunks });
})

const pipeStream = (path, writeStream) =>
    new Promise(resolve => {
        const readStream = fse.createReadStream(path);
        readStream.on("end", () => {
            fse.unlinkSync(path);
            resolve();
        });
        readStream.pipe(writeStream);
    });

router.post('/merge', async(req, res) => {
    const { hash, size, filename } = req.body;
    console.log('合并文件');
    console.log(hash);
    // 读取列表中的文件;
    const chunkDir = path.resolve(UPLOAD_DIR, `${hash}`);
    const ext = extractExt(filename);
    const finalFileName = `${hash}${ext}`;
    const filePath = path.resolve(chunkDir, finalFileName)
    let chunkList = await fs.readdirSync(chunkDir);
    chunkList.sort((a, b) => a.split('-')[1] - b.split('-')[1]);
    chunkList = chunkList.filter(chunkPath => {
            if (chunkPath != finalFileName) {
                return true
            }
        })
        // 延迟一秒进行文件读取操作
        // await sleep(1);
    await Promise.all(
        chunkList.map(async(chunkPath, index) => {
            await pipeStream(
                path.resolve(chunkDir, chunkPath),
                fse.createWriteStream(filePath, {
                    start: index * size,
                    end: (index + 1) * size
                })
            )
        })
    )
    console.log('合并文件完成');
    res.json({
        code: 1,
        message: 'ok'
    })
})


router.use('share', share);

module.exports = router;