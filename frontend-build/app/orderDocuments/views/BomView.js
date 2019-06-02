define(["underscore","app/core/View","app/core/util","app/core/util/embedded","app/core/util/scrollbarSize","app/production/views/VkbView","app/planning/util/contextMenu","app/orderDocuments/templates/bom"],function(e,t,n,o,s,i,c,r){"use strict";return t.extend({template:r,events:{"click #-close":function(){this.model.set("bom",e.defaults({active:!1},this.model.get("bom")))},"click #-next":function(){var e=this.els.documentPages.scrollLeft,t=Math.floor(e/300);this.els.documentPages.scrollLeft=300*t+301},"click #-prev":function(){var e=this.els.documentPages.scrollLeft,t=Math.floor(e/300);this.els.documentPages.scrollLeft=1===t?0:300*t-299},"click #-expand":function(){var e=this.el.parentNode.dataset;e.expand=Math.min(4,parseInt(e.expand,10)+1).toString()},"click #-collapse":function(){var e=this.el.parentNode.dataset;e.expand=Math.max(0,parseInt(e.expand,10)-1).toString()},"input #-filter":function(e){this.filterPhrase=e.target.value,this.filter()},"focus #-filter":function(e){clearTimeout(this.timers.hideVkb);var t=this.$id("filter");this.vkbView.show(e.currentTarget,function(){t.trigger("input")})},"blur #-filter":function(){clearTimeout(this.timers.hideVkb),this.timers.hideVkb=setTimeout(this.vkbView.hide.bind(this.vkbView),100)},"mouseenter .orderDocuments-bom-documentPages-page":function(e){this.highlight(e.currentTarget,!0)},"mouseleave .orderDocuments-bom-documentPages-page":function(e){this.highlight(e.currentTarget,!1)},"click .orderDocuments-bom-documentPages-page":function(e){var t=this.$(e.currentTarget),n=t[0].dataset.document;if(n){var o=+t[0].dataset.page;if(o){var s=+t.closest(".orderDocuments-bom-documentPages-component")[0].dataset.componentIndex,i=this.model.get("bom").components[s].marks[n]||[];i.length&&this.model.trigger("marksRequested",{nc15:n,page:o,marks:i})}else this.showMoreMenu(e)}},"click .orderDocuments-bom-component":function(e){if("0"===this.el.parentNode.dataset.expand){var t=+e.currentTarget.dataset.componentIndex,n=this.els.documentPages.children[t],o=this.model.getCurrentOrder(),s=n.querySelector('.orderDocuments-bom-documentPages-page[data-document="'+o.nc15+'"]');s&&s.click()}}},initialize:function(){var e=this;e.filterPhrase="",e.vkbView=new i({reposition:function(){if(this.fieldEl){var t=e.$id("filter")[0].getBoundingClientRect();this.$el.css({top:t.top-1+"px",left:t.left+t.width-1+"px",right:"auto",bottom:"auto",marginLeft:"0"})}}}),e.listenTo(e.model,"change:bom",function(){this.model.isBomActive()||e.vkbView.hide()}),e.setView("#-vkb",e.vkbView)},destroy:function(){this.els={}},getTemplateData:function(){var t=this,n=t.model.getCurrentOrder(),i=t.model.get("bom")||{documents:{},components:[]},c=[];void 0!==i.documents[n.nc15]&&c.push({nc15:n.nc15,name:i.documents[n.nc15]}),Object.keys(i.documents).forEach(function(e){e!==n.nc15&&c.push({nc15:e,name:i.documents[e]})});var r=t.filterPhrase.toUpperCase().replace(/[^0-9A-Z]+/g,"");return i.components.forEach(function(n,o){n.nameFilter||(n.nameFilter=n.name.toUpperCase().replace(/[^0-9A-Z]+/g,"")),n.visible=t.isVisible(n,o,r),n.documentPages||(n.hasAnyMarks=!1,n.documentPages=[],c.forEach(function(t){var o={};(n.marks[t.nc15]||[]).forEach(function(e){n.hasAnyMarks=!0,o[e.p]={page:e.p,document:t.nc15}}),n.documentPages.push(e.values(o).sort(function(e,t){return e.page-t.page}))}))}),{touch:o.isEnabled(),filterPhrase:t.filterPhrase,documents:c,components:i.components,scrollbarSize:s}},afterRender:function(){this.els={components:this.$id("components")[0],documents:this.$id("documents")[0],documentPages:this.$id("documentPages")[0]},this.els.components.addEventListener("scroll",this.onComponentsScroll.bind(this)),this.els.documents.addEventListener("scroll",this.onDocumentsScroll.bind(this)),this.els.documentPages.addEventListener("scroll",this.onDocumentPagesScroll.bind(this))},filter:function(){var e=this,t=this.model.get("bom"),n=e.filterPhrase.toUpperCase().replace(/[^0-9A-Z]+/g,"");e.$(e.els.components).children().each(function(o){var s=t.components[o];if(s){var i=!e.isVisible(s,o,n);e.els.components.children[o].classList.toggle("hidden",i),e.els.documentPages.children[o].classList.toggle("hidden",i)}})},isVisible:function(e,t,n){return!(0!==n.length&&-1===e.item.indexOf(n)&&-1===e.nc12.indexOf(n)&&-1===e.nameFilter.indexOf(n))},highlight:function(e,t){var n=e.dataset.document,o=this.els.documents.querySelector('[data-nc15="'+n+'"]'),s=+this.$(e).closest(".orderDocuments-bom-documentPages-component")[0].dataset.componentIndex;this.els.components.children[s].classList.toggle("is-highlighted",t),o&&o.classList.toggle("is-highlighted",t)},showMoreMenu:function(t){for(var n=this,o=n.$(t.currentTarget),s=o[0].dataset.document,i=+o.closest(".orderDocuments-bom-documentPages-component")[0].dataset.componentIndex,r=n.model.get("bom").components[i].marks[s],a={},l=0;l<r.length;++l)a[r[l].p]=r[l].p;var d=[];e.values(a).sort(function(e,t){return e-t}).forEach(function(e,t){t<3||d.push({label:e.toString(),handler:function(e){n.model.trigger("marksRequested",{nc15:s,page:e,marks:r})}.bind(null,e)})});if(d.length>4){var m=4-d.length%4;if(m<4)for(var u=0;u<m;++u)d.push({label:"&nbsp;",disabled:!0})}c.show(n,t.pageY,t.pageX,{className:"orderDocuments-bom-documentPages-more-menu",menu:d})},onComponentsScroll:function(){this.els.documentPages.scrollTop=this.els.components.scrollTop},onDocumentsScroll:function(){this.els.documentPages.scrollLeft=this.els.documents.scrollLeft},onDocumentPagesScroll:function(){this.els.components.scrollTop=this.els.documentPages.scrollTop,this.els.documents.scrollLeft=this.els.documentPages.scrollLeft}})});