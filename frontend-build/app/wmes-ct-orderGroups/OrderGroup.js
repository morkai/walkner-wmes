define(["underscore","app/i18n","app/user","app/core/Model"],function(e,n,o,r){"use strict";return r.extend({urlRoot:"/ct/orderGroups",clientUrlRoot:"#ct/orderGroups",topicPrefix:"ct.orderGroups",privilegePrefix:"PROD_DATA",nlsDomain:"wmes-ct-orderGroups",labelAttribute:"name",defaults:function(){return{active:!0}},serialize:function(){var e=this.toJSON();return e.active=n("core","BOOL:"+e.active),e},serializeDetails:function(){var n=this.serialize(),o=n.componentNames||{};return["nameInclude","nameExclude","bomInclude","bomExclude"].forEach(function(r){n[r]="<ul>"+n[r].map(function(n){return"<li>"+(n=n.map(function(n){var r='<code class="text-mono">'+e.escape(n)+"</code>";return/^[0-9]{12}$/.test(n)&&o[n]&&(r+=" <small>"+e.escape(o[n])+"</small>"),r})).join(" ")+"</li>"}).join("")+"</ul>"}),["nc12Include","nc12Exclude"].forEach(function(o){n[o]=n[o].map(function(n){return'<code class="text-mono">'+e.escape(n)+"</code>"}).join(" ")}),n}},{can:{manage:function(){return o.isAllowedTo("CT:MANAGE:ORDER_GROUPS")}}})});