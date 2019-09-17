install
```bash
yarn add ftp-utils
or
npm i ftp-utils
```
```js
const ftp = require('ftp-utils')
let c = new ftp({
    host: 'xxxx.my3w.com',
    user: 'xxxx',
    password: 'xxxx',
    //远程目录
    remotePath: '/htdocs/xxx/',
    //本地目录
    localPath: 'dist',
}).connect(function () {
    let _this = this;
    this.upload(function(res){
         console.log('上传进度：',res.percent);
         console.log('远程路径：',res.remotePath);
         if(res.percent==100){
             //关闭连接
            _this.destroy(); 
         }
    })
    this.on('progress',function(res){
         console.log('上传进度：',res.percent);
         console.log('远程路径：',res.remotePath);
    })
});
```