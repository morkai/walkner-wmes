// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["jquery","app/i18n","app/core/View","../VisNodePositionCollection","../views/StructureVisView"],function(e,t,i,o,n){"use strict";return i.extend({layoutName:"page",breadcrumbs:[t.bound("vis","BREADCRUMBS:structure")],actions:function(){var e=this;return[{label:t.bound("vis","PAGE_ACTION:toggleDeactivated"),icon:"toggle-on",className:"active",callback:function(){var t=this.querySelector(".btn");return t.classList.contains("active")?e.view.showDeactivated():e.view.hideDeactivated(),t.classList.toggle("active"),!1}}]},initialize:function(){this.model={nodePositions:new o(null,{paginate:!1})},this.view=new n({model:this.model}),this.model.nodePositions.subscribe(this.pubsub)},destroy:function(){document.body.classList.remove("no-overflow")},afterRender:function(){document.body.classList.add("no-overflow")},load:function(t){if(void 0!==window.d3)return t(this.model.nodePositions.fetch({reset:!0}));var i=e.Deferred();return require(["d3"],function(){i.resolve()}),t(i,this.model.nodePositions.fetch({reset:!0}))}})});