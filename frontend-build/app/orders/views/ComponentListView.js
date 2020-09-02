define(["app/user","app/viewport","app/time","app/core/View","app/core/util/decimalSeparator","app/core/templates/userInfo","app/orders/templates/componentList"],function(t,e,n,o,s,i,r){"use strict";return o.extend({template:r,events:{"click .orders-bom-item":function(t){if(this.options.linkDocuments)return this.item=t.currentTarget.textContent.trim(),null===this.contents?this.loadContents():null===this.document?this.trigger("bestDocumentRequested",this.item,this.contents):this.mark(),!1},"mousedown .orders-bom-pfep":function(t){t.preventDefault()},"mouseup .orders-bom-pfep":function(t){e.msg.loading();var n=this,o=n.model.get("nc12"),s=n.ajax({url:"/pfep/entries?select(_id)&nc12=string:"+o});return s.fail(function(){e.msg.loadingFailed()}),s.done(function(s){var i;if(e.msg.loaded(),1===s.totalCount)i="#pfep/entries/"+s.collection[0]._id;else{if(!(s.totalCount>1)){var r=n.$(t.target).closest("td");return void r.html(r.text())}i="#pfep/entries?sort(-rid)&limit(15)&nc12=string:"+o}1===t.button?window.open(i):window.location.href=i}),!1}},initialize:function(){this.item=null,this.document=null,this.window=null,this.contents=null,this.once("afterRender",function(){this.listenTo(this.model,"change:bom change:compRels",this.onChange)})},getTemplateData:function(){var e=[],o={},r={},a=!1;return(this.model.get("compRels")||[]).forEach(function(t){r[t.newCode]||(r[t.newCode]=[]),t.oldComponents.forEach(function(e){o[e._id]||(o[e._id]=[]),o[e._id].push(t),r[t.newCode].push({compRel:t,oldComponent:e})})}),this.model.get("bom").forEach(function(t){if(t.get("nc12")){var l=(t=t.toJSON()).qty.toString().split(".");t.qty=[l[0].toString(),l[1]?s+l[1]:""],e.push(t);var d=o[t.nc12];if(d)return a=!0,t.rowClassName="danger",void d.forEach(function(o){e.push({rowClassName:"success",orderNo:t.orderNo,mrp:t.mrp,nc12:o.newCode,name:o.newName,releasedAt:n.format(o.releasedAt,"L HH:mm"),releasedBy:i({userInfo:o.releasedBy,noIp:!0})})});var m=r[t.nc12];m&&(a=!0,t.rowClassName="success",m.forEach(function(o){var s=o.compRel;e.push({rowClassName:"danger",orderNo:t.orderNo,mrp:t.mrp,nc12:o.oldComponent._id,name:o.oldComponent.name,releasedAt:n.format(s.releasedAt,"L HH:mm"),releasedBy:i({userInfo:s.releasedBy,noIp:!0})})}))}}),{colored:a,empty:0===e.length,paint:!!this.options.paint,linkPfep:!!this.options.linkPfep&&t.isAllowedTo("PFEP:VIEW"),bom:e}},afterRender:function(){this.updateItems()},onChange:function(){this.$el.hasClass("hidden")!==(0===this.model.get("bom").length)&&(this.render(),this.model.trigger("panelToggle"))},markDocument:function(t,e){this.document=t,this.window=e,null===this.contents?this.loadContents():this.updateItems()},unmarkDocument:function(){this.document=null,this.window=null,this.updateItems()},loadContents:function(){var t=this;t.loadContentsReq||(t.loadContentsReq=t.ajax({url:"/orders/"+t.model.id+"/documentContents"}),t.loadContentsReq.always(function(){t.loadContentsReq=null}),t.loadContentsReq.done(function(e){t.contents=e,null===t.document?t.trigger("bestDocumentRequested",t.item,e):t.updateItems()}))},updateItems:function(){var t=this;t.contents&&(t.$(".orders-bom-item").each(function(){var e=this.textContent.trim();t.contents[e]&&t.contents[e][t.document]&&this.nextElementSibling.textContent.trim().length&&(e="<a>"+e+"</a>"),this.innerHTML=e}),this.mark())},mark:function(){var t=this.window;if(t&&t.showMarks){t&&t.focus();var e=this.item,n=this.document,o=this.contents;e&&n&&o&&o[e]&&t.showMarks(o[e][n]||[])}}})});