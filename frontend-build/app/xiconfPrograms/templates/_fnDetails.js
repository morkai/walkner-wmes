define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(p){return void 0==p?"":String(p).replace(_MATCH_HTML,function(p){return _ENCODE_HTML_RULES[p]||p})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<div class="panel panel-default xiconfPrograms-stepPanel xiconfPrograms-stepPanel-fn">\n  <div class="panel-heading">'),__output.push(stepIndex+1),__output.push(". "),__output.push(t("xiconfPrograms","step:fn")),__output.push('</div>\n  <div class="panel-details">\n    <div class="props first">\n      '),"t24vdc"===model.type&&(__output.push('\n      <div class="prop">\n        <div class="prop-name">'),__output.push(t("xiconfPrograms","PROPERTY:startTime")),__output.push('</div>\n        <div class="prop-value">'),__output.push(escape(time.toString(step.startTime,!1,!0))),__output.push('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__output.push(t("xiconfPrograms","PROPERTY:duration")),__output.push('</div>\n        <div class="prop-value">'),__output.push(escape(time.toString(step.duration,!1,!0))),__output.push('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__output.push(t("xiconfPrograms","PROPERTY:voltage")),__output.push('</div>\n        <div class="prop-value">'),__output.push(escape(step.voltage.toLocaleString())),__output.push('</div>\n      </div>\n      <div class="prop">\n        '),step.powerMin===step.powerMax&&step.powerReq===step.powerMin?(__output.push('\n        <div class="prop-name">'),__output.push(t("xiconfPrograms","PROPERTY:power:req")),__output.push('</div>\n        <div class="prop-value">'),__output.push(escape(step.powerReq)),__output.push("</div>\n        ")):(__output.push('\n        <div class="prop-name">'),__output.push(t("xiconfPrograms","PROPERTY:power")),__output.push('</div>\n        <div class="prop-value">'),__output.push(escape(step.powerMin)),__output.push(" ≤ <strong>"),__output.push(escape(step.powerReq)),__output.push("</strong> ≤ "),__output.push(escape(step.powerMax)),__output.push("</div>\n        ")),__output.push("\n      </div>\n      ")),__output.push("\n      "),"glp2"===model.type&&(__output.push('\n      <div class="prop">\n        <div class="prop-name">'),__output.push(t("xiconfPrograms","PROPERTY:label")),__output.push('</div>\n        <div class="prop-value">'),__output.push(escape(step.label)),__output.push('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__output.push(t("xiconfPrograms","PROPERTY:startTime")),__output.push('</div>\n        <div class="prop-value">'),__output.push(escape(time.toString(step.startTime,!1,!0))),__output.push('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__output.push(t("xiconfPrograms","PROPERTY:duration")),__output.push('</div>\n        <div class="prop-value">'),__output.push(escape(time.toString(step.duration,!1,!0))),__output.push('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__output.push(t("xiconfPrograms","PROPERTY:mode")),__output.push('</div>\n        <div class="prop-value">'),__output.push(t("xiconfPrograms","glp2:fn:mode:"+step.mode)),__output.push('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__output.push(t("xiconfPrograms","glp2:fn:mode:"+step.mode+":label")),__output.push('</div>\n        <div class="prop-value">\n          '),5===step.mode?__output.push("\n          -\n          "):(__output.push("\n          "),0!==step.lowerToleranceRel&&0!==step.upperToleranceRel?(__output.push("\n          "),__output.push((Math.round(step.setValue*((100-step.lowerToleranceRel)/100)*100)/100).toLocaleString()),__output.push("\n          ≤ <strong>"),__output.push(step.setValue.toLocaleString()),__output.push("</strong>\n          ≤ "),__output.push((Math.round(step.setValue*((100+step.upperToleranceRel)/100)*100)/100).toLocaleString()),__output.push("\n          ")):(__output.push("\n          "),__output.push(step.lowerToleranceAbs.toLocaleString()),__output.push("\n          ≤ <strong>"),__output.push(step.setValue.toLocaleString()),__output.push("</strong>\n          ≤ "),__output.push(step.upperToleranceAbs.toLocaleString()),__output.push("\n          ")),__output.push("\n          ")),__output.push('\n        </div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__output.push(t("xiconfPrograms","PROPERTY:trigger")),__output.push('</div>\n        <div class="prop-value">'),__output.push(t("xiconfPrograms","PROPERTY:trigger:"+step.trigger)),__output.push("</div>\n      </div>\n      ")),__output.push("\n    </div>\n  </div>\n</div>\n");return __output.join("")}});