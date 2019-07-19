define(["underscore","app/i18n","app/broker","app/socket","app/data/divisions","app/data/subdivisions","app/core/util/embedded"],function(e,a,t,i,n,r,o){"use strict";var d=[],s=0,l={};i.on("user.reload",function(e){l.reload(e)}),i.on("user.deleted",function(){window.location.reload()});var u=e.assign(window.GUEST_USER||{},{name:a.bound("core","GUEST_USER_NAME")});return delete window.GUEST_USER,l.data=u,l.lang=window.APP_LOCALE||window.appLocale||"pl",l.noReload=!1,l.isReloadLocked=function(){return d.length>0},l.lockReload=function(){return d.push(++s)},l.unlockReload=function(e){d=d.filter(function(a){return a!==e})},l.reload=function(i){if(!e.isEqual(i,l.data)){var n=l.isLoggedIn();e.isObject(i)&&Object.keys(i).length>0&&(!1===i.loggedIn&&(i.name=a.bound("core","GUEST_USER_NAME")),"unspecified"===i.orgUnitType&&(i.orgUnitType=null,i.orgUnitId=null),l.data=i),l.data.privilegesMap=null,l.noReload?l.noReload=!1:t.publish("user.reloaded"),n&&!l.isLoggedIn()?t.publish("user.loggedOut"):!n&&l.isLoggedIn()&&t.publish("user.loggedIn")}},l.isLoggedIn=function(){return!0===l.data.loggedIn},l.getLabel=function(e){return l.data.name?String(l.data.name):l.data.lastName&&l.data.firstName?l.data.lastName===l.data.firstName?l.data.lastName:e?l.data.firstName+" "+l.data.lastName:l.data.lastName+" "+l.data.firstName:l.data.login},l.getInfo=function(){return{id:l.data._id,ip:l.data.ip||l.data.ipAddress||"0.0.0.0",cname:window.COMPUTERNAME,label:l.getLabel()}},l.isAllowedTo=function(e){if(!1===l.data.active)return!1;if(l.data.super)return!0;if(!l.data.privileges)return!1;var a=Array.prototype.slice.call(arguments),t=(1===a.length?[e]:a).map(function(e){return Array.isArray(e)?e:[e]}),i=l.isLoggedIn();if(!t.length)return i;for(var n=0,r=t.length;n<r;++n){for(var d=t[n],s=0,u=d.length,g=0;g<u;++g){var p=d[g];"string"==typeof p?"USER"===p?s+=i?1:0:"LOCAL"===p?s+=l.data.local?1:0:"EMBEDDED"===p?s+=o.isEnabled()?1:0:/^FN:/.test(p)?s+=l.data.prodFunction===p.substring(3)?1:0:s+=l.hasPrivilege(d[g])?1:0:u-=1}if(s===u)return!0}return!1},l.hasAccessToAor=function(e){return!e||l.data.super||!l.data.aors||!l.data.aors.length||-1!==l.data.aors.indexOf(e)},l.hasAccessToSubdivision=function(e){if(!e)return!0;if("division"===l.data.orgUnitType){var a=r.get(e);return a&&l.data.orgUnitId===a.get("division")}return"subdivision"!==l.data.orgUnitType||l.data.orgUnitId===e},l.auth=function(){var e=Array.prototype.slice.call(arguments);return function(a,t,i){l.isAllowedTo.apply(l,e)?i():l.isLoggedIn()?require(["app/viewport","app/core/pages/ErrorPage"],function(e,i){e.showPage(new i({model:{code:403,req:a,previousUrl:t}}))}):require(["app/viewport","app/users/pages/LogInFormPage"],function(e,a){e.showPage(new a)})}},l.getDivision=function(){var e=null;switch(l.data.orgUnitType){case"division":e=l.data.orgUnitId;break;case"subdivision":var a=r.get(l.data.orgUnitId);a&&(e=a.get("division"))}return n.get(e)||null},l.getSubdivision=function(){return"subdivision"!==l.data.orgUnitType?null:r.get(l.data.orgUnitId)||null},l.hasPrivilege=function(a){return l.data.privilegesMap||(Array.isArray(l.data.privileges)||(l.data.privileges=[]),l.data.privilegesString="|"+l.data.privileges.join("|"),l.data.privilegesMap={},e.forEach(l.data.privileges,function(e){l.data.privilegesMap[e]=!0})),"*"===a.charAt(a.length-1)?-1!==l.data.privilegesString.indexOf("|"+a.substr(0,a.length-1)):!0===l.data.privilegesMap[a]},l.getGuestUserData=function(){return window.GUEST_USER||{id:null,login:"guest",name:a.bound("core","GUEST_USER_NAME"),loggedIn:!1,super:!1,privileges:[]}},l.getRootUserData=function(){return window.ROOT_USER||{id:null,login:"root",name:"root",loggedIn:!0,super:!0,privileges:[]}},l.can={viewOrders:function(){return l.isAllowedTo("LOCAL","ORDERS:VIEW")},commentOrders:function(){return l.isAllowedTo("ORDERS:MANAGE","ORDERS:COMMENT","PLANNING:PLANNER","PLANNING:WHMAN","PAINT_SHOP:PAINTER","WH:VIEW","FN:master","FN:leader")}},window.user=l,l});