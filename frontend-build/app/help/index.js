// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["jquery","app/i18n","app/broker","app/socket","app/viewport","i18n!app/nls/help"],function(e,n,t,i,r){"use strict";function o(e){e.keyCode===f&&e.preventDefault()}function p(e){e.keyCode===f&&a(e.ctrlKey)}function a(e){if(!i.isConnected())return l("error",3e3,"offline");var n=r.currentPage.helpId;if("string"!=typeof n||!n.length)return l("warning",3e3,"undefined");r.msg.loading(),setTimeout(r.msg.loaded.bind(r.msg),1337);t.publish("router.navigate",{url:"/help/"+n,trigger:!0,replace:!1})}function l(e,t,i){u(),g=r.msg.show({type:e,time:t,text:n("help","msg:"+i)})}function u(){g&&(r.msg.hide(g,!0),g=null)}var f=112,g=null;return{enable:function(){e(window).on("keydown.helpManager",o).on("keyup.helpManager",p)},disable:function(){e(window).off(".helpManager")}}});