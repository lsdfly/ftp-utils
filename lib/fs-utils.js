const fs = require('fs');
// const path = require('path');
module.exports = {
    isDir(_path) {
        return fs.statSync(_path).isDirectory()
    },
    getFileName(o) {
        var pos = o.lastIndexOf("\\");
        return o.substring(pos + 1);
    },
   
    getDir(filePath) {
        var pos = filePath.lastIndexOf("\\");
        return filePath.substring(0, pos + 1);
    }
}