/*!
 * Bootstrap Colorpicker
 * (c) 2012 Stefan Petre
 * http://mjaalnir.github.io/bootstrap-colorpicker/
 * http://www.apache.org/licenses/LICENSE-2.0.txt
 */

!function(t){var e=function(t){this.value={h:1,s:1,b:1,a:1},this.setColor(t)};e.prototype={constructor:e,setColor:function(e){e=e.toLowerCase();var o=this;t.each(r.stringParsers,function(t,i){var s=i.re.exec(e),n=s&&i.parse(s),a=i.space||"rgba";return n?("hsla"===a?o.value=r.RGBtoHSB.apply(null,r.HSLtoRGB.apply(null,n)):o.value=r.RGBtoHSB.apply(null,n),!1):!0})},setHue:function(t){this.value.h=1-t},setSaturation:function(t){this.value.s=t},setLightness:function(t){this.value.b=1-t},setAlpha:function(t){this.value.a=parseInt(100*(1-t),10)/100},toRGB:function(t,e,o,i){t||(t=this.value.h,e=this.value.s,o=this.value.b),t*=360;var r,s,n,a,l;return t=t%360/60,l=o*e,a=l*(1-Math.abs(t%2-1)),r=s=n=o-l,t=~~t,r+=[l,a,0,0,a,l][t],s+=[a,l,l,a,0,0][t],n+=[0,0,a,l,l,a][t],{r:Math.round(255*r),g:Math.round(255*s),b:Math.round(255*n),a:i||this.value.a}},toHex:function(t,e,o,i){var r=this.toRGB(t,e,o,i);return"#"+(1<<24|parseInt(r.r)<<16|parseInt(r.g)<<8|parseInt(r.b)).toString(16).substr(1)},toHSL:function(t,e,o,i){t||(t=this.value.h,e=this.value.s,o=this.value.b);var r=t,s=(2-e)*o,n=e*o;return n/=s>0&&1>=s?s:2-s,s/=2,n>1&&(n=1),{h:r,s:n,l:s,a:i||this.value.a}}};var o=0,i=function(e,i){o++,this.element=t(e).attr("data-colorpicker-guid",o);var s=i.format||this.element.data("color-format")||"hex";this.format=r.translateFormats[s],this.isInput=this.element.is("input"),this.component=this.element.is(".colorpicker-component")?this.element.find(".add-on, .input-group-addon"):!1,this.picker=t(r.template).attr("data-colorpicker-guid",o).appendTo("body").on("mousedown.colorpicker",t.proxy(this.mousedown,this)),this.isInput?this.element.on({"focus.colorpicker":t.proxy(this.show,this),"keyup.colorpicker":t.proxy(this.update,this)}):this.component?this.component.on({"click.colorpicker":t.proxy(this.show,this)}):this.element.on({"click.colorpicker":t.proxy(this.show,this)}),("rgba"===s||"hsla"===s)&&(this.picker.addClass("alpha"),this.alpha=this.picker.find(".colorpicker-alpha")[0].style),this.component?(this.picker.find(".colorpicker-color").hide(),this.preview=this.element.find("i")[0].style):this.preview=this.picker.find("div:last")[0].style,this.base=this.picker.find("div:first")[0].style,this.update(),t(t.proxy(function(){this.element.trigger("create",[this])},this))};i.prototype={constructor:i,show:function(e){this.picker.show(),this.height=this.component?this.component.outerHeight():this.element.outerHeight(),this.place(),t(window).on("resize.colorpicker",t.proxy(this.place,this)),this.isInput||e&&(e.stopPropagation(),e.preventDefault()),t(document).on({"mousedown.colorpicker":t.proxy(this.hide,this)}),this.element.trigger({type:"showPicker",color:this.color})},update:function(){var t=this.isInput?this.element.prop("value"):this.element.data("color");("undefined"==typeof t||null===t)&&(t="#ffffff"),this.color=new e(t),this.picker.find("i").eq(0).css({left:100*this.color.value.s,top:100-100*this.color.value.b}).end().eq(1).css("top",100*(1-this.color.value.h)).end().eq(2).css("top",100*(1-this.color.value.a)),this.previewColor()},hide:function(){this.picker.hide(),t(window).off("resize",this.place),t(document).off({mousedown:this.hide}),this.isInput?""!==this.element.val()&&this.element.prop("value",this.format.call(this)).trigger("change"):(this.component&&""!==this.element.find("input").val()&&this.element.find("input").prop("value",this.format.call(this)).trigger("change"),this.element.data("color",this.format.call(this))),this.element.trigger({type:"hidePicker",color:this.color})},place:function(){var t=this.component?this.component.offset():this.element.offset();this.picker.css({top:t.top+this.height,left:t.left})},destroy:function(){t(".colorpicker[data-colorpicker-guid="+this.element.attr("data-colorpicker-guid")+"]").remove(),this.element.removeData("colorpicker").removeAttr("data-colorpicker-guid").off(".colorpicker"),this.component!==!1&&this.component.off(".colorpicker"),this.element.trigger("destroy",[this])},setValue:function(t){this.isInput?this.element.prop("value",t):(this.element.find("input").val(t),this.element.data("color",t)),this.update(),this.element.trigger({type:"changeColor",color:this.color})},previewColor:function(){try{this.preview.backgroundColor=this.format.call(this)}catch(t){this.preview.backgroundColor=this.color.toHex()}this.base.backgroundColor=this.color.toHex(this.color.value.h,1,1,1),this.alpha&&(this.alpha.backgroundColor=this.color.toHex())},pointer:null,slider:null,mousedown:function(e){e.stopPropagation(),e.preventDefault();var o=t(e.target),i=o.closest("div");if(!i.is(".colorpicker")){if(i.is(".colorpicker-saturation"))this.slider=t.extend({},r.sliders.saturation);else if(i.is(".colorpicker-hue"))this.slider=t.extend({},r.sliders.hue);else{if(!i.is(".colorpicker-alpha"))return!1;this.slider=t.extend({},r.sliders.alpha)}var s=i.offset();this.slider.knob=i.find("i")[0].style,this.slider.left=e.pageX-s.left,this.slider.top=e.pageY-s.top,this.pointer={left:e.pageX,top:e.pageY},t(document).on({"mousemove.colorpicker":t.proxy(this.mousemove,this),"mouseup.colorpicker":t.proxy(this.mouseup,this)}).trigger("mousemove")}return!1},mousemove:function(t){t.stopPropagation(),t.preventDefault();var e=Math.max(0,Math.min(this.slider.maxLeft,this.slider.left+((t.pageX||this.pointer.left)-this.pointer.left))),o=Math.max(0,Math.min(this.slider.maxTop,this.slider.top+((t.pageY||this.pointer.top)-this.pointer.top)));if(this.slider.knob.left=e+"px",this.slider.knob.top=o+"px",this.slider.callLeft&&this.color[this.slider.callLeft].call(this.color,e/100),this.slider.callTop&&this.color[this.slider.callTop].call(this.color,o/100),this.previewColor(),this.isInput)try{this.element.val(this.format.call(this)).trigger("change")}catch(t){this.element.val(this.color.toHex()).trigger("change")}else try{this.element.find("input").val(this.format.call(this)).trigger("change")}catch(t){this.element.find("input").val(this.color.toHex()).trigger("change")}return this.element.trigger({type:"changeColor",color:this.color}),!1},mouseup:function(e){return e.stopPropagation(),e.preventDefault(),t(document).off({mousemove:this.mousemove,mouseup:this.mouseup}),!1}},t.fn.colorpicker=function(e,o){return this.each(function(){var r=t(this),s=r.data("colorpicker"),n="object"==typeof e&&e;s?"string"==typeof e&&s[e](o):"destroy"!==e&&r.data("colorpicker",s=new i(this,t.extend({},t.fn.colorpicker.defaults,n)))})},t.fn.colorpicker.defaults={},t.fn.colorpicker.Constructor=i;var r={translateFormats:{rgb:function(){var t=this.color.toRGB();return"rgb("+t.r+","+t.g+","+t.b+")"},rgba:function(){var t=this.color.toRGB();return"rgba("+t.r+","+t.g+","+t.b+","+t.a+")"},hsl:function(){var t=this.color.toHSL();return"hsl("+Math.round(360*t.h)+","+Math.round(100*t.s)+"%,"+Math.round(100*t.l)+"%)"},hsla:function(){var t=this.color.toHSL();return"hsla("+Math.round(360*t.h)+","+Math.round(100*t.s)+"%,"+Math.round(100*t.l)+"%,"+t.a+")"},hex:function(){return this.color.toHex()}},sliders:{saturation:{maxLeft:100,maxTop:100,callLeft:"setSaturation",callTop:"setLightness"},hue:{maxLeft:0,maxTop:100,callLeft:!1,callTop:"setHue"},alpha:{maxLeft:0,maxTop:100,callLeft:!1,callTop:"setAlpha"}},RGBtoHSB:function(t,e,o,i){t/=255,e/=255,o/=255;var r,s,n,a;return n=Math.max(t,e,o),a=n-Math.min(t,e,o),r=0===a?null:n===t?(e-o)/a:n===e?(o-t)/a+2:(t-e)/a+4,r=(r+360)%6*60/360,s=0===a?0:a/n,{h:r||1,s:s,b:n,a:i||1}},HueToRGB:function(t,e,o){return 0>o?o+=1:o>1&&(o-=1),1>6*o?t+(e-t)*o*6:1>2*o?e:2>3*o?t+(e-t)*(2/3-o)*6:t},HSLtoRGB:function(t,e,o,i){0>e&&(e=0);var s;s=.5>=o?o*(1+e):o+e-o*e;var n=2*o-s,a=t+1/3,l=t,h=t-1/3,c=Math.round(255*r.HueToRGB(n,s,a)),p=Math.round(255*r.HueToRGB(n,s,l)),u=Math.round(255*r.HueToRGB(n,s,h));return[c,p,u,i||1]},stringParsers:[{re:/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,parse:function(t){return[t[1],t[2],t[3],t[4]]}},{re:/rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,parse:function(t){return[2.55*t[1],2.55*t[2],2.55*t[3],t[4]]}},{re:/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/,parse:function(t){return[parseInt(t[1],16),parseInt(t[2],16),parseInt(t[3],16)]}},{re:/#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/,parse:function(t){return[parseInt(t[1]+t[1],16),parseInt(t[2]+t[2],16),parseInt(t[3]+t[3],16)]}},{re:/hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,space:"hsla",parse:function(t){return[t[1]/360,t[2]/100,t[3]/100,t[4]]}}],template:'<div class="colorpicker dropdown-menu"><div class="colorpicker-saturation"><i><b></b></i></div><div class="colorpicker-hue"><i></i></div><div class="colorpicker-alpha"><i></i></div><div class="colorpicker-color"><div /></div></div>'}}(window.jQuery);