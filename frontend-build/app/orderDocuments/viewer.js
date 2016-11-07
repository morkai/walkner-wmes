function renderPages(e){if(1!==PAGE_COUNT){var a=serializePages(e+1),t=document.getElementById("pages"),i="";a.pages.forEach(function(e){i+='<li data-page="'+e.no+'" class="'+(e.active?"is-active":"")+'">'+e.no+"</li>"}),t.innerHTML=i}}function serializePages(e){var a=PAGE_COUNT,t=PAGE_NUMBERS;PAGE_DOTS_VISIBLE&&(t+=1);var i=e,n=i+t,s=!0,l=!1;1>i-t?i=1:(i-=t,l=PAGE_DOTS_VISIBLE&&1!==i),l&&(i+=1),n>a&&(n=a,s=!1),t+1>e?(n+=t+1-e,n>a&&(n=a)):e>a-t&&(i-=t-(a-e),1>i&&(i=1));var o=PAGE_DOTS_VISIBLE&&s&&n!==a;return o&&(n-=1),1===i&&(l=!1),{pageCount:a,page:e,visible:a>1,firstLastLinksVisible:PAGE_FIRST_LAST_VISIBLE,prevNextLinksVisible:PAGE_NEXT_PREV_VISIBLE,leftDotsVisible:l,rightDotsVisible:o,firstPageLinkAvailable:e>1,lastPageLinkAvailable:a>e,prevPageLinkAvailable:e>1,nextPageLinkAvailable:a>e,pages:generatePages(i,n,e)}}function generatePages(e,a,t){for(var i=[],n=e;a>=n;++n)i.push({no:n,active:n===t});return i}var PAGE_NUMBERS=4,PAGE_DOTS_VISIBLE=!1,PAGE_FIRST_LAST_VISIBLE=!1,PAGE_NEXT_PREV_VISIBLE=!1;Viewer.TEMPLATE='<div class="viewer-container"><div class="viewer-canvas"></div><div class="viewer-footer"><div class="viewer-title"></div><ul class="viewer-toolbar"><li id="pdf" title="Pokaż oryginalny plik PDF"><span class="fa fa-file-pdf-o"></span></li><li class="viewer-zoom-in" data-action="zoom-in" title="Powiększ"><span class="fa fa-plus" data-action="zoom-in"></span></li><li class="viewer-zoom-out" data-action="zoom-out" title="Pomniejsz"><span class="fa fa-minus" data-action="zoom-out"></span></li><li class="viewer-one-to-one" data-action="one-to-one" title="Dopasuj do strony">1:1</li><li class="viewer-reset" data-action="reset" title="Resetuj widok">0</li><li class="viewer-rotate-right" data-action="rotate-right" title="Obróć w prawo"><span class="fa fa-rotate-right" data-action="rotate-right"></span></li><li class="viewer-flip-horizontal" data-action="flip-horizontal" title="Odwróć poziomo"><span class="fa fa-arrows-h" data-action="flip-horizontal"></span></li><li class="viewer-flip-vertical" data-action="flip-vertical" title="Odwróć pionowo"><span class="fa fa-arrows-v" data-action="flip-vertical"></span></li>',PAGE_COUNT>1&&(PAGE_COUNT>9&&(Viewer.TEMPLATE+='<li id="first" title="Pierwsza strona">1</li>'),Viewer.TEMPLATE+='<li class="viewer-prev" data-action="prev" title="Poprzednia strona"><span class="fa fa-chevron-left" data-action="prev"></span></li><li class="viewer-next" data-action="next" title="Następna strona"><span class="fa fa-chevron-right" data-action="next"></span></li>',PAGE_COUNT>9&&(Viewer.TEMPLATE+='<li id="jump" title="Skocz do strony">...</li>')),Viewer.TEMPLATE+='</ul><div class="viewer-navbar"><ul class="viewer-list"></ul></div></div><div class="viewer-tooltip"></div><div class="viewer-button" data-action="mix"></div><div class="viewer-player"></div></div>';var viewer=new Viewer(document.getElementById("images"),{button:!1,keyboard:!1,navbar:!1,title:!1,tooltip:!1,view:function(e){document.getElementById("jumpForm").classList.add("hidden"),renderPages(e.detail.index)}});window.onload=function(){viewer.show();var e=document.getElementById("first"),a=document.getElementById("jump"),t=document.getElementById("jumpForm"),i=document.getElementById("pages");document.getElementById("pdf").addEventListener("click",function(){var e=window.location.href;window.location.href=e+(-1===e.indexOf("?")?"?":"&")+"pdf=1"}),e&&e.addEventListener("click",function(){viewer.view(0)}),a&&a.addEventListener("click",function(){document.getElementById("pageNo").value=viewer.index+1+" / "+PAGE_COUNT,document.getElementById("pageNo").dataset.value="",document.getElementById("jumpForm").classList.toggle("hidden")}),i&&i.addEventListener("click",function(e){e.target.dataset.page&&viewer.view(+e.target.dataset.page-1)}),t&&(t.addEventListener("click",function(e){var a=e.target.dataset.key;if(a){var t=document.getElementById("pageNo");"BACKSPACE"===a?(t.value="? / "+PAGE_COUNT,t.dataset.value=""):(t.dataset.value+=a,t.value=t.dataset.value+" / "+PAGE_COUNT)}}),t.addEventListener("submit",function(e){e.preventDefault(),e.target.classList.add("hidden");var a=document.getElementById("pageNo"),t=parseInt(a.value,10);isNaN(t)||(1>t?t=1:t>PAGE_COUNT&&(t=PAGE_COUNT),viewer.view(t-1))}))};