define(["underscore","app/i18n","app/core/View","app/pscs/templates/intro"],function(e,s,t,n){"use strict";return t.extend({layoutName:"blank",template:n,title:s.bound("pscs","BREADCRUMB:base"),destroy:function(){document.body.classList.remove("pscs"),document.body.style.backgroundImage=""},afterRender:function(){document.body.classList.add("pscs"),document.body.style.backgroundImage="url(/app/pscs/assets/bg."+e.random(1,3)+".jpg)"}})});