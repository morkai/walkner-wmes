// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","app/i18n","app/user","../View","app/core/templates/error"],function(e,i,n,t,r){"use strict";return t.extend({layoutName:"page",pageId:"error",events:{"click #-notify > a":function(){var e=this,i=e.buildMail();return e.$id("notify").html('<i class="fa fa-spinner fa-spin"></i>'),e.trySendMail("/mail;send",i,function(n){n?e.trySendMail(e.senderUrl,i,e.handleMailSent.bind(e)):e.handleMailSent()}),!1},"click a[data-reload]":function(){return window.location.reload(),!1}},breadcrumbs:function(){return[i.bound("core","ERROR:"+this.resolveCode()+":title")]},initialize:function(){var e=this,o=e.resolveCode();try{e.adminEmail=atob(window.ADMIN_EMAIL),e.senderUrl=atob(window.REMOTE_MAIL_SENDER_URL),e.secretKey=atob(window.REMOTE_MAIL_SECRET_KEY),e.notify=0!==o}catch(i){e.notify=!1}e.view=new t({template:function(){return 403!==o||n.isLoggedIn()||(o+=":guest"),r({idPrefix:e.idPrefix,message:i("core","ERROR:"+o+":message"),notify:e.notify})}})},resolveCode:function(){var e=this.model.code;return i.has("core","ERROR:"+e+":title")?e:e>=400&&e<500?400:e>=500?500:0},trySendMail:function(e,t,r){this.ajax({method:"POST",url:e,data:JSON.stringify({secretKey:this.secretKey,to:this.adminEmail,subject:i("core","ERROR:notify:subject",{APP_NAME:i("core","APP_NAME"),code:this.model.code,user:n.getLabel()}),html:t}),success:function(){r()},error:function(){r(!0)}})},handleMailSent:function(e){this.$id("notify").html(i("core","ERROR:notify:"+(e?"failure":"success")))},buildMail:function(){var i=[],t=function(e){return JSON.stringify(e,null,2)},r=function(e,n){i.push("<b>"+e+"=</b><br>",'<pre style="margin-top: 0; margin-bottom: 10px">'+String(n).trim()+"</pre>")};return r("date",(new Date).toLocaleString()),r("user",'<a href="'+window.location.origin+"/#users/"+n.data._id+'">'+n.getLabel()+"</a><br>"+t(e.assign({cname:window.COMPUTERNAME},e.omit(n.data,"privilegesMap")))),r("router.currentRequest",this.model.req?this.model.req.url:"?"),r("router.referrer",this.model.previousUrl||"?"),r("response.code",this.model.code),r("response.body",this.model.xhr?this.model.xhr.responseText:""),r("window.location.href",window.location.href),r("window.navigator",t(e.pick(window.navigator,["language","languages","cookieEnabled","onLine","platform","userAgent"]))),r("window.screen",t(e.assign(e.pick(window.screen,["availHeight","availWidth","width","height"])),(window.innerWidth,window.innerHeight))),i.join("")}})});