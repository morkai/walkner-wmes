define(["underscore","jquery","app/core/View","app/production/templates/vkb"],function(e,t,i,s){"use strict";return i.extend({template:s,events:{"focus .btn[data-key]":function(e){this.trigger("keyFocused",e.currentTarget.dataset.key)},"click .btn[data-key]":function(e){this.pressKey(e.currentTarget.dataset.key)}},initialize:function(){this.fieldEl=null,this.onValueChange=null,this.mode={alpha:!1,numeric:!0,negative:!1,multiline:!1},t(window).on("resize."+this.idPrefix,e.debounce(this.reposition.bind(this),30))},destroy:function(){t(window).off("."+this.idPrefix),this.fieldEl=null,this.onValueChange=null},serialize:function(){return{idPrefix:this.idPrefix,mode:this.mode}},reposition:function(){if(this.fieldEl){var e={top:"",right:"",bottom:"",left:""},i={marginLeft:""},s=this.$el,n=t(".modal-dialog");s.css(e),n.css(i);var o=n.offset(),a=n.outerWidth(),l=n.outerHeight(),d=s.offset(),h=s.outerWidth(),r=o.top+l+30>d.top,u=o.left+a+30>d.left;r&&this.mode.numeric&&!this.mode.alpha?(e.top=this.fieldEl.getBoundingClientRect().top+"px",e.left=o.left+a+30,e.bottom="auto",e.right="auto"):r&&u&&this.mode.alpha&&window.innerWidth>800&&(i.marginLeft=Math.max(30,window.innerWidth-30-h-30-a)+"px"),s.toggleClass("is-repositioned",r).css(e),n.css(i)}},show:function(e,i){var s=this;return(s.fieldEl!==e||s.onValueChange!==i)&&(Object.keys(this.mode).forEach(function(e){s.mode[e]=!1}),(e.dataset.vkb||"").split(" ").forEach(function(e){s.mode[e]=!0}),s.render(),s.$el.removeClass("is-repositioned hidden"),t(".is-vkb-focused").removeClass("is-vkb-focused"),e.classList.add("is-vkb-focused"),s.fieldEl=e,s.onValueChange=i,s.reposition(),!0)},hide:function(){t(".modal-dialog").css("margin-left",""),this.$el.addClass("hidden"),this.fieldEl&&this.fieldEl.classList.remove("is-vkb-focused"),this.fieldEl=null,this.onValueChange=null},isVisible:function(){return!this.$el.hasClass("hidden")},enableKeys:function(){this.$(".btn[data-key][disabled]").each(function(){this.disabled=!1})},disableKeys:function(e){this.$(".btn[data-key]").each(function(){1===this.dataset.key.length&&(this.disabled=!0!==e[this.dataset.key])})},pressKey:function(e){var t=this.fieldEl;if(t){var i=t.value,s=t.selectionStart,n=t.selectionEnd;"ENTER"===e?e="\n":"SPACE"===e&&(e=" "),"CLEAR"===e?(s=0,i=""):"BACKSPACE"===e?(s-=1,i=i.substring(0,s)+i.substring(n)):"LEFT"===e?s-=1:"RIGHT"===e?s+=1:(!t.maxLength||-1===t.maxLength||i.length<t.maxLength)&&(i=i.substring(0,s)+e+i.substring(n),s+=1);var o=t.value!==i;t.value=i,t.focus(),t.setSelectionRange(s,s),o&&this.onValueChange&&this.onValueChange(t)}}})});