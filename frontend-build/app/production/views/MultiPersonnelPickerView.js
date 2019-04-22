define(["underscore","app/i18n","app/viewport","app/core/View","app/users/util/setUpUserSelect2","app/production/templates/multiPersonnelPicker"],function(e,t,i,s,n,o){"use strict";return s.extend({template:o,dialogClassName:"production-modal production-multiPersonnelPicker-modal",localTopics:{"socket.connected":"render","socket.disconnected":"render"},events:{"keypress .select2-container":function(e){13===e.which&&(this.$el.submit(),e.preventDefault())},"focus #-picker-user":function(){this.setUpEmbeddedField()},"click #-picked-switch":function(){var e=this.$id("picker-user");e.val("").select2("data",[]),this.options.embedded?this.onVkbValueChange():this.setUpList(),this.$el.addClass("is-picking"),e.focus().select2("focus")},"click #-picker-switch":function(){this.switchToPicked()},"click #-picker-submit":function(){var e=this;if(e.socket.isConnected())if(e.options.embedded){var t=e.$id("picker-list").find(".active");t.length&&e.addUser({id:t[0].dataset.id,label:t.text().trim()})}else(e.$id("picker-user").select2("data")||[]).forEach(function(t){e.addUser({id:t.id,label:t.text})});else{var i=e.$id("picker-user").val().replace(/[^0-9]+/g,"");i.length&&e.addUser({id:null,label:i})}e.switchToPicked()},'click .btn[data-action="removeUser"]':function(e){this.$(e.currentTarget).parent().remove(),this.togglePickedSwitch();var i=this.$id("picked-list");i[0].childElementCount||i.html("<p>"+t("production","multiPersonnelPicker:empty")+"</p>")},"click .btn[data-id]":function(e){var t=this.$(e.currentTarget);t.parent().find(".active").removeClass("active"),t.addClass("active")},"input #-picker-user":function(){this.options.embedded&&this.onVkbValueChange()},"click .btn[value]":function(e){var t=this.$(e.currentTarget).parent().detach();this.$id("picked-list").prepend(t)},submit:function(e){e.preventDefault();var t=this.$id("picked-submit")[0];if(!t.disabled){t.disabled=!0;var i=[];this.$(".btn[value]").each(function(){var e=this.value,t=this.textContent.trim();i.push({id:e===t?null:e,label:t})}),this.trigger("usersPicked",i)}}},initialize:function(){this.lastPhrase="",this.lastUsers=[],this.searchReq=null},destroy:function(){this.options.vkb&&this.options.vkb.hide()},getTemplateData:function(){var e=!this.socket.isConnected(),i=e?"offline":this.options.embedded?"embedded":"online";return{offline:e,label:t("production","multiPersonnelPicker:"+i+":label")}},afterRender:function(){this.setUpField(),this.setUpList();var e=this.model.get(this.options.type),t=this.model.get(this.options.type+"s");Array.isArray(t)||(t=[]),e&&!t.length&&(this.model[this.options.type+"s"]=t=[e]),t.forEach(this.addUser,this),0===t.length&&this.$id("picked-switch").click()},setUpField:function(){if(!this.options.embedded){var e=this.$id("picker-user");if(this.socket.isConnected()){var t=this.$id("picked-list");n(e.removeClass("form-control"),{multiple:!0,sortable:!0,dropdownCssClass:"production-dropdown",userFilter:function(e){return 0===t.find('.btn[value="'+e._id+'"]').length}}),e.select2("focus")}else e.focus()}},setUpEmbeddedField:function(){this.options.vkb&&this.options.vkb.show(this.$id("picker-user").addClass("is-embedded")[0],this.onVkbValueChange.bind(this))},onVkbValueChange:function(){var e=!this.socket.isConnected(),i=this.$id("picker-user").val();i=e?i.replace(/[^0-9]+/g,""):n.transliterate(i);var s=this.$id("picker-list"),o="",r="";(!s.length||i.length<3&&this.options.vkb)&&this.options.vkb.enableKeys(),s.length&&(i.length?(o="matches",(r=this.buildPersonnelList(i)).length||(r='<p><i class="fa fa-spinner fa-spin"></i></p>')):(o="recent",r=this.recentHtml||"<p>"+t("production","multiPersonnelPicker:notFound")+"</p>"),s.find("label").html(t("production","multiPersonnelPicker:"+o)),s.find("div").html(r).find(".btn").first().click(),s.removeClass("hidden"),this.options.vkb&&this.options.vkb.reposition())},setUpList:function(){var i=this,s=i.$id("picker-list");if(!this.socket.isConnected())return s.remove();if(void 0===i.recentHtml)i.recentHtml="",i.ajax({url:"/production/getRecentPersonnel",data:{type:i.options.type+"s",prodLine:i.model.prodLine.id,shift:i.model.get("shift")}}).success(function(t){t.sort(function(e,t){return e.label.localeCompare(t.label,void 0,{numeric:!0,ignorePunctuation:!0})}),t.forEach(function(t){i.recentHtml+='<button type="button" class="btn btn-lg btn-default" data-id="'+t._id+'">'+e.escape(t.label)+"</button>"})}).always(function(){i.setUpList()});else if(i.recentHtml.length){var n=i.$id("pickedList");s.find(".btn-group-vertical").html(i.recentHtml).children().each(function(){n.find('.btn[value="'+this.dataset.id+'"]').length&&this.parentNode.removeChild(this)}),i.options.vkb&&i.options.vkb.reposition()}else{var o=s.find(".fa-spinner");o.length&&o.replaceWith(t("production","multiPersonnelPicker:notFound"))}},buildPersonnelList:function(e){var i=this;if(e.length<3)return"<p>"+t("production","multiPersonnelPicker:tooShort")+"</p>";var s=e.substring(0,3);return s===i.lastPhrase?i.searchReq?"":this.buildFilteredPersonnelList():(i.searchReq&&i.searchReq.abort(),i.searchReq=this.ajax({url:"/users?select(firstName,lastName,searchName,personellId)&sort(searchName)&limit(999)&active=true&searchName=regex="+encodeURIComponent("^"+e)}),i.searchReq.fail(function(){i.$(".fa-spin").removeClass("fa-spin")}),i.searchReq.done(function(e){i.lastUsers=e.collection||[];var t=i.$id("picker-list").removeClass("hidden").find("div").html(i.buildFilteredPersonnelList());i.options.vkb&&i.options.vkb.reposition(),t.first().click()}),i.searchReq.always(function(){i.searchReq=null}),i.lastPhrase=s,"")},buildFilteredPersonnelList:function(){var i=n.transliterate(this.$id("picker-user").val()||""),s={};this.$id("picked-list").find(".btn[value]").each(function(){s[this.value]=!0});var o={},r="";return this.lastUsers.filter(function(e){return!s[e._id]&&0===e.searchName.indexOf(i)}).forEach(function(t){var s=t.lastName||"";t.firstName.length&&(s.length&&(s+=" "),s+=t.firstName),t.personellId&&(s.length?s+=" ("+t.personellId+")":s=t.personellId),r+='<button type="button" class="btn btn-lg btn-default" data-id="'+t._id+'">'+e.escape(s)+"</button>";var n=t.searchName.substr(i.length,1);n&&(o[n]=!0)}),this.options.vkb&&this.options.vkb.disableKeys(o),r.length?r:"<p>"+t("production","multiPersonnelPicker:notFound")+"</p>"},addUser:function(t){var i=this.$id("picked-list"),s=t.id||t.label;if(!i.find('.btn[value="'+s+'"]').length){var n='<div class="production-form-btn-group-item"><button type="button" class="btn btn-default btn-lg" value="'+s+'">'+e.escape(t.label)+'</button><button type="button" class="btn btn-default btn-lg" data-action="removeUser"><i class="fa fa-times"></i></button></div>';"P"===i[0].firstElementChild.tagName&&i.html(""),i.append(n),this.togglePickedSwitch(),this.options.vkb&&this.options.vkb.reposition()}},togglePickedSwitch:function(){this.$id("picked-switch").prop("disabled",7===this.$id("picked-list")[0].childElementCount)},switchToPicked:function(){this.options.vkb&&this.options.vkb.hide(),this.$el.removeClass("is-picking")}})});