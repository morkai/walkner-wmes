// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/core/pages/ListPage","../views/ProdLineListView"],function(t,e,i){"use strict";return e.extend({ListView:i,actions:function(){var i=this;return[{label:t.bound("prodLines","PAGE_ACTION:toggleDeactivated"),icon:"toggle-on",className:"active",callback:function(){var t=this.querySelector(".btn");return t.classList.toggle("active"),i.view.toggleDeactivated(!t.classList.contains("active")),!1}}].concat(e.prototype.actions.call(this))}})});