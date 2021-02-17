define(["jquery","app/core/views/FormView","app/orgUnits/util/setUpOrgUnitSelect2","app/wmes-gft-testers/templates/form"],function(t,e,n,s){"use strict";return e.extend({template:s,events:Object.assign({"click td":function(t){if("checkbox"===t.target.type)return;const e=this.$(t.currentTarget).find("input");e.length&&(e[0].checked=!e[0].checked)},"mouseenter td":function(t){const e=this.$(t.currentTarget);e.find("input").length&&(e[0].style.background="#FFFFD6",e[0].parentNode.firstElementChild.style.background="#FFFFD6",this.$ledThs[e.index()-1].style.background="#FFFFD6")},"mouseleave td":function(t){const e=this.$(t.currentTarget);e.find("input").length&&(e[0].style.background="",e[0].parentNode.firstElementChild.style.background="",this.$ledThs[e.index()-1].style.background="")},"click #-addLeds":function(){const e=++this.ledsI;this.$id("ledsHd")[0].colSpan+=1;const n=t(`\n          <th class="is-min">\n            <input type="number" name="program[${e}].leds" value="" class="form-control no-controls">\n          </th>\n        `);n.insertBefore(this.$id("leds")[0].lastElementChild),this.$ledThs.push(n[0]),this.$id("outputs").children().each((n,s)=>{t(`\n            <td class="is-min"><input type="checkbox" name="program[${e}].outputs[]" value="${n+1}"></td>\n          `).insertBefore(s.lastElementChild)}),n.find("input").focus()}},e.prototype.events),serializeToForm:function(){return this.model.toJSON()},serializeForm:function(t){return t.station=parseInt(t.station,10),t.port=parseInt(t.port,10),t.program=(t.program||[]).map(t=>({leds:parseInt(t.leds,10),outputs:(t.outputs||[]).map(t=>parseInt(t,10))})).filter(t=>t.leds>0&&t.outputs.length>0),t},getTemplateData:function(){return{program:(this.model.get("program")||[]).concat([{leds:"",outputs:[]},{leds:"",outputs:[]},{leds:"",outputs:[]}])}},afterRender:function(){e.prototype.afterRender.apply(this,arguments),this.$ledThs=this.$id("program").find("thead").find("tr").last().children().filter(".is-min"),this.ledsI=this.$ledThs.length-1,this.setUpLineSelect2()},setUpLineSelect2:function(){n(this.$id("line"),{width:"100%",orgUnitType:"prodLine",showDeactivated:!1})}})});