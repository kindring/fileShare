const file = {};

file.extractExt = filename =>
filename.slice(filename.lastIndexOf("."), filename.length); // 提取后缀名



module.exports = file;