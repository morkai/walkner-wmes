// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","jquery","app/i18n","app/broker","app/planning/templates/contextMenu"],function(n,e,t,o,i){"use strict";return{hide:function(n){var t=n.$contextMenu;t&&(e(window).off(".contextMenu."+n.idPrefix),e(document.body).off(".contextMenu."+n.idPrefix),t.fadeOut("fast",function(){t.remove()}),t.data("backdrop").remove(),t.removeData("backdrop"),n.$contextMenu=null,o.publish("planning.contextMenu.hidden"))},show:function(t,a,d,r){var c=this.hide.bind(this,t),u=this.show.bind(this,t,a,d,r);c();var s=e(i({top:a,icons:n.some(r,function(n){return!!n.icon}),menu:r.map(function(n){return"-"===n?{type:"divider"}:"string"==typeof n?{type:"header",label:n}:n})}));s.on("mousedown",function(n){if(1!==n.which)return!1;n.stopPropagation()}),s.on("mouseup",function(n){if(1!==n.which)return!1}),s.on("contextmenu",!1),s.on("click","a[data-action]",function(n){var e=n.currentTarget;if(!e.classList.contains("disabled")){var o=e.dataset.action,i=r[o];s.find("a").addClass("disabled"),n.contextMenu={hide:!0,action:o,item:i,view:t,top:a,left:d,menu:r,restore:u},i&&i.handler&&i.handler(n),n.contextMenu.hide?c():s.find(e).find(".fa").attr("class","fa fa-spinner fa-spin")}});var f=e("<div></div>").css({position:"fixed",top:0,left:0,right:0,bottom:0}).one("mousedown",c);s.data("backdrop",f),e(window).one("scroll.contextMenu."+t.idPrefix,c).one("resize.contextMenu."+t.idPrefix,c),e(document.body).one("mousedown.contextMenu."+t.idPrefix,c).append(f).append(s);var l=s.outerWidth(),p=s.outerHeight();d+l>=document.body.clientWidth&&(d-=d+l-document.body.clientWidth+5);var h=window.innerHeight+window.pageYOffset;a+p>=h&&(a-=a+p-h+5),s.css({top:a+"px",left:d+"px"}),t.$contextMenu=s,o.publish("planning.contextMenu.shown")},actions:{sapOrder:function(n){return{icon:"fa-file-o",label:t.bound("planning","orders:menu:sapOrder"),handler:function(){window.open("/#orders/"+n)}}},comment:function(n){return{icon:"fa-comment-o",label:t("planning","orders:menu:comment"),handler:function(){var e=Math.min(window.screen.availWidth-200,1400),t=Math.min(window.screen.availHeight-160,800),o=window.screen.availWidth-e-80,i=window.open("/?hd=0#orders/"+n,"WMES_PLANNING_COMMENT","top=80,left="+o+",width="+e+",height="+t);i.onPageShown=function(){i.focus(),i.document.querySelector('textarea[name="comment"]').focus(),setTimeout(function(){i.scrollTo(0,i.document.body.scrollHeight)},1)}}}}}}});