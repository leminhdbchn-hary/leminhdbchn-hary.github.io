/* Sổ Thu Chi – giao diện màu (skin)
   'gold' = Vàng đen (mặc định) · 'sky' = Xanh trắng · 'red' = Đỏ trắng
   Các giao diện sáng được tạo tự động từ app.css: chỉ đổi MÀU (nền, chữ, viền, bóng),
   không đổi kích thước, bố cục hay chức năng. */
(function(){
  var root=document.documentElement;
  /* Bảng màu cho từng giao diện sáng */
  var SKINS={
    sky:{name:'Xanh trắng',acc:[20,135,216],accL:[46,166,239],accD:[14,111,184],tint:[20,80,140],shadow:[20,70,120],
         bg:'#eaf4fb',bgTop:'#d9ecfa',card:'#ffffff',text:'#1c2733',sub:'#6b7c8c',hover:'#f2f8fd',green:'#1f9d5c',red:'#e0483c',meta:'#2ea6ef'},
    red:{name:'Đỏ trắng',acc:[226,20,45],accL:[240,58,74],accD:[184,10,32],tint:[150,20,35],shadow:[140,20,30],
         bg:'#fdf1f2',bgTop:'#fcdfe2',card:'#ffffff',text:'#2a1d20',sub:'#7d6a6d',hover:'#fff5f6',green:'#1f9d5c',red:'#d0021b',meta:'#e2142d'}
  };
  function getSkin(){var s='gold';try{s=localStorage.getItem('tc_skin')||'gold';}catch(e){}return SKINS[s]?s:'gold';}

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
  function mapColor(P,c,kind,prop){
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
    if(!neutral)return c;              /* các màu khác (đỏ, xanh lá, tím linh thú...) giữ nguyên */
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
        if(/\.sw\b|\.sw-/.test(r.selectorText))continue;   /* ô mẫu màu trong Cài đặt giữ nguyên màu thật */
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
  function extra(P,cls){
    var h='html.'+cls,a=out(P.acc,1),aL=out(P.accL,1),aD=out(P.accD,1),sh=P.shadow.join(',');
    return [
      h+'.'+cls+'{--bg:'+P.bg+'!important;--card:'+P.card+'!important;--text:'+P.text+'!important;--sub:'+P.sub+'!important;--blue:'+a+'!important;--blue-dark:'+aD+'!important;--green:'+P.green+'!important;--red:'+P.red+'!important;color-scheme:light;}',
      h+' body{background:linear-gradient(180deg,'+P.bgTop+' 0%,'+P.bg+' 260px,'+P.bg+' 100%) fixed,'+P.bg+'!important;color:'+P.text+';}',
      h+' .home-head{background:linear-gradient(135deg,'+aL+','+aD+')!important;}',
      h+' .home-head .hh-title{color:#ffffff!important;}',
      h+' .home-head .hh-sub{color:rgba(255,255,255,.85)!important;}',
      h+' .balance-card{box-shadow:0 8px 22px rgba('+sh+',.14)!important;}',
      h+' input,'+h+' select,'+h+' textarea{color:'+P.text+';}',
      h+' [stroke="#e2c28b"],'+h+' [stroke="#c29a5c"]{stroke:'+a+';}',
      h+' [style*="color:#a99d8d"]{color:'+P.sub+'!important;}',
      h+' .switch{background:rgba('+P.tint.join(',')+',.18);}',
      h+' .switch.on{background:linear-gradient(145deg,'+aL+','+aD+')!important;}',
      [' .tx-item',' .more-item',' .wcard',' .cat-row',' .month-box',' .field',' .amount-card',' .cat-picker',' .nw-cell',' .summary-box',' .insight-card'].map(function(s){return h+s;}).join(',')+'{box-shadow:0 1px 3px rgba('+sh+',.08);}',
      '@media (min-width:1000px){'+h+' .tx-item:hover,'+h+' .more-item:hover,'+h+' .cs-row:hover{background:'+P.hover+'!important;}}'
    ].join('\n');
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
    var light=!!SKINS[skin];
    var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',light?SKINS[skin].meta:'#0e0d0c');
    var sb=document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');if(sb)sb.setAttribute('content',light?'default':'black-translucent');
  }
  window.getSkin=getSkin;
  window.setSkin=function(s){if(s!=='gold'&&!SKINS[s])s='gold';try{localStorage.setItem('tc_skin',s);}catch(e){}apply(s);};
  apply(getSkin());
})();
