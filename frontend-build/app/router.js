define(["backbone","h5.rql/specialOperators","app/broker","app/viewport","app/time","app/core/Router","app/core/pages/ErrorPage"],function(e,r,t,a,o,n,i){"use strict";e.Router.prototype._extractParameters=function(e,r){return e.exec(r).slice(1)};var c=new n(t),s=new e.Router;s.route("*catchall","catchall",function(e){c.dispatch(e)}),t.subscribe("router.navigate",function(e){var r=e.url,t=r.charAt(0);"#"!==t&&"/"!==t||(r=r.substr(1));var a=!0===e.trigger,o=!0===e.replace;s.navigate(r,{trigger:a,replace:o}),!a&&o&&c.setCurrentRequest(r)});return t.subscribe("router.404",function(e){var r=e.req;"/404"===r.path?a.showPage(new i({model:{code:404,req:r,previousUrl:c.previousUrl}})):c.dispatch("/404")}),t.subscribe("viewport.page.loadingFailed",function(e){a.showPage(new i({model:{code:e.xhr?e.xhr.status:0,req:c.currentRequest,previousUrl:c.previousUrl,xhr:e.xhr}}))}),localStorage.WMES_RECENT_LOCATIONS=JSON.stringify([{date:new Date,href:window.location.href}]),window.addEventListener("hashchange",function(){var e=JSON.parse(localStorage.WMES_RECENT_LOCATIONS);e.unshift({date:new Date,href:window.location.href}),e.length>10&&e.pop(),localStorage.WMES_RECENT_LOCATIONS=JSON.stringify(e)}),window.router=c,c});