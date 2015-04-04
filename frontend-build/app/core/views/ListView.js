// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["jquery","app/i18n","app/user","../View","./ActionFormView","./PaginationView","app/core/templates/list"],function(e,t,i,s,n,o,l){"use strict";function r(e,i,s){return i||(i=e.getNlsDomain()),t.has(i,s)?t(i,s):t("core",s)}var a=s.extend({template:l,remoteTopics:function(){var e={},t=this.collection.getTopicPrefix();return t&&(e[t+".added"]="refreshCollection",e[t+".edited"]="refreshCollection",e[t+".deleted"]="onModelDeleted"),e},events:{"click .list-item[data-id]":function(e){if(!(!this.el.classList.contains("is-clickable")||"A"===e.target.tagName||"INPUT"===e.target.tagName||"BUTTON"===e.target.tagName||e.target.classList.contains("actions")||""!==window.getSelection().toString()||"TD"!==e.target.tagName&&this.$(e.target).closest("a, input, button").length)){var t=this.collection.get(e.currentTarget.dataset.id).genClientUrl();e.ctrlKey?window.open(t):e.altKey||this.broker.publish("router.navigate",{url:t,trigger:!0,replace:!1})}},"click .action-delete":function(e){e.preventDefault(),n.showDeleteDialog({model:this.getModelFromEvent(e)})}},initialize:function(){this.lastRefreshAt=0,this.listenTo(this.collection,"sync",function(){this.lastRefreshAt=Date.now()}),this.collection.paginationData&&(this.paginationView=new o({model:this.collection.paginationData}),this.setView(".pagination-container",this.paginationView),this.listenTo(this.collection.paginationData,"change:page",this.scrollTop))},destroy:function(){this.paginationView=null},serialize:function(){return{columns:this.decorateColumns(this.serializeColumns()),actions:this.serializeActions(),rows:this.serializeRows(),className:this.className}},serializeColumns:function(){var e;return e=Array.isArray(this.options.columns)?this.options.columns:Array.isArray(this.columns)?this.columns:[]},decorateColumns:function(e){var i=this.collection.getNlsDomain();return e.map(function(e){return"string"==typeof e&&(e={id:e,label:t(i,"PROPERTY:"+e)}),e.label||(e.label=t(i,"PROPERTY:"+e.id)),e.thAttrs||(e.thAttrs=""),e.tdAttrs||(e.tdAttrs=""),(e.className||e.thClassName||e.tdClassName)&&(e.thAttrs+=' class="'+(e.className||"")+" "+(e.thClassName||"")+'"',e.tdAttrs+=' class="'+(e.className||"")+" "+(e.tdClassName||"")+'"'),e})},serializeActions:function(){return a.actions.viewEditDelete(this.collection)},serializeRows:function(){return this.collection.map(this.options.serializeRow||this.serializeRow,this)},serializeRow:function(e){return"function"==typeof e.serializeRow?e.serializeRow():"function"==typeof e.serialize?e.serialize():e.toJSON()},beforeRender:function(){this.stopListening(this.collection,"reset",this.render)},afterRender:function(){this.listenToOnce(this.collection,"reset",this.render)},onModelDeleted:function(e){e&&e.model&&e.model._id&&(this.$('.list-item[data-id="'+e.model._id+'"]').addClass("is-deleted"),this.refreshCollection(e))},refreshCollection:function(e){e&&this.timers.refreshCollection||(Date.now()-this.lastRefreshAt>3e3?this.refreshCollectionNow():this.timers.refreshCollection=setTimeout(this.refreshCollectionNow.bind(this),3e3))},refreshCollectionNow:function(e){this.timers&&(this.timers.refreshCollection&&clearTimeout(this.timers.refreshCollection),delete this.timers.refreshCollection,this.promised(this.collection.fetch(e||{reset:!0})))},scrollTop:function(){var t=this.$el.offset().top-14,i=e(".navbar-fixed-top");i.length&&(t-=i.outerHeight()),window.scrollY>t&&e("html, body").stop(!0,!1).animate({scrollTop:t})},getModelFromEvent:function(e){return this.collection.get(this.$(e.target).closest(".list-item").attr("data-id"))}});return a.actions={viewDetails:function(e,t){return{id:"viewDetails",icon:"file-text-o",label:r(e,t,"LIST:ACTION:viewDetails"),href:e.genClientUrl()}},edit:function(e,t){return{id:"edit",icon:"edit",label:r(e,t,"LIST:ACTION:edit"),href:e.genClientUrl("edit")}},"delete":function(e,t){return{id:"delete",icon:"times",label:r(e,t,"LIST:ACTION:delete"),href:e.genClientUrl("delete")}},viewEditDelete:function(e,t,s){return function(n){var o=e.get(n._id),l=[a.actions.viewDetails(o,s)];return i.isAllowedTo((t||o.getPrivilegePrefix())+":MANAGE")&&l.push(a.actions.edit(o,s),a.actions["delete"](o,s)),l}}},a});