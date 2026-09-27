/* Sổ Thu Chi – lưu trữ trên máy bằng IndexedDB + tiện ích nén dữ liệu
   - IndexedDB chứa được nhiều hơn localStorage (~5MB) rất nhiều → dùng lâu dài không lo đầy.
   - localStorage vẫn giữ bản sao để mở app nhanh; khi localStorage đầy, IndexedDB là bản chính.
   - Bản sao lưu tự động (backups) cũng nằm trong IndexedDB.
   - StcZip: nén/giải nén chuỗi (gzip + base64) để gửi lên Cloud khi dữ liệu lớn. */
(function(){
  var DB_NAME='stc_store',DB_VER=1,dbp=null;
  function open(){
    if(dbp)return dbp;
    dbp=new Promise(function(res,rej){
      try{
        if(!window.indexedDB){rej(new Error('NO_IDB'));return;}
        var r=indexedDB.open(DB_NAME,DB_VER);
        r.onupgradeneeded=function(){
          var d=r.result;
          if(!d.objectStoreNames.contains('kv'))d.createObjectStore('kv');
          if(!d.objectStoreNames.contains('backups'))d.createObjectStore('backups',{keyPath:'id'});
        };
        r.onsuccess=function(){var d=r.result;d.onversionchange=function(){try{d.close();}catch(e){}dbp=null;};res(d);};
        r.onerror=function(){rej(r.error||new Error('IDB_OPEN'));};
        r.onblocked=function(){rej(new Error('IDB_BLOCKED'));};
      }catch(e){rej(e);}
    });
    dbp.catch(function(){dbp=null;});
    return dbp;
  }
  function run(store,mode,fn){
    return open().then(function(db){return new Promise(function(res,rej){
      var t;try{t=db.transaction(store,mode);}catch(e){rej(e);return;}
      var s=t.objectStore(store),out,q=fn(s);
      if(q)q.onsuccess=function(){out=q.result;};
      t.oncomplete=function(){res(out);};
      t.onerror=function(){rej(t.error||new Error('IDB_TX'));};
      t.onabort=function(){rej(t.error||new Error('IDB_ABORT'));};
    });});
  }
  window.StcStore={
    available:!!window.indexedDB,
    get:function(k){return run('kv','readonly',function(s){return s.get(k);});},
    set:function(k,v){return run('kv','readwrite',function(s){return s.put(v,k);});},
    del:function(k){return run('kv','readwrite',function(s){return s.delete(k);});},
    addBackup:function(rec){return run('backups','readwrite',function(s){return s.put(rec);});},
    getBackup:function(id){return run('backups','readonly',function(s){return s.get(id);});},
    delBackup:function(id){return run('backups','readwrite',function(s){return s.delete(id);});},
    /* danh sách bản sao lưu (không kèm dữ liệu), mới nhất trước */
    listBackups:function(){
      return open().then(function(db){return new Promise(function(res,rej){
        var t=db.transaction('backups','readonly'),s=t.objectStore('backups'),out=[],c=s.openCursor();
        c.onsuccess=function(){var cur=c.result;if(cur){var v=cur.value;out.push({id:v.id,at:v.at,n:v.n,w:v.w,label:v.label||'',size:v.size||0});cur.continue();}};
        t.oncomplete=function(){out.sort(function(a,b){return b.id-a.id;});res(out);};
        t.onerror=function(){rej(t.error);};
      });});
    }
  };
  try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(function(){});}catch(e){}

  /* ---------- Nén dữ liệu (gzip + base64) ---------- */
  function b64FromBytes(u8){var s='',CH=0x8000;for(var i=0;i<u8.length;i+=CH)s+=String.fromCharCode.apply(null,u8.subarray(i,i+CH));return btoa(s);}
  function bytesFromB64(b64){var bin=atob(b64),u8=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)u8[i]=bin.charCodeAt(i);return u8;}
  function streamBytes(stream){return new Response(stream).arrayBuffer().then(function(ab){return new Uint8Array(ab);});}
  window.StcZip={
    supported:typeof CompressionStream!=='undefined'&&typeof DecompressionStream!=='undefined',
    gzipB64:function(str){
      var cs=new CompressionStream('gzip');
      var stream=new Blob([str]).stream().pipeThrough(cs);
      return streamBytes(stream).then(b64FromBytes);
    },
    gunzipB64:function(b64){
      var ds=new DecompressionStream('gzip');
      var stream=new Blob([bytesFromB64(b64)]).stream().pipeThrough(ds);
      return new Response(stream).text();
    }
  };
})();
