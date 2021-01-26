define(["underscore","app/i18n","app/user","app/core/Model"],function(e,n,r,t){"use strict";return t.extend({urlRoot:"/planning/orderGroups",clientUrlRoot:"#planning/orderGroups",topicPrefix:"planning.orderGroups",privilegePrefix:"PLANNING",nlsDomain:"planning-orderGroups",labelAttribute:"name",defaults:function(){return{active:!0}},serialize:function(){var e=this.toJSON();return e.active=n("core","BOOL:"+e.active),e},serializeRow:function(){var e=this.serialize();return e.mrp=(e.mrp||[]).join("; "),e},serializeDetails:function(){var n=this.serialize();return n.mrp=(n.mrp||[]).map(function(e){return"<code>"+e+"</code>"}).join(" "),["productInclude","productExclude","bomInclude","bomExclude"].forEach(function(r){n[r]="<ul>"+n[r].map(function(r){return"<li>"+(r=r.map(function(r){var t='<code class="text-mono">'+e.escape(r)+"</code>";return/^[0-9]{12}$/.test(r)&&n.names[r]&&(t+=" <small>"+e.escape(n.names[r])+"</small>"),t})).join("<br> + ")+"</li>"}).join("")+"</ul>"}),n},isNoMatchGroup:function(){return"000000000000000000000000"===this.id},isEmptyGroup:function(){return 0===this.get("productInclude").length&&0===this.get("productExclude").length&&0===this.get("bomInclude").length&&0===this.get("bomExclude").length}},{can:{manage:function(){return r.isAllowedTo("PLANNING:MANAGE","PLANNING:PLANNER","FN:process-engineer")}}})});