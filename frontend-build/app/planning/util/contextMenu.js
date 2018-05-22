// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/i18n","app/broker","app/planning/templates/contextMenu"],function(n,e,t,o,i){"use strict";return{hide:function(n){var t=n.$contextMenu;t&&(e(window).off(".contextMenu."+n.idPrefix),e(document.body).off(".contextMenu."+n.idPrefix),t.fadeOut("fast",function(){t.remove()}),t.data("backdrop").remove(),t.removeData("backdrop"),n.$contextMenu=null,o.publish("planning.contextMenu.hidden"))},show:function(t,d,r,a){var c,u=this.hide.bind(this,t),s=this.show.bind(this,t,d,r,a);a.menu?c=a.menu:(a={menu:a},c=a.menu),u();var f=e(i({top:d,icons:n.some(c,function(n){return!!n.icon}),menu:c.map(function(n){return"-"===n?{type:"divider"}:"string"==typeof n?{type:"header",label:n}:n})}));f.on("mousedown",function(n){if(1!==n.which)return!1;n.stopPropagation()}),f.on("mouseup",function(n){if(1!==n.which)return!1}),f.on("contextmenu",!1),f.on("click","a[data-action]",function(n){var e=n.currentTarget;if(!e.classList.contains("disabled")){var o=e.dataset.action,i=c[o];f.find("a").addClass("disabled"),n.contextMenu={hide:!0,action:o,item:i,view:t,top:d,left:r,menu:c,restore:s},i&&i.handler&&i.handler(n),n.contextMenu.hide?u():f.find(e).find(".fa").attr("class","fa fa-spinner fa-spin")}});var l=e("<div></div>").css({position:"fixed",top:0,left:0,right:0,bottom:0}).one("mousedown",u);f.data("backdrop",l),e(window).one("scroll.contextMenu."+t.idPrefix,u).one("resize.contextMenu."+t.idPrefix,u),e(document.body).one("mousedown.contextMenu."+t.idPrefix,function(n){a.hideFilter&&!a.hideFilter(n)||u()}).append(l).append(f);var p=f.outerWidth(),h=f.outerHeight();r+p>=document.body.clientWidth&&(r-=r+p-document.body.clientWidth+5);var m=window.innerHeight+window.pageYOffset;d+h>=m&&(d-=d+h-m+5),f.css({top:d+"px",left:r+"px"}),t.$contextMenu=f,o.publish("planning.contextMenu.shown")},actions:{sapOrder:function(n){return{icon:"fa-file-o",label:t.bound("planning","orders:menu:sapOrder"),handler:function(){window.open("/#orders/"+n)}}},comment:function(n){return{icon:"fa-comment-o",label:t("planning","orders:menu:comment"),handler:function(){var e=Math.min(window.screen.availWidth-200,1400),t=Math.min(window.screen.availHeight-160,800),o=window.screen.availWidth-e-80,i=window.open("/?hd=0#orders/"+n,"WMES_PLANNING_COMMENT","top=80,left="+o+",width="+e+",height="+t);i.onPageShown=function(){i.focus(),i.document.querySelector('textarea[name="comment"]').focus(),setTimeout(function(){i.scrollTo(0,i.document.body.scrollHeight)},1)}}}}}}});