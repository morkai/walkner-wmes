// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["backbone","app/broker","app/viewport","app/core/Router","app/core/pages/ErrorPage"],function(e,r,t,a,c){e.Router.prototype._extractParameters=function(e,r){return e.exec(r).slice(1)};var o=new a(r),n=new e.Router;n.route("*catchall","catchall",function(e){o.dispatch(e)}),r.subscribe("router.navigate",function(e){var r=e.url,t=r.charAt(0);("#"===t||"/"===t)&&(r=r.substr(1)),n.navigate(r,{trigger:e.trigger===!0,replace:e.replace===!0})});var u="/404";return r.subscribe("router.404",function(e){e.path===u?t.showPage(new c({code:404,req:e})):o.dispatch(u)}),window.router=o,o});