define(["jquery","app/i18n","app/broker","app/socket","app/viewport","i18n!app/nls/help"],function(e,n,r,t,i){"use strict";var o=112,p=null;function a(e){e.keyCode===o&&e.preventDefault()}function l(e){e.keyCode===o&&function(e){if(!t.isConnected())return u("error",3e3,"offline");var n=i.currentPage.helpId;if("string"!=typeof n||!n.length)return u("warning",3e3,"undefined");i.msg.loading(),setTimeout(i.msg.loaded.bind(i.msg),1337);r.publish("router.navigate",{url:"/help/"+n,trigger:!0,replace:!1})}(e.ctrlKey)}function u(e,r,t){p&&(i.msg.hide(p,!0),p=null),p=i.msg.show({type:e,time:r,text:n("help","msg:"+t)})}return{enable:function(){e(window).on("keydown.helpManager",a).on("keyup.helpManager",l)},disable:function(){e(window).off(".helpManager")}}});