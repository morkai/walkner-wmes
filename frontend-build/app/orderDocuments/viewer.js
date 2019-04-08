var PAGE_NUMBERS=4,PAGE_DOTS_VISIBLE=!1,PAGE_FIRST_LAST_VISIBLE=!1,PAGE_NEXT_PREV_VISIBLE=!1;Viewer.TEMPLATE='<div class="viewer-container"><div class="viewer-canvas"></div><div class="viewer-footer"><div class="viewer-title"></div><ul class="viewer-toolbar"><li id="lockUi" title="Zablokuj interfejs"><span class="fa fa-lock"></span></li><li id="pdf" title="Pokaż oryginalny plik PDF"><span class="fa fa-file-pdf-o"></span></li><li class="viewer-zoom-in" data-viewer-action="zoom-in" title="Powiększ"><span class="fa fa-plus"></span></li><li class="viewer-zoom-out" data-viewer-action="zoom-out" title="Pomniejsz"><span class="fa fa-minus"></span></li><li class="viewer-one-to-one" data-viewer-action="one-to-one" title="Dopasuj do strony">1:1</li><li class="viewer-reset" data-viewer-action="reset" title="Resetuj widok">0</li><li class="viewer-rotate-right" data-viewer-action="rotate-right" title="Obróć w prawo"><span class="fa fa-rotate-right"></span></li><li class="viewer-flip-horizontal" data-viewer-action="flip-horizontal" title="Odwróć poziomo"><span class="fa fa-arrows-h"></span></li><li class="viewer-flip-vertical" data-viewer-action="flip-vertical" title="Odwróć pionowo"><span class="fa fa-arrows-v"></span></li>',PAGE_COUNT>1&&(PAGE_COUNT>9&&(Viewer.TEMPLATE+='<li id="first" title="Pierwsza strona">1</li>'),Viewer.TEMPLATE+='<li class="viewer-prev" data-viewer-action="prev" title="Poprzednia strona"><span class="fa fa-chevron-left"></span></li><li class="viewer-next" data-viewer-action="next" title="Następna strona"><span class="fa fa-chevron-right"></span></li>',PAGE_COUNT>9&&(Viewer.TEMPLATE+='<li id="jump" title="Skocz do strony">...</li>')),Viewer.TEMPLATE+='</ul><div class="viewer-navbar"><ul class="viewer-list"></ul></div></div><div class="viewer-tooltip"></div><div class="viewer-button" data-action="mix"></div><div class="viewer-player"></div></div>';var adjustMarksTimer=null,adjustViewportAfterMarks=!1,viewer=new Viewer(document.getElementById("images"),{button:!1,keyboard:!1,navbar:!1,title:!1,tooltip:!1,backdrop:!1,initialViewIndex:parseInt(sessionStorage.getItem("PAGE_"+(NC15||"")),10)||0,toolbar:{},toggleOnDblclick:!1,view:function(e){document.getElementById("jumpForm").classList.add("hidden"),NC15&&sessionStorage.setItem("PAGE_"+NC15,e.detail.index),renderPages(e.detail.index)},rendering:function(){document.getElementById("marks").style.display="none"},rendered:function(){clearTimeout(adjustMarksTimer),adjustMarksTimer=setTimeout(adjustMarks,300),window.ready=!0}});function renderPages(e){if(1!==PAGE_COUNT){var t=serializePages(e+1),a=document.getElementById("pages"),i="";t.pages.forEach(function(e){i+='<li data-page="'+e.no+'" class="'+(e.active?"is-active":"")+'">'+e.no+"</li>"}),a.innerHTML=i}}function serializePages(e){var t=PAGE_COUNT,a=PAGE_NUMBERS;PAGE_DOTS_VISIBLE&&(a+=1);var i=e,n=i+a,r=!0,s=!1;i-a<1?i=1:(i-=a,s=PAGE_DOTS_VISIBLE&&1!==i),s&&(i+=1),n>t&&(n=t,r=!1),e<a+1?(n+=a+1-e)>t&&(n=t):e>t-a&&(i-=a-(t-e))<1&&(i=1);var l=PAGE_DOTS_VISIBLE&&r&&n!==t;return l&&(n-=1),1===i&&(s=!1),{pageCount:t,page:e,visible:t>1,firstLastLinksVisible:PAGE_FIRST_LAST_VISIBLE,prevNextLinksVisible:PAGE_NEXT_PREV_VISIBLE,leftDotsVisible:s,rightDotsVisible:l,firstPageLinkAvailable:e>1,lastPageLinkAvailable:e<t,prevPageLinkAvailable:e>1,nextPageLinkAvailable:e<t,pages:generatePages(i,n,e)}}function generatePages(e,t,a){for(var i=[],n=e;n<=t;++n)i.push({no:n,active:n===a});return i}function showMarks(e){var t=!1,a=viewer.index+1;document.getElementById("marks").innerHTML=e.map(function(e){return t||e.p!==a||(t=!0),'<div class="mark" style="display: none" data-x="'+e.x+'" data-y="'+e.y+'" data-w="'+e.w+'" data-h="'+e.h+'" data-p="'+e.p+'"></div>'}).join("\n"),adjustViewportAfterMarks=!0,t?adjustMarks():e.length&&viewer.view(e[0].p-1)}function adjustMarks(){var e=document.getElementById("marks");e.style.cssText=viewer.image.style.cssText;for(var t=e.querySelectorAll(".mark"),a=0;a<t.length;++a)adjustMark(t[a]);adjustViewportAfterMarks&&(adjustViewportAfterMarks=!1,adjustViewport())}function adjustMark(e){var t=viewer.imageData.ratio,a=2*e.dataset.w*t,i=2*e.dataset.h*t,n=2*e.dataset.y*t-i,r=2*e.dataset.x*t;e.style.display=+e.dataset.p===viewer.index+1?"":"none",e.style.width=a+20*t+"px",e.style.height=i+10*t+"px",e.style.top=n+"px",e.style.left=r-10*t+"px"}function adjustViewport(){for(var e=document.querySelectorAll(".mark"),t=0,a=Number.MAX_VALUE,i=0,n=Number.MAX_VALUE,r=0,s=0;s<e.length;++s){var l=e[s];if("none"!==l.style.display){var o=l.getBoundingClientRect();t+=o.top>=0&&o.left>=0&&o.bottom<=window.innerHeight&&o.right<=window.innerWidth?1:0;var d=parseInt(l.style.top,10),v=parseInt(l.style.left,10);a=Math.min(a,d),i=Math.max(i,d+o.height),n=Math.min(n,v),r=Math.max(r,v+o.width)}}var c=viewer.imageData.ratio;if(!(viewer.imageData.ratio>=.4&&t===e.length)){a-=20*c,i+=20*c,n-=20*c,r+=20*c;var w=(r/=c)-(n/=c),u=(i/=c)-(a/=c),p=Math.min(window.innerWidth/w,window.innerHeight/u,1),m=n*p,g=a*p,E=w*p,f=u*p,y=window.innerWidth/2-E/2+0,P=window.innerHeight/2-f/2+0;viewer.zoomTo(p,!1),viewer.moveTo(y-m,P-g)}}window.onload=function(){viewer.show();var e=document.getElementById("first"),t=document.getElementById("jump"),a=document.getElementById("jumpForm"),i=document.getElementById("pages");document.getElementById("pdf").addEventListener("click",function(){var e=window.location.href;window.location.href=e+(-1===e.indexOf("?")?"?":"&")+"pdf=1"}),document.getElementById("lockUi").addEventListener("click",function(){window.parent.WMES_DOCS_LOCK_UI&&window.parent.WMES_DOCS_LOCK_UI()}),e&&e.addEventListener("click",function(){viewer.view(0)}),t&&t.addEventListener("click",function(){document.getElementById("pageNo").value=viewer.index+1+" / "+PAGE_COUNT,document.getElementById("pageNo").dataset.value="",document.getElementById("jumpForm").classList.toggle("hidden")}),i&&i.addEventListener("click",function(e){e.target.dataset.page&&viewer.view(+e.target.dataset.page-1)}),a&&(a.addEventListener("click",function(e){var t=e.target.dataset.key;if(t){var a=document.getElementById("pageNo");"BACKSPACE"===t?(a.value="? / "+PAGE_COUNT,a.dataset.value=""):(a.dataset.value+=t,a.value=a.dataset.value+" / "+PAGE_COUNT)}}),a.addEventListener("submit",function(e){e.preventDefault(),e.target.classList.add("hidden");var t=document.getElementById("pageNo"),a=parseInt(t.value,10);isNaN(a)||(a<1?a=1:a>PAGE_COUNT&&(a=PAGE_COUNT),viewer.view(a-1))}))};