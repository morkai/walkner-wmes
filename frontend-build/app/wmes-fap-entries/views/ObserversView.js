define(["underscore","app/core/View","app/users/util/setUpUserSelect2","../dictionaries","app/wmes-fap-entries/templates/observers"],function(e,s,i,t,r){"use strict";return s.extend({template:r,events:{"change #-observer":function(){var e=this.$id("observer"),s=i.getUserInfo(e);e.select2("data",null),this.addObserver(s)},"click a[data-quick-add]":function(e){e.preventDefault(),this.addObserver({id:e.currentTarget.dataset.quickAdd,label:e.currentTarget.textContent.trim()})}},initialize:function(){this.once("afterRender",function(){this.listenTo(this.model,"change:observers",e.debounce(this.onObserversChanged.bind(this),1)),this.listenTo(this.model,"change:presence",this.onPresenceChanged),this.listenTo(this.model,"change:level",this.toggleMessage),this.listenTo(t.settings,"change:value",this.onSettingChanged)})},getTemplateData:function(){return{showMessage:this.isMessageVisible(),observers:this.model.serializeDetails().observers}},afterRender:function(){var e=this.$id("observer"),s=this.model.serializeDetails().auth.observers;i(e,{width:"100%",noPersonnelId:!0,placeholder:this.t("observers:placeholder"+(s?"":":auth"))}),s||(e.select2("enable",!1),this.$id("quickAdd").find(".btn").prop("disabled",!0)),this.updateQuickAdd()},addObserver:function(s){if(!e.some(this.model.get("observers"),function(e){return e.user.id===s.id})){var i=[s];this.model.change("subscribers",i,null)}this.timers.focus=setTimeout(this.focusObserver.bind(this,s.id),1)},focusObserver:function(e){var s=this,i=s.$('.fap-observer[data-observer-id="'+e+'"]');i.length&&(i[0].scrollIntoViewIfNeeded?i[0].scrollIntoViewIfNeeded():i[0].scrollIntoView(),s.$(".highlight").removeClass("highlight"),clearTimeout(this.timers.highlight),this.timers.highlight=setTimeout(function(){(i=s.$('.fap-observer[data-observer-id="'+e+'"]')).addClass("highlight"),s.timers.highlight=setTimeout(function(){i.removeClass("highlight")},1100)},100))},hideUserInfoPopover:function(){this.$(".userInfoPopover").prev().popover("destroy")},isMessageVisible:function(){var e=this.model.serializeDetails();return 0===e.level&&1===e.observers.length},toggleMessage:function(){this.$el.toggleClass("fap-details-panel-message-show",this.isMessageVisible())},updateQuickAdd:function(){var s={};this.model.serializeDetails().observers.forEach(function(e){s[e._id]=!0});var i="";t.settings.getValue("quickUsers",[]).forEach(function(t){s[t.id]||(i+='<li><a href="#" data-quick-add="'+t.id+'">'+e.escape(t.label)+"</a></li>")}),this.$id("quickAdd").find("ul").html(i),this.$id("quickAdd").find(".btn").prop("disabled",!i.length)},onObserversChanged:function(){var e=this.renderPartial(r,{showMessage:!1,observers:this.model.serializeObservers()}).find(".fap-details-panel-bd");this.$(".fap-details-panel-bd").replaceWith(e),e.on("scroll",this.hideUserInfoPopover.bind(this)),this.toggleMessage(),this.updateQuickAdd()},onPresenceChanged:function(e,s,i){this.$('.fap-observer[data-observer-id="'+i.userId+'"]').toggleClass("fap-is-online",i.online)},onSettingChanged:function(e){/quickUsers$/.test(e.id)&&this.updateQuickAdd()}})});