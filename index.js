'use strict';

const fs = require('fs');
const path = require('path');

/*const S_IFMT   = 0xf000; //bit mask for the file type bit field
const S_IFSOCK = 0xc000; //socket
const S_IFLNK  = 0xa000; //symbolic link
const S_IFREG  = 0x8000; //regular file
const S_IFBLK  = 0x6000; //block device
const S_IFDIR  = 0x4000; //directory
const S_IFCHR  = 0x2000; //character device
const S_IFIFO  = 0x1000; //FIFO*/

let getFileType = function(stats){
    if ( stats.isFile() ) {
        return 'S_IFREG';
    }
    if ( stats.isDirectory() ) {
        return 'S_IFDIR';
    }
    if ( stats.isBlockDevice() ) {
        return 'S_IFBLK';
    }
    if ( stats.isCharacterDevice() ) {
        return 'S_IFCHR';
    }
    if ( stats.isFIFO() ) {
        return 'S_IFIFO';
    }
    if ( stats.isSocket() ) {
        return 'S_IFSOCK';
    }
    if ( stats.isSymbolicLink() ) {
        return 'S_IFLNK';
    }
    return 'S_UNKOWN';
};

let fstats = function(pt){
    return new Promise((resolve , reject)=>{
        fs.stat(path.normalize(pt) , (err , stats)=>{
            if ( err ) return reject(err);
            return resolve(stats);
        });
    });
};

let fileInfo = function(resource){
    return new Promise((resolve , reject)=>{
        try{
            return resolve({
                type : resource.type,
                paths : path.parse(resource.path),
                origin: resource.path,
                encoding : 'utf-8',
                stats : resource.stats,
                files : resource.files,
                childrens : []
            });
        }catch(e){
            return reject(e);
        }
    });
};

let freaddir = function(pt){
    return new Promise((resolve , reject)=>{
        fs.readdir(path.normalize(pt) , (err , files)=>{
            if ( err ) return reject(err);
            return resolve(files);
        });
    });
};

let reader = function(pt){
    let resource = {};
    return  fstats(pt)
            .then((stats)=>{
                resource.type = getFileType(stats);
                resource.stats = stats;
                return pt;
            })
            .then(freaddir)
            .then((files)=>{
                return files;
            },()=>{
                return [];
            })
            .then((files)=>{
                resource.files = files;
                resource.path = pt;
                return resource;
            })
            .then(fileInfo);
};

let workerIterator = function(stat){
    let ps = [];
    if ( stat.files.length > 0 ) {
        for ( let i = 0 ; i < stat.files.length ; i++ ){
            ps.push(reader(path.resolve(stat.origin , stat.files[i])));
        }
    }
    return Promise.all(ps)
            .then((stats)=>{
                return {stat:stat , childrens:stats};
            }).then(concatWorker);
};

let concatWorker = function(resource){
    let stats = [] , stat = resource.stat , childrens = resource.childrens;
    for (let i = 0 ; i < childrens.length ; i++ ){
        stats.push(childrens[i]);
        stat.childrens.push(childrens[i].origin);
    }
    return {stat : stat , stats : stats};
};

let concatStat = function(stat){
    return (resource)=>{
        stat[resource.stat.origin] = resource.stat;
        for (let i = 0 ; i < resource.stats.length ; i++ ){
            stat[resource.stats[i].origin] = resource.stats[i];
        }
        return stat;
    };
};

let workerProcess = function(that , pt){
    let concatStatFun = concatStat(that.stat);
    return reader(pt ? pt : that.path).then(workerIterator).then(concatStatFun);
};

let formatPath = function(pt){
    return pt && typeof pt === 'string' ? pt.trim() : '';
};

class TreeWorker{
    constructor(pt){
        this.path = '';
        this.stat = {};
        this.isInit = false;
        this.setPath(pt);
    }
    setStat(stat){
        if ( ({}).toString.call(stat) === '[object Object]' ) {
            this.stat = stat;            
        }
        return this;
    }
    getStat(){
        return this.stat;
    }
    setPath(pt){
        this.path = formatPath(pt);
        return this;
    }
    work(pt){
        let _this = this;
        pt = formatPath(pt);
        if ( !this.path && !!pt ) {
            return this.setPath(pt).work();
        }
        if ( this.isInit ) {
            return workerProcess(this , pt).then(()=>{return _this;});
        }else if ( !!pt ){
            return workerProcess(this).then(()=>{_this.isInit = true;}).then(()=>{
                return workerProcess(_this ,pt);
            }).then(()=>{return _this;});
        }else{
            return workerProcess(this).then(()=>{_this.isInit = true;}).then(()=>{return _this;});
        }
    }
}

module.exports = TreeWorker;
