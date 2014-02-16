define(["jquery","underscore","app/i18n","app/broker","app/socket","app/viewport","app/data/divisions","app/data/subdivisions","app/core/pages/ErrorPage"],function(e,t,n,r,i,o,a,s,l){var d=null;-1!==window.location.search.indexOf("COMPUTERNAME=")&&window.location.search.substr(1).split("&").forEach(function(e){e=e.split("="),"COMPUTERNAME"===e[0]&&e[1]&&(d=e[1])});var u={};return i.on("user.reload",function(e){u.reload(e)}),u.data=t.extend(window.GUEST_USER||{},{name:n.bound("core","GUEST_USER_NAME")}),delete window.GUEST_USER,u.reload=function(e){if(!t.isEqual(e,u.data)){var i=u.isLoggedIn();t.isObject(e)&&Object.keys(e).length>0&&(e.loggedIn===!1&&(e.name=n.bound("core","GUEST_USER_NAME")),u.data=e),r.publish("user.reloaded"),i&&!u.isLoggedIn()&&r.publish("user.loggedOut")}},u.isLoggedIn=function(){return u.data.loggedIn===!0},u.getLabel=function(){return u.data.name?String(u.data.name):u.data.lastName&&u.data.firstName?u.data.firstName+" "+u.data.lastName:u.data.login},u.getInfo=function(){return{id:u.data._id,ip:u.data.ip||u.data.ipAddress||"0.0.0.0",cname:d,label:u.getLabel()}},u.isAllowedTo=function(e){if(u.data.super)return!0;var t=u.data.privileges;if(!t)return!1;if(!e||0===e.length)return u.isLoggedIn();for(var n=[].concat(e),r=0,i=0,o=n.length;o>i;++i)if(e=n[i],"string"==typeof e)for(var a=new RegExp("^"+e.replace("*",".*?")+"$"),s=0,l=t.length;l>s;++s)if(a.test(t[s])){++r;break}return r===n.length},u.hasAccessToAor=function(e){return!e||u.data.super||!u.data.aors||!u.data.aors.length||-1!==u.data.aors.indexOf(e)},u.auth=function(e){return function(t,n,r){u.isAllowedTo(e)?r():o.showPage(new l({code:401,req:t,referer:n}))}},u.getDivision=function(){var e=null;switch(u.data.orgUnitType){case"division":e=u.data.orgUnitId;break;case"subdivision":var t=s.get(u.data.orgUnitId);t&&(e=t.get("division"))}return a.get(e)||null},u.getSubdivision=function(){return"subdivision"!==u.data.orgUnitType?null:s.get(u.data.orgUnitId)||null},window.user=u,u});