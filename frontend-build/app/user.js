// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/i18n","app/broker","app/socket","app/viewport","app/data/divisions","app/data/subdivisions","app/core/pages/ErrorPage"],function(e,a,i,t,n,r,o,d){"use strict";var s=null;-1!==window.location.search.indexOf("COMPUTERNAME=")&&window.location.search.substr(1).split("&").forEach(function(e){e=e.split("="),"COMPUTERNAME"===e[0]&&e[1]&&(s=e[1])});var u={};return t.on("user.reload",function(e){u.reload(e)}),u.data=e.extend(window.GUEST_USER||{},{name:a.bound("core","GUEST_USER_NAME")}),delete window.GUEST_USER,u.reload=function(t){if(!e.isEqual(t,u.data)){var n=u.isLoggedIn();e.isObject(t)&&Object.keys(t).length>0&&(t.loggedIn===!1&&(t.name=a.bound("core","GUEST_USER_NAME")),"unspecified"===t.orgUnitType&&(t.orgUnitType=null,t.orgUnitId=null),u.data=t),i.publish("user.reloaded"),n&&!u.isLoggedIn()?i.publish("user.loggedOut"):!n&&u.isLoggedIn()&&i.publish("user.loggedIn")}},u.isLoggedIn=function(){return u.data.loggedIn===!0},u.getLabel=function(){return u.data.name?String(u.data.name):u.data.lastName&&u.data.firstName?u.data.firstName+" "+u.data.lastName:u.data.login},u.getInfo=function(){return{id:u.data._id,ip:u.data.ip||u.data.ipAddress||"0.0.0.0",cname:s,label:u.getLabel()}},u.isAllowedTo=function(e){if(u.data["super"])return!0;var a=u.data.privileges,i=(1===arguments.length?[e]:Array.prototype.slice.call(arguments)).map(function(e){return Array.isArray(e)?e:[e]});if(i.length&&u.data.local&&i[0].some(function(e){return"LOCAL"===e}))return!0;if(!a)return!1;if(!i.length)return u.isLoggedIn();for(var t=0,n=i.length;n>t;++t){for(var r=i[t],o=0,d=r.length,s=0;d>s;++s)o+=u.hasPrivilege(r[s])?1:0;if(o===d)return!0}return!1},u.hasAccessToAor=function(e){return!e||u.data["super"]||!u.data.aors||!u.data.aors.length||-1!==u.data.aors.indexOf(e)},u.hasAccessToSubdivision=function(e){if(!e)return!0;if("division"===u.data.orgUnitType){var a=o.get(e);return a&&u.data.orgUnitId===a.get("division")}return"subdivision"===u.data.orgUnitType?u.data.orgUnitId===e:!0},u.auth=function(){var e=Array.prototype.slice.call(arguments);return function(a,i,t){u.isAllowedTo.apply(u,e)?t():n.showPage(new d({code:401,req:a,referer:i}))}},u.getDivision=function(){var e=null;switch(u.data.orgUnitType){case"division":e=u.data.orgUnitId;break;case"subdivision":var a=o.get(u.data.orgUnitId);a&&(e=a.get("division"))}return r.get(e)||null},u.getSubdivision=function(){return"subdivision"!==u.data.orgUnitType?null:o.get(u.data.orgUnitId)||null},u.hasPrivilege=function(a){return u.data.privilegesMap||(Array.isArray(u.data.privileges)||(u.data.privileges=[]),u.data.privilegesString="|"+u.data.privileges.join("|"),u.data.privilegesMap={},e.forEach(u.data.privileges,function(e){u.data.privilegesMap[e]=!0})),"*"===a.charAt(a.length-1)?-1!==u.data.privilegesString.indexOf("|"+a.substr(0,a.length-1)):u.data.privilegesMap[a]===!0},u.getGuestUserData=function(){return window.GUEST_USER||{id:null,login:"guest",name:a.bound("core","GUEST_USER_NAME"),loggedIn:!1,"super":!1,privileges:[]}},u.getRootUserData=function(){return window.ROOT_USER||{id:null,login:"root",name:"root",loggedIn:!0,"super":!0,privileges:[]}},window.user=u,u});