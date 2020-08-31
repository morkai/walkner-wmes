define(["underscore","select2","Sortable","app/broker","app/user","app/i18n","app/data/orgUnits","./ownMrps"],function(e,t,r,n,o,i,a,c){"use strict";var l=0,s=null;function u(){var e=(o.data.mrps||[]).filter(function(e){return!a.getByTypeAndId("mrpController",e)}).map(function(e){return{id:e,text:""}});l=0,s=a.getAllByType("mrpController").filter(function(e){return-1===e.id.indexOf("~")}).map(function(e){return e.id.length>l&&e.id.length<6&&(l=e.id.length),{id:e.id,text:e.get("description")}}).concat(e).sort(function(e,t){return e.id.localeCompare(t.id,void 0,{numeric:!0})})}return n.subscribe("mrpControllers.synced",u),function(n,o){if(!n||!n.length)throw new Error("Unspecified $input!");o||(o={}),null===s&&u();var a=o.itemDecorator?s.map(function(t){return o.itemDecorator(e.clone(t),!1)}):s;if(o.filter&&(a=a.filter(o.filter)),n.select2(e.assign({width:"300px",allowClear:!0,multiple:!0,data:a,minimumResultsForSearch:1,matcher:function(e,t,r){return e=e.toUpperCase(),r.id.toUpperCase().indexOf(e)>=0||r.text.toUpperCase().indexOf(e)>=0},formatNoMatches:function(e){return/^[A-Z0-9]{3,}$/i.test(e)?i("mrpControllers","select2:noMatches:virtual",{mrp:e.toUpperCase()}):i("mrpControllers","select2:noMatches")},formatSelection:function(t){return e.escape(t.id)},formatResult:function(e,r,n,o){var i=e.id,a=i.length>=6&&e.text.length>=6,c=[];if(!a){for(;i.length<l;)i+=" ";c.push('<span class="text-mono">'),t.util.markMatch(i,n.term,c,o)}return""===e.text?c.push("</span>"):(a||c.push("</span>"),c.push('<span class="text-small">'),a||c.push(": "),e.icon&&c.push('<i class="fa '+e.icon.id+'" style="color: '+(e.icon.color||"#000")+'"></i> '),t.util.markMatch(e.text,n.term,c,o),c.push("</span>")),c.join("")},tokenizer:function(e,t,r){if(""===e||e===o.placeholder)return null;var n=e,i={};return t.forEach(function(e){i[e.id]=!0}),(e.match(/[A-Z0-9]{3,}[^A-Z0-9]/gi)||[]).forEach(function(e){if(n=n.replace(e,""),e=e.toUpperCase().replace(/[^A-Z0-9]+/g,""),!i[e]){var t={id:e,text:e};o.itemDecorator&&(t=o.itemDecorator(t,!0)),t.locked||t.disabled||(r(t),i[e]=!0)}}),e===n?null:n.replace(/\s+/," ").trim()}},o)),o.sortable){var p=new r(n.select2("container").find(".select2-choices")[0],{draggable:".select2-search-choice",filter:".select2-search-choice-close",onStart:function(){n.select2("onSortStart")},onEnd:function(){n.select2("onSortEnd").select2("focus")}});if(o.view){var f=o.view.destroy;o.view.destroy=function(){f.apply(o.view,arguments),p.destroy()}}}return o.own&&o.view&&c.attach(o.view,n),n.select2("data",n.val().split(",").filter(function(e){return e.length}).map(function(e){var t={id:e,text:e};return o.itemDecorator&&(t=o.itemDecorator(t,!0)),t})),n}});