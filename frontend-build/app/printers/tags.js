// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n"],function(t){"use strict";var n=["orders","qi","planning","paintShop","hourlyPlans","fte/production","fte/warehouse","fte/other"];return{toList:function(){return[].concat(n)},toSelect2:function(){return n.map(function(n){return{id:n,text:t("printers","tags:"+n)}})},toString:function(n){return(n||[]).map(function(n){return t("printers","tags:"+n)}).join("; ")}}});