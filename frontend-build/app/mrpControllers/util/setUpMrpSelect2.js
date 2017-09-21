// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","select2","app/broker","app/data/orgUnits"],function(t,e,r,n){"use strict";function i(){a=0,o=n.getAllByType("mrpController").filter(function(t){return t.id.indexOf("~")===-1}).map(function(t){return t.id.length>a&&(a=t.id.length),{id:t.id,text:t.get("description")}}).sort(function(t,e){return t.id.localeCompare(e.id,void 0,{numeric:!0})})}var a=0,o=null;return r.subscribe("mrpControllers.synced",i),i(),function(r,n){return r.select2(t.assign({width:"300px",allowClear:!0,multiple:!0,data:o,minimumResultsForSearch:1,matcher:function(t,e,r){return t=t.toUpperCase(),r.id.toUpperCase().indexOf(t)>=0||r.text.toUpperCase().indexOf(t)>=0},formatSelection:function(e){return t.escape(e.id)},formatResult:function(t,r,n,i){for(var o=t.id;o.length<a;)o+=" ";var l=['<span class="text-mono">'];return e.util.markMatch(o,n.term,l,i),l.push('</span><span class="text-small">: '),e.util.markMatch(t.text,n.term,l,i),l.push("</span>"),l.join("")},tokenizer:function(t,e,r){var n=t,i={};return e.forEach(function(t){i[t.id]=!0}),(t.match(/[A-Z0-9]{3,}[^A-Z0-9]/gi)||[]).forEach(function(t){n=n.replace(t,""),t=t.toUpperCase().replace(/[^A-Z0-9]+/g,""),i[t]||(r({id:t,text:t}),i[t]=!0)}),t===n?null:n.replace(/\s+/," ").trim()}},n)),r.select2("data",r.val().split(",").filter(function(t){return t.length}).map(function(t){return{id:t,text:t}})),r}});