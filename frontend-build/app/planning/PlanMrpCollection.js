// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["../user","../core/Collection","./PlanMrp"],function(e,t,n){"use strict";return t.extend({model:n,initialize:function(e,t){this.plan=t&&t.plan},reset:function(e,n){return e||(e=this.createModelsFromSettings()),t.prototype.reset.call(this,e,n)},createModelsFromSettings:function(){var t=this.plan,r=[].concat(t.displayOptions.get("mrps")),i=!1;"1"===r[0]?r.shift():"0"===r[0]?(i=!0,r.shift()):"wh"===r[0]?(i=!0,r=t.settings.global.getValue("wh.ignoredMrps",[])):"mine"===r[0]&&(r=e.data.mrps||[]);var s=t.orders.getGroupedByMrp(),o=t.lines.getGroupedByMrp();return t.settings.getDefinedMrpIds().filter(function(e){return 0===r.length||(i?-1===r.indexOf(e):-1!==r.indexOf(e))}).map(function(e){return new n({_id:e,orders:s[e]||[],lines:o[e]||[]})})}})});