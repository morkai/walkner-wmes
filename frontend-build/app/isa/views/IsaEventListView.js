// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["app/i18n","app/viewport","app/core/views/ListView","app/data/orgUnits","app/data/views/renderOrgUnitPath"],function(e,i,t,n,a){"use strict";return t.extend({className:"is-colored",remoteTopics:{"isaEvents.saved":"refreshCollection"},columns:[{id:"line",className:"is-min",label:e.bound("isa","events:line"),noData:""},{id:"time",className:"is-min",label:e.bound("isa","events:time")},{id:"user",className:"is-min",label:e.bound("isa","events:user")},{id:"action",label:e.bound("isa","events:action")}],serializeActions:function(){return null},afterRender:function(){t.prototype.afterRender.call(this);var e=this;this.$('.list-item > td[data-id="line"]').popover({container:this.el,trigger:"hover",placement:"auto right",html:!0,content:function(){var i=a(n.getByTypeAndId("prodLine",e.$(this).text().trim()),!1,!1);return i?i.split(" \\ ").join("<br>\\ "):"?"}})}})});