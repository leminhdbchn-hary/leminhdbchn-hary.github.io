/* Sổ Thu Chi – giao diện màu (skin)
   'gold' = Vàng đen (mặc định) · 'sky' = Xanh da trời & trắng
   Giao diện Xanh trắng được tạo tự động từ app.css: chỉ đổi MÀU (nền, chữ, viền, bóng),
   không đổi kích thước, bố cục hay chức năng. */
(function(){
  var root=document.documentElement;
  function getSkin(){try{return localStorage.getItem('tc_skin')==='sky'?'sky':'gold';}catch(e){return 'gold';}}

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
  function out(r,g,b,a){return a>=1?'rgb('+r+','+g+','+b+')':'rgba('+r+','+g+','+b+','+(+a.toFixed(3))+')';}
  var BLUE=[20,135,216],BLUE_L=[46,166,239],BLUE_D=[14,111,184];
  /* kind: 'bg' (nền/viền/bóng) hoặc 'fg' (chữ/icon) */
  function mapColor(c,kind,prop){
    var o=parse(c);if(!o)return c;
    var x=hsl(o),warm=x.h>=18&&x.h<=55,isWhite=o.r>=250&&o.g>=250&&o.b>=250,isBlack=o.r<=12&&o.g<=12&&o.b<=12;
    /* trắng trong suốt trên nền tối -> xanh nhạt trong suốt */
    if(isWhite&&o.a<1)return out(20,80,140,o.a*0.9);
    /* đen trong suốt: bóng đổ nhẹ hơn, lớp phủ giữ nguyên */
    if(isBlack&&o.a<1)return prop.indexOf('shadow')>=0?out(20,70,120,o.a*0.35):c;
    var gold=warm&&x.s>=0.25&&x.l>=0.3&&x.l<=0.9;
    if(gold){
      if(o.a<1)return out(BLUE[0],BLUE[1],BLUE[2],o.a);
      if(kind==='fg')return x.l>0.55?out(BLUE[0],BLUE[1],BLUE[2],1):out(BLUE_D[0],BLUE_D[1],BLUE_D[2],1);
      return x.l>0.6?out(BLUE_L[0],BLUE_L[1],BLUE_L[2],1):out(BLUE_D[0],BLUE_D[1],BLUE_D[2],1);
    }
    var neutral=x.s<0.3||warm;
    if(!neutral)return c;              /* các màu khác (đỏ, xanh lá, tím linh thú...) giữ nguyên */
    if(x.l<0.3){                       /* màu tối */
      if(kind==='fg')return out(255,255,255,o.a);
      if(o.a<1)return out(255,255,255,Math.min(1,o.a));
      return x.l<0.09?'#eaf4fb':'#ffffff';
    }
    if(kind==='fg'&&!isWhite&&x.l>0.55&&(warm||x.s<0.3)){  /* chữ sáng trên nền tối -> chữ tối */
      return x.l>0.85?'#1c2733':'#6b7c8c';
    }
    return c;
  }
  var COLOR_RE=/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b|rgba?\([^)]*\)/g;
  function kindOf(p){return /^(color|fill|stroke|caret-color|-webkit-text-fill-color|text-decoration-color|column-rule-color)$/.test(p)?'fg':'bg';}
  function colorProp(p){return /color|background|shadow|border|outline|fill|stroke/.test(p);}

  function splitSel(s){var out=[],d=0,cur='';for(var i=0;i<s.length;i++){var ch=s[i];if(ch==='('||ch==='[')d++;else if(ch===')'||ch===']')d--;if(ch===','&&!d){out.push(cur);cur='';}else cur+=ch;}out.push(cur);return out.map(function(x){return x.trim();}).filter(Boolean);}
  function prefix(sel){
    if(/^html\b/.test(sel))return sel.replace(/^html/,'html.skin-sky');
    if(/^:root\b/.test(sel))return sel.replace(/^:root/,':root.skin-sky');
    return 'html.skin-sky '+sel;
  }
  function convertRules(rules){
    var css='';
    for(var i=0;i<rules.length;i++){
      var r=rules[i];
      if(r.type===1){ /* CSSStyleRule */
        var decl='';
        for(var j=0;j<r.style.length;j++){
          var p=r.style[j];if(p.indexOf('--')===0||!colorProp(p))continue;
          var v=r.style.getPropertyValue(p);if(!v||!COLOR_RE.test(v)){COLOR_RE.lastIndex=0;continue;}COLOR_RE.lastIndex=0;
          var k=kindOf(p),nv=v.replace(COLOR_RE,function(c){return mapColor(c,k,p);});
          if(nv!==v)decl+=p+':'+nv+(r.style.getPropertyPriority(p)?' !important':'')+';';
        }
        if(decl&&!/\.sw\b|\.sw-/.test(r.selectorText))css+=splitSel(r.selectorText).map(prefix).join(',')+'{'+decl+'}\n';
      }else if(r.type===4&&r.cssRules){ /* @media */
        var inner=convertRules(r.cssRules);if(inner)css+='@media '+r.conditionText+'{'+inner+'}\n';
      }else if(r.type===12&&r.cssRules){ /* @supports */
        var inner2=convertRules(r.cssRules);if(inner2)css+='@supports '+r.conditionText+'{'+inner2+'}\n';
      }
    }
    return css;
  }
  var built=false;
  function build(){
    if(built)return;built=true;
    var css='';
    for(var i=0;i<document.styleSheets.length;i++){
      var sh=document.styleSheets[i];if(!sh.href||sh.href.indexOf('app.css')<0)continue;
      try{css+=convertRules(sh.cssRules);}catch(e){}
    }
    css+=EXTRA;
    var st=document.createElement('style');st.id='skinSkyCss';st.textContent=css;document.head.appendChild(st);
  }
  /* Tinh chỉnh thêm cho giao diện Xanh trắng */
  var EXTRA=[
    'html.skin-sky.skin-sky{--bg:#eaf4fb!important;--card:#ffffff!important;--text:#1c2733!important;--sub:#6b7c8c!important;--blue:#1487d8!important;--blue-dark:#0e6fb8!important;--green:#1f9d5c!important;--red:#e0483c!important;color-scheme:light;}',
    'html.skin-sky body{background:linear-gradient(180deg,#d9ecfa 0%,#eaf4fb 260px,#eaf4fb 100%) fixed,#eaf4fb!important;color:#1c2733;}',
    'html.skin-sky .home-head{background:linear-gradient(135deg,#2ea6ef,#0e6fb8)!important;}',
    'html.skin-sky .home-head .hh-title{color:#ffffff!important;}',
    'html.skin-sky .home-head .hh-sub{color:rgba(255,255,255,.85)!important;}',
    'html.skin-sky .balance-card{box-shadow:0 8px 22px rgba(20,90,150,.14)!important;}',
    'html.skin-sky input,html.skin-sky select,html.skin-sky textarea{color:#1c2733;}',
    'html.skin-sky [stroke="#e2c28b"],html.skin-sky [stroke="#c29a5c"]{stroke:#1487d8;}',
    'html.skin-sky [style*="color:#a99d8d"]{color:#6b7c8c!important;}',
    'html.skin-sky .switch{background:rgba(20,80,140,.18);}',
    'html.skin-sky .switch.on{background:linear-gradient(145deg,#2ea6ef,#0e6fb8)!important;}',
    'html.skin-sky .tx-item,html.skin-sky .more-item,html.skin-sky .wcard,html.skin-sky .cat-row,html.skin-sky .month-box,html.skin-sky .field,html.skin-sky .amount-card,html.skin-sky .cat-picker,html.skin-sky .nw-cell,html.skin-sky .summary-box,html.skin-sky .insight-card{box-shadow:0 1px 3px rgba(20,70,120,.08);}',
    '@media (min-width:1000px){html.skin-sky .tx-item:hover,html.skin-sky .more-item:hover,html.skin-sky .cs-row:hover{background:#f2f8fd!important;}}'
  ].join('\n');

  function apply(skin){
    var sky=skin==='sky';
    if(sky)build();
    root.classList.toggle('skin-sky',sky);
    var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',sky?'#2ea6ef':'#0e0d0c');
    var sb=document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');if(sb)sb.setAttribute('content',sky?'default':'black-translucent');
  }
  window.getSkin=getSkin;
  window.setSkin=function(s){try{localStorage.setItem('tc_skin',s);}catch(e){}apply(s);};
  apply(getSkin());
})();
