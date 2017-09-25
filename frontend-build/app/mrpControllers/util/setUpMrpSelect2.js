// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define(["underscore","select2","Sortable","app/broker","app/data/orgUnits"],function(e,t,r,n,i){"use strict";function o(){c=0,a=i.getAllByType("mrpController").filter(function(e){return e.id.indexOf("~")===-1}).map(function(e){return e.id.length>c&&(c=e.id.length),{id:e.id,text:e.get("description")}}).sort(function(e,t){return e.id.localeCompare(t.id,void 0,{numeric:!0})})}var c=0,a=null;return n.subscribe("mrpControllers.synced",o),o(),function(n,i){if(n.select2(e.assign({width:"300px",allowClear:!0,multiple:!0,data:a,minimumResultsForSearch:1,matcher:function(e,t,r){return e=e.toUpperCase(),r.id.toUpperCase().indexOf(e)>=0||r.text.toUpperCase().indexOf(e)>=0},formatSelection:function(t){return e.escape(t.id)},formatResult:function(e,r,n,i){for(var o=e.id;o.length<c;)o+=" ";var a=['<span class="text-mono">'];return t.util.markMatch(o,n.term,a,i),a.push('</span><span class="text-small">: '),t.util.markMatch(e.text,n.term,a,i),a.push("</span>"),a.join("")},tokenizer:function(e,t,r){var n=e,i={};return t.forEach(function(e){i[e.id]=!0}),(e.match(/[A-Z0-9]{3,}[^A-Z0-9]/gi)||[]).forEach(function(e){n=n.replace(e,""),e=e.toUpperCase().replace(/[^A-Z0-9]+/g,""),i[e]||(r({id:e,text:e}),i[e]=!0)}),e===n?null:n.replace(/\s+/," ").trim()}},i)),i&&i.sortable){var o=new r(n.select2("container").find(".select2-choices")[0],{draggable:".select2-search-choice",filter:".select2-search-choice-close",onStart:function(){n.select2("onSortStart")},onEnd:function(){n.select2("onSortEnd").select2("focus")}});if(i.view){var l=i.view.destroy;i.view.destroy=function(){l.apply(i.view,arguments),o.destroy()}}}return n.select2("data",n.val().split(",").filter(function(e){return e.length}).map(function(e){return{id:e,text:e}})),n}});