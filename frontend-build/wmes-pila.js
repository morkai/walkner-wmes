!function(){"use strict";function e(e,o,n,t,a,r,i,s,u,c,p,l,d,w,g,b,m,f,h,L,v,y){var T=i.sandbox();function _(){T.destroy(),T=i.sandbox();var o=null;i.subscribe("i18n.reloaded",function(e){localStorage.setItem("LOCALE",e.newLocale),window.location.reload()}),i.subscribe("user.reloaded",function(){o&&clearTimeout(o),o=setTimeout(function(){if(o=null,!(l.isReloadLocked()||p.currentPage&&p.currentPage.view instanceof v)){var e=window.location.hash.replace(/^#/,"/");p.render(),/^\/production\//.test(e)||c.dispatch(e)}},1)}),i.subscribe("user.loggedIn",function(){o&&(clearTimeout(o),o=null);var e=c.getCurrentRequest();if(e){p.render();var n=e.url;"/"===n||"/login"===n?c.dispatch(window.DASHBOARD_URL_AFTER_LOG_IN||"/"):c.dispatch(n)}}),i.subscribe("user.loggedOut",function(){p.msg.show({type:"success",text:s("core","MSG:LOG_OUT:SUCCESS"),time:2500}),setTimeout(function(){i.publish("router.navigate",{url:"/",trigger:!0})},1)}),"function"==typeof window.onPageShown&&i.subscribe("viewport.page.shown",window.onPageShown).setLimit(1),e(function(){T.subscribe("viewport.page.shown",O).setLimit(1),window.ENV&&document.body.classList.add("is-"+window.ENV+"-env"),n.history.start({root:"/",hashChange:!0,pushState:!1})})}function O(){null!==T&&(T.destroy(),T=null),o("#app-loading").remove(),o("body").removeClass("is-loading"),g.ready("remote"),g.render(p.currentPage),i.subscribe("viewport.page.shown",function(){g.render(p.currentPage)})}u.connect(),a.locale(window.appLocale),window.PRODUCTION_DATA_START_DATE||(window.PRODUCTION_DATA_START_DATE=a().format("YYYY-01-01")),o.ajaxSetup({dataType:"json",accepts:{json:"application/json",text:"text/plain",html:"text/html"},contentType:"application/json"}),t.configure({manage:!0,el:!1,keep:!0}),p.registerLayout("page",function(){var e,n,t={};return g.isEnabled()&&"main"!==window.WMES_APP_ID||(t[".navbar"]=(e=c.getCurrentRequest(),(n=new h({template:L,currentPath:null===e?"/":e.path,loadedModules:w.map})).on("logIn",function(){p.showDialog(new y,s("users","LOG_IN_FORM:TITLE:LOG_IN"))}),n.on("logOut",function(){o.ajax({type:"GET",url:"/logout"}).fail(function(){p.msg.show({type:"error",text:s("core","MSG:LOG_OUT:FAILURE"),time:5e3})})}),n)),new b({views:t,version:d.getCurrentVersionString(),changelogUrl:"#changelog",hdHidden:!!window.toolbar&&!window.toolbar.visible&&!window.IS_MOBILE})}),p.registerLayout("print",function(){return new m}),p.registerLayout("blank",function(){return new f}),i.subscribe("page.titleChanged",function(e){e.unshift(s("core","TITLE")),document.title=e.reverse().join(" < ")}),navigator.onLine?(T.subscribe("socket.connected",function(){T.subscribe("user.reloaded",_)}),T.subscribe("socket.connectFailed",_)):_()}window.WMES_APP_ID="main",window.requireApp=function(){require(["domReady","jquery","backbone","backbone.layout","moment","app/monkeyPatch","app/broker","app/i18n","app/socket","app/router","app/viewport","app/user","app/updater/index","app/data/loadedModules","app/core/util/embedded","app/core/layouts/PageLayout","app/core/layouts/PrintLayout","app/core/layouts/BlankLayout","app/core/views/NavbarView","app/core/templates/navbar/pila.wmes.pl/inner","app/core/views/FormView","app/users/views/LogInFormView","app/time","app/wmes-routes","bootstrap","moment-lang/"+window.appLocale,"select2-lang/"+window.appLocale,"i18n!app/nls/core","i18n!app/nls/users"],e)}}();