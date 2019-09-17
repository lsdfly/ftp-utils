interface FtpConfig {
    /**
     * 连接地址
     */
    host: string
    /**
     * 用户名
     */
    user: string
    /**
     * 密码
     */
    password: string
    /**
     * 本地目录
     */
    localPath: string
    /**
     * 远程目录
     */
    remotePath: string
}
declare class FtpUtils {
    constructor(config: FtpConfig);
    /**
     * 连接服务器
     * @param callback 连接成功回调
     */
    connect(callback:Function): FtpUtils;
    emit(type: string,data:any): FtpUtils;
    off(type: string): FtpUtils;
    on(type: string,callback:Function): FtpUtils;
    mkdir(remotePath, callback:Function): FtpUtils;
    uploadFile(localPath, remotePath, callback:Function): FtpUtils;
    upload(callback: Function): FtpUtils;
    destroy(): FtpUtils;
}
export = FtpUtils