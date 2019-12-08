define(["underscore","jquery","app/i18n","app/user","../View","./ActionFormView","./PaginationView","app/core/templates/list"],function(e,t,i,s,n,o,r,l){"use strict";var a=n.extend({template:l,tableClassName:"table-bordered table-hover table-condensed",paginationOptions:{},refreshDelay:5e3,remoteTopics:function(){var e={},t=this.collection.getTopicPrefix();return t&&(e[t+".added"]="refreshCollection",e[t+".edited"]="refreshCollection",e[t+".deleted"]="onModelDeleted"),e},events:{"click .list-item[data-id]":function(e){if(e.target.classList.contains("actions-group"))return!1;if(!this.isNotClickable(e)){var t=this.collection.get(e.currentTarget.dataset.id).genClientUrl();e.ctrlKey?window.open(t):e.altKey||this.broker.publish("router.navigate",{url:t,trigger:!0,replace:!1})}},"mousedown .list-item[data-id]":function(e){this.isNotClickable(e)||1!==e.button||e.preventDefault()},"mouseup .list-item[data-id]":function(e){if(!this.isNotClickable(e)&&1===e.button)return window.open(this.collection.get(e.currentTarget.dataset.id).genClientUrl()),!1},"click .action-delete":function(e){e.preventDefault(),o.showDeleteDialog({model:this.getModelFromEvent(e)})}},initialize:function(){this.refreshReq=null,this.lastRefreshAt=0,this.listenTo(this.collection,"sync",function(){this.lastRefreshAt=Date.now()}),this.collection.paginationData&&(this.paginationView=new r(e.assign({replaceUrl:!!this.options.replaceUrl},this.paginationOptions,this.options.pagination,{model:this.collection.paginationData})),this.setView(".pagination-container",this.paginationView),this.listenTo(this.collection.paginationData,"change:page",this.scrollTop))},destroy:function(){this.paginationView=null},serialize:function(){return{columns:this.decorateColumns(this.serializeColumns()),actions:this.serializeActions(),rows:this.serializeRows(),className:e.result(this,"className"),tableClassName:e.result(this,"tableClassName"),noData:this.options.noData||i("core","LIST:NO_DATA"),panel:this.options.panel,renderValue:function(e,t){return null==t[e.valueProperty]?null==e.noData?"<em>"+i("core","LIST:NO_DATA:cell")+"</em>":e.noData:"function"==typeof e.tdDecorator?e.tdDecorator(e.id,t[e.valueProperty],t,e):t[e.valueProperty]}}},serializeColumns:function(){var e=this.options.columns||this.columns;return"function"==typeof e&&(e=e.call(this)),Array.isArray(e)||(e=[]),e},decorateColumns:function(t){var s=this,n=s.collection.getNlsDomain();return t.map(function(t){if(!t)return null;if("-"===t?t={id:"filler",label:""}:"string"==typeof t&&(t={id:t}),!1===t.visible)return null;if(t.valueProperty||(t.valueProperty=t.id),!t.label&&""!==t.label){var o="LIST:COLUMN:"+t.id;i.has(n,o)||(o="PROPERTY:"+t.id),t.label=i.bound(n,o)}return["th","td"].forEach(function(i){var n=i+"Attrs",o="_"+n,r=t[o]||t[n];e.isFunction(r)||e.isObject(r)&&!e.isArray(r)||(r={}),t[o]||(t[o]=r),t[n]=s.decorateAttrs.bind(s,i,t[o])}),t}).filter(function(e){return null!==e})},decorateAttrs:function(t,i,s,n){"th"===t&&(n=s,s={}),e.isFunction(i)&&(i="th"===t?i(n):i(s,n));var o=[];e.isArray(i.className)?o=o.concat(i.className):e.isString(i.className)&&o.push(i.className),o.push(e.result(n,"className"),e.result(n,t+"ClassName"));var r=[];return(o=o.filter(function(e){return!!e}).join(" ")).length&&r.push('class="'+o+'"'),i.title||(n.titleProperty||"td"!==t||-1===o.indexOf("is-overflow")||(n.titleProperty=n.id),n.titleProperty&&(i.title=s[n.titleProperty])),i.title&&(i.title=i.title.replace(/<\/?[a-z].*?>/g,"")),n.width&&(i.style||(i.style={}),i.style.width=n.width),Object.keys(i).forEach(function(t){if("className"!==t){var o=i[t];if(e.isFunction(o)&&(o=o(t,i,s,n)),e.isArray(o))o=o.join(" ");else if("style"===t&&e.isObject(o)){var l=[];Object.keys(o).forEach(function(e){l.push(e+": "+o[e])}),o=l.join("; ")}"!"===t.charAt(0)?t=t.substring(1):o=e.escape(o),r.push(t+'="'+o+'"')}}),r.join(" ")},serializeActions:function(){return a.actions.viewEditDelete(this.collection)},serializeRows:function(){return this.collection.map(this.options.serializeRow||this.serializeRow,this)},serializeRow:function(e){return"function"==typeof e.serializeRow?e.serializeRow():"function"==typeof e.serialize?e.serialize():e.toJSON()},beforeRender:function(){this.stopListening(this.collection,"reset",this.render)},afterRender:function(){this.listenToOnce(this.collection,"reset",this.render)},onModelDeleted:function(e){if(e){var t=e.model||e;t._id&&(this.$('.list-item[data-id="'+t._id+'"]').addClass("is-deleted"),this.refreshCollection(t))}},$row:function(e){return this.$('tr[data-id="'+e+'"]')},$cell:function(e,t){return this.$('tr[data-id="'+e+'"] > td[data-id="'+t+'"]')},refreshCollection:function(e){if(!e||!this.timers.refreshCollection){var t=Date.now();t-this.lastRefreshAt>this.refreshDelay?(this.lastRefreshAt=t,this.refreshCollectionNow()):this.timers.refreshCollection=setTimeout(this.refreshCollectionNow.bind(this),this.refreshDelay)}},refreshCollectionNow:function(t){if(this.timers){this.timers.refreshCollection&&clearTimeout(this.timers.refreshCollection),delete this.timers.refreshCollection,this.refreshReq&&this.refreshReq.abort();var i=this,s=this.promised(this.collection.fetch(e.isObject(t)?t:{reset:!0}));s.always(function(){i.refreshReq===s&&(i.refreshReq.abort(),i.refreshReq=null)}),this.refreshReq=s}},scrollTop:function(){var e=this.$el.offset().top-14,i=t(".navbar-fixed-top");i.length&&(e-=i.outerHeight()),window.scrollY>e&&t("html, body").stop(!0,!1).animate({scrollTop:e})},getModelFromEvent:function(e){return this.collection.get(this.$(e.target).closest(".list-item").attr("data-id"))},isNotClickable:function(e){var t=this.el.classList.contains("list")?this.el:this.el.querySelector(".list"),i=e.target,s=i.tagName;return!t.classList.contains("is-clickable")||"A"===s||"INPUT"===s||"BUTTON"===s||i.classList.contains("actions")||""!==window.getSelection().toString()||"TD"!==s&&this.$(i).closest("a, input, button").length}});function c(e,t,s){return t||(t=e.getNlsDomain()),i.has(t,s)?i(t,s):i("core",s)}return a.actions={viewDetails:function(e,t){return{id:"viewDetails",icon:"file-text-o",label:c(e,t,"LIST:ACTION:viewDetails"),href:e.genClientUrl()}},edit:function(e,t){return{id:"edit",icon:"edit",label:c(e,t,"LIST:ACTION:edit"),href:e.genClientUrl("edit")}},delete:function(e,t){return{id:"delete",icon:"times",label:c(e,t,"LIST:ACTION:delete"),href:e.genClientUrl("delete")}},viewEditDelete:function(e,t,i){return function(n){var o=e.get(n._id),r=[a.actions.viewDetails(o,i)];return s.isAllowedTo((t||o.getPrivilegePrefix())+":MANAGE")&&r.push(a.actions.edit(o,i),a.actions.delete(o,i)),r}}},a});