const fs = require('fs');

async function clearDir(path,option){
    let rmDir = await fs.rmdirSync(path,option);
    await fs.mkdirSync(path);
}


module.exports = clearDir;