/* Sổ Thu Chi – giao diện màu (skin)
   'gold' = Vàng đen (mặc định) · 'sky' = Xanh trắng · 'red' = Đỏ trắng
   Các giao diện sáng được tạo tự động từ app.css: chỉ đổi MÀU (nền, chữ, viền, bóng),
   không đổi kích thước, bố cục hay chức năng. */
(function(){
  var root=document.documentElement;
  /* Bảng màu cho từng giao diện. 'mono' (Tối giản): nền đen, chữ & nút trắng kem, icon cùng một tông */
  var SKINS={
    sky:{name:'Xanh trắng',acc:[20,135,216],accL:[46,166,239],accD:[14,111,184],tint:[20,80,140],shadow:[20,70,120],
         bg:'#eaf4fb',bgTop:'#d9ecfa',card:'#ffffff',text:'#1c2733',sub:'#6b7c8c',hover:'#f2f8fd',green:'#1f9d5c',red:'#e0483c',meta:'#2ea6ef'},
    red:{name:'Đỏ trắng',acc:[226,20,45],accL:[240,58,74],accD:[184,10,32],tint:[150,20,35],shadow:[140,20,30],
         bg:'#fdf1f2',bgTop:'#fcdfe2',card:'#ffffff',text:'#2a1d20',sub:'#7d6a6d',hover:'#fff5f6',green:'#1f9d5c',red:'#d0021b',meta:'#e2142d'},
    apple:{name:'Apple',apple:1,acc:[0,122,255],accL:[64,156,255],accD:[0,98,204],tint:[0,60,130],shadow:[0,0,0],
         bg:'#f2f2f7',bgTop:'#f2f2f7',card:'#ffffff',text:'#000000',sub:'#8e8e93',hover:'#f2f2f7',green:'#248a3d',red:'#ff3b30',meta:'#f2f2f7'},
    mono:{name:'Tối giản',dark:1,cream:[236,232,225],creamD:[208,203,195],
         bg:'#121212',card:'#1e1c1a',card2:'#262422',text:'#f2efe9',sub:'#9b968e',green:'#ece8e1',red:'#d4cfc7',meta:'#121212'}
  };
  /* 'auto' = tự theo cài đặt sáng/tối của điện thoại: tối → Vàng đen, sáng → Xanh trắng */
  var mq=window.matchMedia?window.matchMedia('(prefers-color-scheme: light)'):null;
  function getSkinPref(){var s='gold';try{s=localStorage.getItem('tc_skin')||'gold';}catch(e){}return s==='auto'||SKINS[s]?s:'gold';}
  function getSkin(){var s=getSkinPref();if(s==='auto')return mq&&mq.matches?'sky':'gold';return s;}

  /* ---------- xử lý màu ---------- */
  function parse(c){
    c=c.trim();var m;
    if(c[0]==='#'){
      var h=c.slice(1);if(h.length===3)h=h.split('').map(function(x){return x+x;}).join('');
      if(h.length!==6)return null;
      return {r:parseInt(h.slice(0,2),16),g:parseInt(h.slice(2,4),16),b:parseInt(h.slice(4,6),16),a:1};
    }
    if((m=c.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,\/]+([\d.]+%?))?\s*\)$/))){
      var a=m[4]===undefined?1:(m[4].slice(-1)==='%'?parseFloat(m[4])/100:parseFloat(m[4]));
      return {r:+m[1],g:+m[2],b:+m[3],a:a};
    }
    return null;
  }
  function hsl(o){
    var r=o.r/255,g=o.g/255,b=o.b/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,s=0,h=0,d=mx-mn;
    if(d){s=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?((g-b)/d+(g<b?6:0)):mx===g?((b-r)/d+2):((r-g)/d+4);h*=60;}
    return {h:h,s:s,l:l};
  }
  function out(c,a){return a>=1?'rgb('+c[0]+','+c[1]+','+c[2]+')':'rgba('+c[0]+','+c[1]+','+c[2]+','+(+a.toFixed(3))+')';}
  /* kind: 'bg' (nền/viền/bóng) hoặc 'fg' (chữ/icon) */
  /* Tối giản (nền tối): vàng -> trắng kem, mọi màu khác -> cùng tông xám, nền tối giữ nguyên */
  function mapDark(P,c,kind,prop){
    var o=parse(c);if(!o)return c;
    var x=hsl(o),warm=x.h>=18&&x.h<=55;
    var gold=warm&&x.s>=0.25&&x.l>=0.3&&x.l<=0.9;
    if(gold){
      if(o.a<1)return out(P.cream,Math.min(1,o.a*0.55));
      if(kind==='fg')return x.l>0.5?out(P.cream,1):P.sub;
      return x.l>0.5?out(P.cream,1):out(P.creamD,1);
    }
    if(x.s<0.3||warm)return c;
    var L=Math.round(.3*o.r+.59*o.g+.11*o.b);
    if(kind==='fg'&&L<150)L=200;          /* chữ/icon màu đậm -> xám sáng để đọc được trên nền tối */
    return out([L,L,L],o.a);
  }
  function mapColor(P,c,kind,prop){
    if(P.dark)return mapDark(P,c,kind,prop);
    var o=parse(c);if(!o)return c;
    var x=hsl(o),warm=x.h>=18&&x.h<=55,isWhite=o.r>=250&&o.g>=250&&o.b>=250,isBlack=o.r<=12&&o.g<=12&&o.b<=12;
    if(isWhite&&o.a<1)return out(P.tint,o.a*0.9);                       /* trắng mờ trên nền tối -> màu nhấn mờ */
    if(isBlack&&o.a<1)return prop.indexOf('shadow')>=0?out(P.shadow,o.a*0.35):c; /* bóng nhẹ hơn, lớp phủ giữ nguyên */
    var gold=warm&&x.s>=0.25&&x.l>=0.3&&x.l<=0.9;
    if(gold){
      if(o.a<1)return out(P.acc,o.a);
      if(kind==='fg')return x.l>0.55?out(P.acc,1):out(P.accD,1);
      return x.l>0.6?out(P.accL,1):out(P.accD,1);
    }
    var neutral=x.s<0.3||warm;
    if(!neutral){if(!P.flat)return c;  /* các màu khác (đỏ, xanh lá, tím linh thú...) giữ nguyên */
      var L=Math.round(.3*o.r+.59*o.g+.11*o.b);return out([L,L,L],o.a);} /* Tối giản: mọi màu về cùng tông xám */
    if(x.l<0.3){                       /* màu tối */
      if(kind==='fg')return out([255,255,255],o.a);
      if(o.a<1)return out([255,255,255],Math.min(1,o.a));
      return x.l<0.09?P.bg:P.card;
    }
    if(kind==='fg'&&!isWhite&&x.l>0.55&&(warm||x.s<0.3))return x.l>0.85?P.text:P.sub; /* chữ sáng -> chữ tối */
    return c;
  }
  var COLOR_RE=/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b|rgba?\([^)]*\)/g;
  function kindOf(p){return /^(color|fill|stroke|caret-color|-webkit-text-fill-color|text-decoration-color|column-rule-color)$/.test(p)?'fg':'bg';}
  function colorProp(p){return /color|background|shadow|border|outline|fill|stroke/.test(p);}
  function splitSel(s){var out=[],d=0,cur='';for(var i=0;i<s.length;i++){var ch=s[i];if(ch==='('||ch==='[')d++;else if(ch===')'||ch===']')d--;if(ch===','&&!d){out.push(cur);cur='';}else cur+=ch;}out.push(cur);return out.map(function(x){return x.trim();}).filter(Boolean);}
  function prefix(cls,sel){
    if(/^html\b/.test(sel))return sel.replace(/^html/,'html.'+cls);
    if(/^:root\b/.test(sel))return sel.replace(/^:root/,':root.'+cls);
    return 'html.'+cls+' '+sel;
  }
  function convertRules(P,cls,rules){
    var css='';
    for(var i=0;i<rules.length;i++){
      var r=rules[i];
      if(r.type===1){
        if(/\.sw\b|\.sw-/.test(r.selectorText))continue;
        if(/skin-/.test(r.selectorText))continue;          /* luật riêng của từng giao diện: giữ nguyên */   /* ô mẫu màu trong Cài đặt giữ nguyên màu thật */
        var decl='';
        for(var j=0;j<r.style.length;j++){
          var p=r.style[j];if(p.indexOf('--')===0||!colorProp(p))continue;
          var v=r.style.getPropertyValue(p);COLOR_RE.lastIndex=0;if(!v||!COLOR_RE.test(v))continue;COLOR_RE.lastIndex=0;
          var k=kindOf(p),nv=v.replace(COLOR_RE,function(c){return mapColor(P,c,k,p);});
          if(nv!==v)decl+=p+':'+nv+(r.style.getPropertyPriority(p)?' !important':'')+';';
        }
        if(decl)css+=splitSel(r.selectorText).map(function(s){return prefix(cls,s);}).join(',')+'{'+decl+'}\n';
      }else if(r.type===4&&r.cssRules){
        var inner=convertRules(P,cls,r.cssRules);if(inner)css+='@media '+r.conditionText+'{'+inner+'}\n';
      }else if(r.type===12&&r.cssRules){
        var inner2=convertRules(P,cls,r.cssRules);if(inner2)css+='@supports '+r.conditionText+'{'+inner2+'}\n';
      }
    }
    return css;
  }
  function extraDark(P,cls){
    var h='html.'+cls,cr=out(P.cream,1);
    return [
      h+'.'+cls+'{--bg:'+P.bg+'!important;--card:'+P.card+'!important;--text:'+P.text+'!important;--sub:'+P.sub+'!important;--blue:'+cr+'!important;--blue-dark:'+out(P.creamD,1)+'!important;--green:'+P.green+'!important;--red:'+P.red+'!important;color-scheme:dark;}',
      h+' body{background:'+P.bg+'!important;color:'+P.text+';}',
      h+' .balance-card,'+h+' .total-card{box-shadow:none!important;border:1px solid rgba(255,255,255,.05);}',
      [' .tx-item',' .more-item',' .wcard',' .month-box',' .field',' .amount-card',' .nw-cell',' .insight-card',' .rep-card',' .grp-card'].map(function(s){return h+s;}).join(',')+'{box-shadow:none!important;}',
      h+' .tab:not(.active),'+h+' .tab:not(.active) .tab-label{color:#8a857e!important;}',
      h+' .tab.active,'+h+' .tab.active .tab-label{color:'+P.text+'!important;}',
      '@media (max-width:999.98px){'+h+' .tabbar{left:14px!important;right:14px!important;bottom:calc(10px + env(safe-area-inset-bottom,0px))!important;border-radius:30px!important;border:1px solid rgba(255,255,255,.06)!important;background:'+P.card+'!important;box-shadow:0 8px 24px rgba(0,0,0,.45)!important;}'+h+' .tabbar::after{display:none!important;}'+h+' .screen{padding-bottom:calc(126px + env(safe-area-inset-bottom,0px));}}',
      '@media (min-width:1000px){'+h+' .tabbar{background:'+P.card+'!important;border-right:1px solid rgba(255,255,255,.06)!important;}'+h+' .tx-item:hover,'+h+' .more-item:hover{background:'+P.card2+'!important;}}'
    ].join('\n');
  }
  /* Giao diện Apple (iOS): các luật riêng, đặt sau luật màu chung */
  var APPLE_CSS="HH{--r-card:14px;--r-btn:12px;--bg:#f2f2f7!important;--card:#ffffff!important;--text:#000000!important;--sub:#8e8e93!important;--blue:#007aff!important;--blue-dark:#0062cc!important;--green:#248a3d!important;--red:#ff3b30!important;}HH body,HH button,HH input,HH select,HH textarea{font-family:-apple-system,BlinkMacSystemFont,\"SF Pro Text\",\"SF Pro Display\",\"Helvetica Neue\",system-ui,\"Be Vietnam Pro\",sans-serif;}HH body{background:#f2f2f7!important;-webkit-font-smoothing:antialiased;}HH .home-head{background:transparent!important;border-radius:0!important;padding-bottom:34px!important;}HH .home-head .pf-name,HH .home-head .hh-title{color:#000!important;font-size:30px;font-weight:700;letter-spacing:.3px;}HH .home-head .pf-hi,HH .home-head .hh-sub{color:#8e8e93!important;}HH .screen-title{font-size:32px;font-weight:700;letter-spacing:.35px;}HH .back-btn{background:rgba(0,122,255,.1)!important;color:#007aff!important;border:0!important;}HH .balance-card,HH .total-card{background:#fff!important;border:0!important;border-radius:16px!important;box-shadow:0 1px 2px rgba(0,0,0,.05)!important;}HH .balance-card .amount{color:#000!important;font-weight:700;}HH .balance-card .label{color:#8e8e93!important;}HH .today-line{background:#f2f2f7!important;color:#000!important;}HH .bal-links button{color:#007aff!important;}HH .tx-item,HH .more-item,HH .wcard,HH .month-box,HH .field,HH .amount-card,HH .cat-picker,HH .nw-cell,HH .summary-box,HH .rep-card,HH .debt-card,HH .home-budget,HH .loan-notify,HH .hq-sum,HH .rep-detail,HH .mode-card,HH .empty.empty-rich{box-shadow:none!important;border:0!important;}HH .mode-card{background:#fff!important;}HH .cat-emoji,HH .tx-icon{border:1px solid rgba(60,60,67,.16)!important;background:transparent!important;}HH .section-title{font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;color:#6d6d72;margin:22px 4px 8px;}HH .day-group .tx-item{border-radius:0!important;margin:0!important;border-bottom:.5px solid rgba(60,60,67,.14)!important;}HH .day-group .day-head+.tx-item{border-radius:14px 14px 0 0!important;}HH .day-group .tx-item:last-child{border-radius:0 0 14px 14px!important;border-bottom:0!important;}HH .day-group .day-head+.tx-item:last-child{border-radius:14px!important;}HH .day-head{background:#f2f2f7!important;}HH #screen-more .inner>.more-item,HH #screen-more .inner>.more-group{border-radius:0!important;margin:0!important;background:#fff!important;border-bottom:.5px solid rgba(60,60,67,.14)!important;}HH #screen-more .inner>.more-group>.grp-head{margin:0!important;border-radius:0!important;background:transparent!important;border:0!important;}HH #screen-more .inner>.more-sec+.more-item,HH #screen-more .inner>.more-sec+.more-group{border-radius:14px 14px 0 0!important;}HH #screen-more .inner>.more-item:has(+.more-sec),HH #screen-more .inner>.more-group:has(+.more-sec),HH #screen-more .inner>.more-item:has(+#more-trash){border-radius:0 0 14px 14px!important;border-bottom:0!important;}HH #screen-more .inner>.more-sec+.more-item:has(+.more-sec),HH #screen-more .inner>.more-sec+.more-group:has(+.more-sec){border-radius:14px!important;}HH #screen-more .inner>#more-trash{margin-top:22px!important;border-radius:14px!important;justify-content:center;}HH .more-sec{color:#6d6d72;font-size:13px;letter-spacing:.4px;margin:22px 16px 7px;}@media (max-width:999.98px){HH .tabbar{left:0!important;right:0!important;bottom:0!important;max-width:none!important;border-radius:0!important;background:rgba(249,249,249,.93)!important;-webkit-backdrop-filter:saturate(180%) blur(22px)!important;backdrop-filter:saturate(180%) blur(22px)!important;border:0!important;border-top:.5px solid rgba(60,60,67,.29)!important;box-shadow:none!important;padding:6px 4px calc(6px + env(safe-area-inset-bottom,0px))!important;}HH .tabbar::after{display:none!important;}}@media (min-width:1000px){HH .tabbar{background:rgba(249,249,249,.9)!important;-webkit-backdrop-filter:saturate(180%) blur(22px)!important;backdrop-filter:saturate(180%) blur(22px)!important;border-right:.5px solid rgba(60,60,67,.29)!important;}}HH .tab .tab-label{font-size:10px;font-weight:500;}HH .tab:not(.active),HH .tab:not(.active) .tab-label{color:#8e8e93!important;}HH .tab.active,HH .tab.active .tab-label{color:#007aff!important;}HH .tab.active .tab-icon{background:transparent!important;}HH .tab .fab{background:#007aff!important;color:#fff!important;box-shadow:0 3px 10px rgba(0,122,255,.35)!important;width:54px!important;height:54px!important;font-size:34px!important;margin-top:-22px!important;}HH body.scrolled .screen.active .inner>.scr-head,HH body.scrolled .screen.active .inner>.more-head,HH body.scrolled .screen.active .inner>h2.screen-title{background:rgba(242,242,247,.85)!important;border-bottom:.5px solid rgba(60,60,67,.2)!important;}HH .save-btn,HH .edit-modal-save,HH .onb-next,HH .er-cta,HH .app-dlg-ok{background:#007aff!important;color:#fff!important;border-radius:12px;font-weight:600;box-shadow:none!important;}HH .app-dlg-ok.danger{background:#ff3b30!important;}HH .ghost-btn,HH .edit-modal-cancel,HH .app-dlg-cancel,HH .onb-skip{background:rgba(0,122,255,.1)!important;color:#007aff!important;border:0!important;}HH .we-del{background:rgba(255,59,48,.1)!important;color:#ff3b30!important;border:0!important;}HH .type-tabs:not(.debt-quick),HH .period-tabs,HH .rl-tabs{background:rgba(118,118,128,.12);border-radius:9px;padding:2px;gap:0!important;}HH .type-tabs:not(.debt-quick) button,HH .period-tabs button,HH .rl-tabs button,HH .rl-tabs .rl-daybtn{background:transparent!important;color:#000!important;border:0!important;border-radius:7px!important;box-shadow:none!important;font-weight:500;}HH .type-tabs:not(.debt-quick) button.active,HH .period-tabs button.active,HH .rl-tabs button.active,HH .rl-tabs .rl-daybtn.active{background:#fff!important;box-shadow:0 3px 8px rgba(0,0,0,.12),0 3px 1px rgba(0,0,0,.04)!important;font-weight:600;}HH .type-tabs button.active.chi{color:#ff3b30!important;}HH .type-tabs button.active.thu{color:#34c759!important;}HH .type-tabs button.active.xfer,HH .type-tabs button.active.fam{color:#007aff!important;}HH .range-nav button{background:rgba(0,122,255,.1)!important;color:#007aff!important;}HH .switch{background:rgba(120,120,128,.32)!important;}HH .switch.on{background:#34c759!important;}HH .switch span{box-shadow:0 2px 4px rgba(0,0,0,.25),0 0 1px rgba(0,0,0,.2);}HH .hf-q,HH #moreSearch,HH .home-search{background:rgba(118,118,128,.12)!important;border:0!important;border-radius:10px!important;color:#000;}HH .amt-chips button,HH .add-tools button,HH .tpl-chip{background:rgba(0,122,255,.08)!important;border:0!important;color:#007aff!important;}HH .sel-bar,HH .ptr{background:rgba(249,249,249,.92)!important;-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);border:.5px solid rgba(60,60,67,.2)!important;}HH .app-dlg-card,HH .edit-modal-card,HH .onb-card{background:rgba(255,255,255,.96)!important;border:0!important;border-radius:18px!important;box-shadow:0 20px 60px rgba(0,0,0,.25)!important;}HH .app-dlg-msg,HH .onb-card h2{color:#000!important;}HH .app-dlg-acts button,HH .onb-acts button{border-radius:12px!important;}HH .splash{background:#f2f2f7!important;}HH .splash b{color:#000!important;}HH .home-head{box-shadow:none!important;}HH .more-item svg.si,HH .acc-ic svg.si,HH .dc-ic svg.si{color:#007aff!important;}HH #screen-more .inner>#more-profile{border-radius:14px!important;border-bottom:0!important;margin-bottom:0!important;}HH #screen-more .inner>#more-profile+.more-sec{margin-top:26px;}HH .total-card,HH .total-card .tc-l,HH .total-card .tc-l span,HH .total-card .tc-v,HH .total-card .tc-v .eye-btn,HH .total-card .cur,HH .total-card sup{color:#000!important;text-shadow:none!important;}HH .total-card .tc-l,HH .total-card .tc-l span{color:#8e8e93!important;}HH .total-card .tc-v .eye-btn{color:#007aff!important;}HH .pos,HH .tx-amt.in,HH .hf-sum .hs-thu,HH .dc-v.pos,HH .rc-ok,HH .hq-grid b.pos,HH .wq-month b.pos,HH .rep-delta.good,HH .month-box .v[style*=\"green\"],HH .summary-box .v[style*=\"green\"]{color:#248a3d!important;}HH .tx-amt.fam{color:#c43b7e!important;}HH .fam-tag{background:rgba(120,120,128,.14)!important;color:#3c3c43!important;}HH .fc-name{color:#000!important;}HH .debt-pay-row button{background:#248a3d!important;color:#fff!important;}HH .debt-card .dc-v.neg{color:#d70015!important;}";
  function extraApple(cls){return APPLE_CSS.replace(/HH/g,'html.'+cls);}
  function extra(P,cls){
    if(P.dark)return extraDark(P,cls);
    var h='html.'+cls,a=out(P.acc,1),aL=out(P.accL,1),aD=out(P.accD,1),sh=P.shadow.join(',');
    return [
      h+'.'+cls+'{--bg:'+P.bg+'!important;--card:'+P.card+'!important;--text:'+P.text+'!important;--sub:'+P.sub+'!important;--blue:'+a+'!important;--blue-dark:'+aD+'!important;--green:'+P.green+'!important;--red:'+P.red+'!important;color-scheme:light;}',
      h+' body{background:'+(P.flat?P.bg:'linear-gradient(180deg,'+P.bgTop+' 0%,'+P.bg+' 260px,'+P.bg+' 100%) fixed,'+P.bg)+'!important;color:'+P.text+';}',
      h+' .home-head{background:'+(P.flat?aD:'linear-gradient(135deg,'+aL+','+aD+')')+'!important;}',
      h+' .home-head .hh-title{color:#ffffff!important;}',
      h+' .home-head .hh-sub{color:rgba(255,255,255,.85)!important;}',
      h+' .home-head .pf-name{color:#ffffff!important;}',
      h+' .home-head .pf-hi{color:rgba(255,255,255,.85)!important;}',
      h+' .balance-card{box-shadow:'+(P.flat?'none;border:1px solid #e4e4e7':'0 8px 22px rgba('+sh+',.14)')+'!important;}',
      (P.flat?h+' .tab:not(.active),'+h+' .tab:not(.active) .tab-label{color:#8a8a8e!important;}\n'+h+' .tab:not(.active) svg{stroke:#8a8a8e!important;}':''),
      h+' input,'+h+' select,'+h+' textarea{color:'+P.text+';}',
      h+' .fam-tag{background:rgba(120,120,128,.14)!important;color:#3c3c43!important;}',
      h+' .fc-name{color:'+P.text+'!important;}',
      h+' [stroke="#e2c28b"],'+h+' [stroke="#c29a5c"]{stroke:'+a+';}',
      h+' [style*="color:#a99d8d"]{color:'+P.sub+'!important;}',
      h+' .switch{background:rgba('+P.tint.join(',')+',.18);}',
      h+' .switch.on{background:linear-gradient(145deg,'+aL+','+aD+')!important;}',
      [' .tx-item',' .more-item',' .wcard',' .cat-row',' .month-box',' .field',' .amount-card',' .cat-picker',' .nw-cell',' .summary-box',' .insight-card'].map(function(s){return h+s;}).join(',')+'{box-shadow:'+(P.flat?'none;border:1px solid #ececee':'0 1px 3px rgba('+sh+',.08)')+';}',
      '@media (min-width:1000px){'+h+' .tx-item:hover,'+h+' .more-item:hover,'+h+' .cs-row:hover{background:'+P.hover+'!important;}}'
    ].join('\n')+(P.apple?'\n'+extraApple(cls):'');
  }
  var built={};
  function build(skin){
    if(built[skin])return;built[skin]=true;
    var P=SKINS[skin],cls='skin-'+skin,css='';
    for(var i=0;i<document.styleSheets.length;i++){
      var sh=document.styleSheets[i];if(!sh.href||sh.href.indexOf('app.css')<0)continue;
      try{css+=convertRules(P,cls,sh.cssRules);}catch(e){}
    }
    css+=extra(P,cls);
    var st=document.createElement('style');st.id='skinCss-'+skin;st.textContent=css;document.head.appendChild(st);
  }
  function apply(skin){
    Object.keys(SKINS).forEach(function(k){root.classList.toggle('skin-'+k,k===skin);});
    if(SKINS[skin])build(skin);
    var light=!!SKINS[skin]&&!SKINS[skin].dark;
    var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',SKINS[skin]?SKINS[skin].meta:'#0e0d0c');
    var sb=document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');if(sb)sb.setAttribute('content',light?'default':'black-translucent');
  }
  window.getSkin=getSkin;window.getSkinPref=getSkinPref;
  window.setSkin=function(s){if(s!=='gold'&&s!=='auto'&&!SKINS[s])s='gold';try{localStorage.setItem('tc_skin',s);}catch(e){}apply(getSkin());};
  if(mq){var onMq=function(){if(getSkinPref()==='auto'){apply(getSkin());try{if(window.renderSkinOpts)renderSkinOpts();}catch(e){}}};if(mq.addEventListener)mq.addEventListener('change',onMq);else if(mq.addListener)mq.addListener(onMq);}
  apply(getSkin());
})();
