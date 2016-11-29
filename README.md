# tree-worker
iterator files in Node.js . ES6 

>  遍历并输出目录下的文件信息。

注意：使用的是`ES6`语法(ES6 syntax)。

```
  npm install --save tree-worker
```

## use
```js
  var treeWorker = new TreeWorker('C:\\Users\\Administrator.05121115\\Desktop\\demo');

  treeWorker.work().then((that)=>{   //init
      console.log('stat: ',that.getStat());
  });
  //or
  treeWorker.work('C:\\Users\\Administrator.05121115\\Desktop\\__MACOSX\\demo').then((that)=>{
      console.log('stat: ',that.stat);
  });
```

## methods

### treeWorker.work([pt])

*   `pt` `String`  directory path or file name.

return `Promise` instance.

## stat struct

```
  {
    type : resource.type,
    paths : path.parse(resource.path),
    origin: resource.path,
    encoding : 'utf-8',
    stats : resource.stats,
    files : resource.files,
    childrens : []
  }

```

example:

```js
   {
      'C:\Users\Administrator.05121115\Desktop\__MACOSX\demo':
       { type: 'S_IFDIR',
         paths:
          { root: 'C:\\',
            dir: 'C:\\Users\\Administrator.05121115\\Desktop\\__MACOSX',
            base: 'demo',
            ext: '',
            name: 'demo' },
         origin: 'C:\\Users\\Administrator.05121115\\Desktop\\__MACOSX\\demo',
         encoding: 'utf-8',
         stats:
          { dev: -64860894,
            mode: 16822,
            nlink: 1,
            uid: 0,
            gid: 0,
            rdev: 0,
            blksize: undefined,
            ino: 41658296553398184,
            size: 0,
            blocks: undefined,
            atime: 2016-11-14T03:38:10.427Z,
            mtime: 2016-11-10T15:10:14.000Z,
            ctime: 2016-11-14T03:38:10.537Z,
            birthtime: 2016-11-14T03:38:10.427Z 
         },
         files: [ '._.DS_Store' ],
         childrens: [ 'C:\\Users\\Administrator.05121115\\Desktop\\__MACOSX\\demo\\._.DS_Store' ] 
        },
      'C:\Users\Administrator.05121115\Desktop\__MACOSX\demo\._.DS_Store':
       { type: 'S_IFREG',
         paths:
          { root: 'C:\\',
            dir: 'C:\\Users\\Administrator.05121115\\Desktop\\__MACOSX\\demo',
            base: '._.DS_Store',
            ext: '.DS_Store',
            name: '._' },
         origin: 'C:\\Users\\Administrator.05121115\\Desktop\\__MACOSX\\demo\\._.DS_Store',
         encoding: 'utf-8',
         stats:
          { dev: -64860894,
            mode: 33206,
            nlink: 1,
            uid: 0,
            gid: 0,
            rdev: 0,
            blksize: undefined,
            ino: 18858823439835436,
            size: 120,
            blocks: undefined,
            atime: 2016-11-14T03:38:10.427Z,
            mtime: 2016-07-12T15:46:34.000Z,
            ctime: 2016-11-14T03:38:10.428Z,
            birthtime: 2016-11-14T03:38:10.427Z 
         },
         files: [],
         childrens: [] 
        } 
    }
```