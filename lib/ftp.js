const ftp = require('ftp');
const fsUtils = require('./fs-utils')
const path = require('path')
const fs = require('fs')
const EVENT_PROGRESS = 'progress',
    DOWNLOAD_TYPE = 'download',
    UPLOAD_TYPE = 'upload'
class FtpUtils {
    constructor(config) {

        this._config = {}
        this.events = {};
        Object.assign(this._config, {

        }, config);
        this.cacheCreateDir = {};
        this._client = new ftp();

    }
    connect(callback) {
        let _this = this;
        let client = this._client;
        // console.log('连接');
        client.connect(this._config);
        client.on('ready', function () {
            let args = Array.prototype.slice.call(arguments);
            callback.apply(_this, args)
        });
        return this;
    }
    emit(type, data) {
        console.log('emit', type);

        if (this.events[type]) {
            let events = this.events[type];
            events.forEach(v => {
                v && v.call(this, data);
            })
        }
        return this;
    }
    off(type) {
        if (type) {
            delete this.events[type];
        }
        return this;
    }
    on(type, callback) {
        if (type && callback) {
            if (!this.events[type]) {
                this.events[type] = [];
            }
            this.events[type].push(callback);
        }
        return this;
    }
    generateUploadDir(localPath, remotePath) {
        let files = [];

        let f = fs.readdirSync(localPath);
        for (let i = 0; i < f.length; i++) {
            let joinLocalPath = `${localPath}\\${f[i]}`;
            let joinRemotePath = `${remotePath}/${f[i]}`;
            if (fsUtils.isDir(joinLocalPath)) {

                // this._client.mkdir(joinRemotePath, true, (err) => {
                //     if (err) {
                //         console.log('err', err);

                //         return
                //     }
                //     console.log('创建', err, joinLocalPath);
                //     console.log('远程路径', joinRemotePath);
                //     this.uploadRemote(joinLocalPath, joinRemotePath);
                // })
                // files.push({
                //     localPath: joinLocalPath,
                //     remotePath: joinRemotePath,
                //     isDir: true
                // })
                files = files.concat(this.generateUploadDir(joinLocalPath, joinRemotePath))
            } else {
                files.push({
                    localPath: joinLocalPath,
                    remotePath: joinRemotePath,
                    isDir: false
                })
            }
        }
        return files;
    }
    mkdir(remoteDir, callback) {
        let _this = this;
        if (this.cacheCreateDir[remoteDir]) {
            callback && callback.call(this, null);
            return
        }

        this._client.mkdir(remoteDir, true, function (err) {
            _this.cacheCreateDir[remoteDir] = true;
            callback && callback.call(this, err);
        });
        return this;
    }
    uploadFile(localPath, remotePath, callback) {
        let _this = this;
        let remoteDir = fsUtils.getDir(remotePath);
        _this.mkdir(remoteDir, function (err) {
            _this._client.put(fs.readFileSync(localPath), remotePath, function () {
                callback && callback.call(this, err);
            })
        });
        return this;
    }
    upload(callback) {
        this.on(EVENT_PROGRESS, callback)
        let _this = this;
        let config = this._config;
        config.localPath = path.resolve(process.cwd(), config.localPath);
        let {
            remotePath
        } = config;
        config.remotePath = remotePath[remotePath.length - 1] == '/' ? remotePath.substring(0, remotePath.length - 1) : remotePath
        let count = 0;
        let progress = (c) => {
            return function (err) {
                count++;
                _this.emit(EVENT_PROGRESS, {
                    remotePath: c.remotePath,
                    type: c.type,
                    percent: ((count / files.length) * 100)
                })

            }
        }
        let files = this.generateUploadDir(config.localPath, config.remotePath);


        for (let i = 0; i < files.length; i++) {
            if (files[i].isDir) {
                this.mkdir(files[i].remotePath, progress({
                    type: UPLOAD_TYPE,
                    remotePath: files[i].remotePath
                }))
            } else {
                this.uploadFile(files[i].localPath, files[i].remotePath, progress({
                    type: UPLOAD_TYPE,
                    remotePath: files[i].remotePath
                }))
            }
        }
        return this;
    }
    destroy() {
        this._client.destroy();
        this.cacheCreateDir = {};
        this.events = {}
        return this;
    }
}
module.exports = FtpUtils;