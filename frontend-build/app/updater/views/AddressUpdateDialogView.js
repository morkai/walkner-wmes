define(["app/user","app/viewport","app/core/View","app/updater/templates/addressUpdate"],function(e,t,o,a){"use strict";return o.extend({template:a,dialogClassName:"updater-addressUpdate-dialog",events:{"click #-go":function(){e.isLoggedIn()?window.location.href="/addressUpdate/redirect?hash="+encodeURIComponent(window.location.hash||"#"):window.location.href="https://ket.wmes.pl/"+window.location.hash}},getTemplateData:function(){var t="domain";return 0===(e.data.ipAddress||window.location.hostname).indexOf("192.168")&&(t="factory"),{network:t,oldAddress:window.location.origin,newAddress:"https://ket.wmes.pl"}},afterRender:function(){window.sessionStorage.setItem("WMES_ADDRESS_UPDATE","1")}})});