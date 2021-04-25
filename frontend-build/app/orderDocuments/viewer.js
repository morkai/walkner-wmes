var PAGE_NUMBERS=4,PAGE_DOTS_VISIBLE=!1,PAGE_FIRST_LAST_VISIBLE=!1,PAGE_NEXT_PREV_VISIBLE=!1;Viewer.TEMPLATE='<div class="viewer-container"><div class="viewer-canvas"></div><div class="viewer-footer"><div class="viewer-title"></div><ul class="viewer-toolbar"><li id="bomToggle" title="Pokaż komponenty">BOM</li><li id="lockUi" title="Zablokuj interfejs"><span class="fa fa-lock"></span></li><li id="pdf" title="Pokaż oryginalny plik PDF"><span class="fa fa-file-pdf-o"></span></li><li class="viewer-zoom-in" data-viewer-action="zoom-in" title="Powiększ"><span class="fa fa-plus"></span></li><li class="viewer-zoom-out" data-viewer-action="zoom-out" title="Pomniejsz"><span class="fa fa-minus"></span></li><li class="viewer-one-to-one" data-viewer-action="one-to-one" title="Dopasuj do strony">1:1</li><li class="viewer-reset" data-viewer-action="reset" title="Resetuj widok">0</li><li class="viewer-rotate-right" data-viewer-action="rotate-right" title="Obróć w prawo"><span class="fa fa-rotate-right"></span></li><li class="viewer-flip-horizontal" data-viewer-action="flip-horizontal" title="Odwróć poziomo"><span class="fa fa-arrows-h"></span></li><li class="viewer-flip-vertical" data-viewer-action="flip-vertical" title="Odwróć pionowo"><span class="fa fa-arrows-v"></span></li>',PAGE_COUNT>1&&(PAGE_COUNT>9&&(Viewer.TEMPLATE+='<li id="first" title="Pierwsza strona">1</li>'),Viewer.TEMPLATE+='<li class="viewer-prev" data-viewer-action="prev" title="Poprzednia strona"><span class="fa fa-chevron-left"></span></li><li class="viewer-next" data-viewer-action="next" title="Następna strona"><span class="fa fa-chevron-right"></span></li>',PAGE_COUNT>9&&(Viewer.TEMPLATE+='<li id="jump" title="Skocz do strony">...</li>')),Viewer.TEMPLATE+='</ul><div class="viewer-navbar"><ul class="viewer-list"></ul></div></div><div class="viewer-tooltip"></div><div class="viewer-button" data-action="mix"></div><div class="viewer-player"></div></div>';var adjustMarksTimer=null,adjustViewportAfterMarks=!1,viewer=new Viewer(document.getElementById("images"),{button:!1,keyboard:!1,navbar:!1,title:!1,tooltip:!1,backdrop:!1,initialViewIndex:parseInt(sessionStorage.getItem("PAGE_"+(NC15||"")),10)||0,toolbar:{},toggleOnDblclick:!1,switchable:!1,view:function(e){var t=document.getElementById("jumpForm");t&&t.classList.add("hidden"),NC15&&sessionStorage.setItem("PAGE_"+NC15,e.detail.index),renderPages(e.detail.index)},rendering:function(){document.getElementById("marks").style.display="none"},rendered:function(){clearTimeout(adjustMarksTimer),adjustMarksTimer=setTimeout(adjustMarks,300),window.ready||document.querySelector(".viewer-canvas > img").addEventListener("click",e=>{var t=document.getElementById("foo");t||((t=document.createElement("div")).setAttribute("id","foo"),t.style.position="absolute",t.style.background="#F00",t.style.zIndex="10000000",t.style.padding="4px 6px",t.style.boxShadow="1px 2px 3px #999",document.body.appendChild(t));var i=viewer.imageData.ratio,a=parseInt(e.currentTarget.style.marginLeft,10),n=parseInt(e.currentTarget.style.marginTop,10),s=e.offsetX/2/i,r=e.offsetY/2/i;window.parent.WMES_DOCS_BOM_MARKS(function(e,o){const l=o.map(e=>{var t=Number.MAX_SAFE_INTEGER;if(e.p===viewer.index+1){var i=e.x+e.w/2,a=e.y+e.h/2,n=s-i,o=r-a;t=Math.sqrt(n*n+o*o)}return{mark:e,distance:t}});l.sort((e,t)=>e.distance-t.distance);var d=l[0].mark,c=d.w*i/2+15;if(console.log(d.s.padStart("0",4),"dist=",l[0].distance,"maxD",c),l[0].distance>c)t.style.display="none";else{var v=d.label;/wire.*?L-?[0-9]{1,4}/i.test(v)&&(v=v.match(/L-?([0-9]{1,4})/)[1]+"mm"),a+=2*d.x*i,n+=2*d.y*i,t.style.left=a+"px",t.style.top=n+"px",t.style.fontSize=Math.min(28,Math.max(14,2*d.h*i))+"px",t.innerHTML=v,t.style.display="";t.getBoundingClientRect()}})}),window.ready=!0}});function renderPages(e){if(1!==PAGE_COUNT){var t=serializePages(e+1),i=document.getElementById("pages"),a="";t.pages.forEach(function(e){a+='<li data-page="'+e.no+'" class="'+(e.active?"is-active":"")+'">'+e.no+"</li>"}),i.innerHTML=a}}function serializePages(e){var t=PAGE_COUNT,i=PAGE_NUMBERS;PAGE_DOTS_VISIBLE&&(i+=1);var a=e,n=a+i,s=!0,r=!1;a-i<1?a=1:(a-=i,r=PAGE_DOTS_VISIBLE&&1!==a),r&&(a+=1),n>t&&(n=t,s=!1),e<i+1?(n+=i+1-e)>t&&(n=t):e>t-i&&(a-=i-(t-e))<1&&(a=1);var o=PAGE_DOTS_VISIBLE&&s&&n!==t;return o&&(n-=1),1===a&&(r=!1),{pageCount:t,page:e,visible:t>1,firstLastLinksVisible:PAGE_FIRST_LAST_VISIBLE,prevNextLinksVisible:PAGE_NEXT_PREV_VISIBLE,leftDotsVisible:r,rightDotsVisible:o,firstPageLinkAvailable:e>1,lastPageLinkAvailable:e<t,prevPageLinkAvailable:e>1,nextPageLinkAvailable:e<t,pages:generatePages(a,n,e)}}function generatePages(e,t,i){for(var a=[],n=e;n<=t;++n)a.push({no:n,active:n===i});return a}function showMarks(e,t){var i=!1,a=viewer.index+1;document.getElementById("marks").innerHTML=e.map(function(e){return i||e.p!==a||(i=!0),'<div class="mark" style="display: none" data-x="'+e.x+'" data-y="'+e.y+'" data-w="'+e.w+'" data-h="'+e.h+'" data-p="'+e.p+'"></div>'}).join("\n"),adjustViewportAfterMarks=!0,t?(t-=1)===viewer.index?adjustMarks():viewer.view(t):i?adjustMarks():e.length&&viewer.view(e[0].p-1)}function adjustMarks(){var e=document.getElementById("marks");viewer.image&&(e.style.cssText=viewer.image.style.cssText);for(var t=e.querySelectorAll(".mark"),i=0;i<t.length;++i)adjustMark(t[i]);adjustViewportAfterMarks&&(adjustViewportAfterMarks=!1,adjustViewport())}function adjustMark(e){var t=viewer.imageData.ratio,i=2*e.dataset.w*t,a=2*e.dataset.h*t,n=2*e.dataset.y*t-a,s=2*e.dataset.x*t;console.log(e,{ratio:t,width:i,height:a,top:n,left:s}),e.style.display=+e.dataset.p===viewer.index+1?"":"none",e.style.width=i+20*t+"px",e.style.width=i+0*t+"px",e.style.height=a+10*t+"px",e.style.height=a+0*t+"px",e.style.top=n+"px",e.style.left=s-10*t+"px",e.style.left=s-0*t+"px"}function adjustViewport(){for(var e=document.querySelectorAll(".mark"),t=0,i=Number.MAX_VALUE,a=0,n=Number.MAX_VALUE,s=0,r=0;r<e.length;++r){var o=e[r];if("none"!==o.style.display){var l=o.getBoundingClientRect();t+=l.top>=0&&l.left>=0&&l.bottom<=window.innerHeight&&l.right<=window.innerWidth?1:0;var d=parseInt(o.style.top,10),c=parseInt(o.style.left,10);i=Math.min(i,d),a=Math.max(a,d+l.height),n=Math.min(n,c),s=Math.max(s,c+l.width)}}var v=viewer.imageData.ratio;if(!(viewer.imageData.ratio>=.4&&t===e.length)){i-=20*v,a+=20*v,n-=20*v,s+=20*v;var w=(s/=v)-(n/=v),p=(a/=v)-(i/=v),u=Math.min(window.innerWidth/w,window.innerHeight/p,1),m=n*u,g=i*u,f=w*u,E=p*u,y=window.innerWidth/2-f/2+0,h=window.innerHeight/2-E/2+0;viewer.zoomTo(u,!1),viewer.moveTo(y-m,h-g)}}function toggleBom(e){var t=document.getElementById("bomToggle");"boolean"!=typeof e?t.classList.contains("is-loading")||t.classList.contains("is-error")||(t.classList.add("is-loading"),t.innerHTML='<i class="fa fa-spinner fa-spin"></i>',e=!t.classList.contains("is-active"),window.parent.WMES_DOCS_BOM_TOGGLE(e,function(e){e&&(t.classList.add("is-error"),setTimeout(function(){t.classList.remove("is-error")},3e3)),t.classList.remove("is-loading"),t.classList.toggle("is-active",window.parent.WMES_DOCS_BOM_ACTIVE()),t.innerHTML="BOM"})):t.classList.toggle("is-active",e)}window.addEventListener("contextmenu",function(e){e.preventDefault()}),window.addEventListener("touchstart",function(e){e.touches&&e.touches.length>1&&e.preventDefault()},{passive:!1}),window.addEventListener("load",function(){viewer.show(),Array.isArray(window.HIDDEN_BUTTONS)&&window.HIDDEN_BUTTONS.forEach(function(e){document.getElementById(e).classList.add("hidden")});var e=document.getElementById("first"),t=document.getElementById("jump"),i=document.getElementById("jumpForm"),a=document.getElementById("pages");document.getElementById("pdf").addEventListener("click",function(){var e=window.location.href;window.location.href=e+(-1===e.indexOf("?")?"?":"&")+"pdf=1"});var n=document.getElementById("lockUi");window.parent.WMES_DOCS_LOCK_UI?n.addEventListener("click",function(){window.parent.WMES_DOCS_LOCK_UI()}):n.style.display="none",e&&e.addEventListener("click",function(){viewer.view(0)}),t&&t.addEventListener("click",function(){document.getElementById("pageNo").value=viewer.index+1+" / "+PAGE_COUNT,document.getElementById("pageNo").dataset.value="",document.getElementById("jumpForm").classList.toggle("hidden")}),a&&a.addEventListener("click",function(e){e.target.dataset.page&&viewer.view(+e.target.dataset.page-1)}),i&&(i.addEventListener("click",function(e){var t=e.target.dataset.key;if(t){var i=document.getElementById("pageNo");"BACKSPACE"===t?(i.value="? / "+PAGE_COUNT,i.dataset.value=""):(i.dataset.value+=t,i.value=i.dataset.value+" / "+PAGE_COUNT)}}),i.addEventListener("submit",function(e){e.preventDefault(),e.target.classList.add("hidden");var t=document.getElementById("pageNo"),i=parseInt(t.value,10);isNaN(i)||(i<1?i=1:i>PAGE_COUNT&&(i=PAGE_COUNT),viewer.view(i-1))}));var s=document.getElementById("bomToggle");window.parent.WMES_DOCS_BOM_TOGGLE?(s.addEventListener("click",function(){toggleBom()}),toggleBom(window.parent.WMES_DOCS_BOM_ACTIVE())):s.style.display="none"});