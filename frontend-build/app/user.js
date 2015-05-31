// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/i18n","app/broker","app/socket","app/viewport","app/data/divisions","app/data/subdivisions","app/core/pages/ErrorPage"],function(e,n,a,t,r,i,o,d){"use strict";var s=null;-1!==window.location.search.indexOf("COMPUTERNAME=")&&window.location.search.substr(1).split("&").forEach(function(e){e=e.split("="),"COMPUTERNAME"===e[0]&&e[1]&&(s=e[1])});var u={};return t.on("user.reload",function(e){u.reload(e)}),u.data=e.extend(window.GUEST_USER||{},{name:n.bound("core","GUEST_USER_NAME")}),delete window.GUEST_USER,u.reload=function(t){if(!e.isEqual(t,u.data)){var r=u.isLoggedIn();e.isObject(t)&&Object.keys(t).length>0&&(t.loggedIn===!1&&(t.name=n.bound("core","GUEST_USER_NAME")),u.data=t),a.publish("user.reloaded"),r&&!u.isLoggedIn()?a.publish("user.loggedOut"):!r&&u.isLoggedIn()&&a.publish("user.loggedIn")}},u.isLoggedIn=function(){return u.data.loggedIn===!0},u.getLabel=function(){return u.data.name?String(u.data.name):u.data.lastName&&u.data.firstName?u.data.firstName+" "+u.data.lastName:u.data.login},u.getInfo=function(){return{id:u.data._id,ip:u.data.ip||u.data.ipAddress||"0.0.0.0",cname:s,label:u.getLabel()}},u.isAllowedTo=function(e){if(u.data["super"])return!0;var n=u.data.privileges,a=(1===arguments.length?[e]:Array.prototype.slice.call(arguments)).map(function(e){return Array.isArray(e)?e:[e]});if(a.length&&u.data.local&&a[0].some(function(e){return"LOCAL"===e}))return!0;if(!n)return!1;if(!a.length)return u.isLoggedIn();for(var t=0,r=a.length;r>t;++t){for(var i=a[t],o=0,d=i.length,s=0;d>s;++s)o+=-1===n.indexOf(i[s])?0:1;if(o===d)return!0}return!1},u.hasAccessToAor=function(e){return!e||u.data["super"]||!u.data.aors||!u.data.aors.length||-1!==u.data.aors.indexOf(e)},u.hasAccessToSubdivision=function(e){if(!e)return!0;if("division"===u.data.orgUnitType){var n=o.get(e);return n&&u.data.orgUnitId===n.get("division")}return"subdivision"===u.data.orgUnitType?u.data.orgUnitId===e:!0},u.auth=function(){var e=Array.prototype.slice.call(arguments);return function(n,a,t){u.isAllowedTo.apply(u,e)?t():r.showPage(new d({code:401,req:n,referer:a}))}},u.getDivision=function(){var e=null;switch(u.data.orgUnitType){case"division":e=u.data.orgUnitId;break;case"subdivision":var n=o.get(u.data.orgUnitId);n&&(e=n.get("division"))}return i.get(e)||null},u.getSubdivision=function(){return"subdivision"!==u.data.orgUnitType?null:o.get(u.data.orgUnitId)||null},u.getGuestUserData=function(){return window.GUEST_USER||{id:null,login:"guest",name:n.bound("core","GUEST_USER_NAME"),loggedIn:!1,"super":!1,privileges:[]}},u.getRootUserData=function(){return window.ROOT_USER||{id:null,login:"root",name:"root",loggedIn:!0,"super":!0,privileges:[]}},window.user=u,u});