// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["underscore","app/i18n","app/broker","app/socket","app/viewport","app/data/divisions","app/data/subdivisions","app/core/pages/ErrorPage"],function(e,a,n,t,i,r,o,d){var s=null;-1!==window.location.search.indexOf("COMPUTERNAME=")&&window.location.search.substr(1).split("&").forEach(function(e){e=e.split("="),"COMPUTERNAME"===e[0]&&e[1]&&(s=e[1])});var u={};return t.on("user.reload",function(e){u.reload(e)}),u.data=e.extend(window.GUEST_USER||{},{name:a.bound("core","GUEST_USER_NAME")}),delete window.GUEST_USER,u.reload=function(t){if(!e.isEqual(t,u.data)){var i=u.isLoggedIn();e.isObject(t)&&Object.keys(t).length>0&&(t.loggedIn===!1&&(t.name=a.bound("core","GUEST_USER_NAME")),u.data=t),n.publish("user.reloaded"),i&&!u.isLoggedIn()?n.publish("user.loggedOut"):!i&&u.isLoggedIn()&&n.publish("user.loggedIn")}},u.isLoggedIn=function(){return u.data.loggedIn===!0},u.getLabel=function(){return u.data.name?String(u.data.name):u.data.lastName&&u.data.firstName?u.data.firstName+" "+u.data.lastName:u.data.login},u.getInfo=function(){return{id:u.data._id,ip:u.data.ip||u.data.ipAddress||"0.0.0.0",cname:s,label:u.getLabel()}},u.isAllowedTo=function(e){if(u.data.super)return!0;var a=u.data.privileges;if(!a)return!1;if(!e||0===e.length)return u.isLoggedIn();for(var n=[].concat(e),t=0,i=0,r=n.length;r>i;++i)if(e=n[i],"string"==typeof e)for(var o=new RegExp("^"+e.replace("*",".*?")+"$"),d=0,s=a.length;s>d;++d)if(o.test(a[d])){++t;break}return t===n.length},u.hasAccessToAor=function(e){return!e||u.data.super||!u.data.aors||!u.data.aors.length||-1!==u.data.aors.indexOf(e)},u.auth=function(e){return function(a,n,t){u.isAllowedTo(e)?t():i.showPage(new d({code:401,req:a,referer:n}))}},u.getDivision=function(){var e=null;switch(u.data.orgUnitType){case"division":e=u.data.orgUnitId;break;case"subdivision":var a=o.get(u.data.orgUnitId);a&&(e=a.get("division"))}return r.get(e)||null},u.getSubdivision=function(){return"subdivision"!==u.data.orgUnitType?null:o.get(u.data.orgUnitId)||null},u.getRootUserData=function(){return window.ROOT_USER||{id:null,login:"root",name:"root",loggedIn:!0,"super":!0,privileges:[]}},window.user=u,u});