define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(p){return void 0==p?"":String(p).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(p){return _ENCODE_HTML_RULES[p]||p}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="panel panel-default xiconfPrograms-stepPanel xiconfPrograms-stepPanel-fn">\n  <div class="panel-heading">'),__append(stepIndex+1),__append(". "),__append(helpers.t("step:fn")),__append('</div>\n  <div class="panel-details">\n    <div class="props first">\n      '),"t24vdc"===model.type&&(__append('\n      <div class="prop">\n        <div class="prop-name">'),__append(helpers.t("PROPERTY:startTime")),__append('</div>\n        <div class="prop-value">'),__append(escapeFn(time.toString(step.startTime,!1,!0))),__append('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(helpers.t("PROPERTY:duration")),__append('</div>\n        <div class="prop-value">'),__append(escapeFn(time.toString(step.duration,!1,!0))),__append('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(helpers.t("PROPERTY:voltage")),__append('</div>\n        <div class="prop-value">'),__append(escapeFn(step.voltage.toLocaleString())),__append('</div>\n      </div>\n      <div class="prop">\n        '),step.powerMin===step.powerMax&&step.powerReq===step.powerMin?(__append('\n        <div class="prop-name">'),__append(helpers.t("PROPERTY:power:req")),__append('</div>\n        <div class="prop-value">'),__append(escapeFn(step.powerReq)),__append("</div>\n        ")):(__append('\n        <div class="prop-name">'),__append(helpers.t("PROPERTY:power")),__append('</div>\n        <div class="prop-value">'),__append(escapeFn(step.powerMin)),__append(" ≤ <strong>"),__append(escapeFn(step.powerReq)),__append("</strong> ≤ "),__append(escapeFn(step.powerMax)),__append("</div>\n        ")),__append("\n      </div>\n      ")),__append("\n      "),"glp2"===model.type&&(__append('\n      <div class="prop">\n        <div class="prop-name">'),__append(helpers.t("PROPERTY:label")),__append('</div>\n        <div class="prop-value">'),__append(escapeFn(step.label)),__append('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(helpers.t("PROPERTY:startTime")),__append('</div>\n        <div class="prop-value">'),__append(escapeFn(time.toString(step.startTime,!1,!0))),__append('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(helpers.t("PROPERTY:duration")),__append('</div>\n        <div class="prop-value">'),__append(escapeFn(time.toString(step.duration,!1,!0))),__append('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(helpers.t("PROPERTY:mode")),__append('</div>\n        <div class="prop-value">'),__append(helpers.t("glp2:fn:mode:"+step.mode)),__append('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(helpers.t("glp2:fn:mode:"+step.mode+":label")),__append('</div>\n        <div class="prop-value">\n          '),5===step.mode?__append("\n          -\n          "):(__append("\n          "),0!==step.lowerToleranceRel&&0!==step.upperToleranceRel?(__append("\n          "),__append((Math.round(step.setValue*((100-step.lowerToleranceRel)/100)*100)/100).toLocaleString()),__append("\n          ≤ <strong>"),__append(step.setValue.toLocaleString()),__append("</strong>\n          ≤ "),__append((Math.round(step.setValue*((100+step.upperToleranceRel)/100)*100)/100).toLocaleString()),__append("\n          ")):(__append("\n          "),__append(step.lowerToleranceAbs.toLocaleString()),__append("\n          ≤ <strong>"),__append(step.setValue.toLocaleString()),__append("</strong>\n          ≤ "),__append(step.upperToleranceAbs.toLocaleString()),__append("\n          ")),__append("\n          ")),__append('\n        </div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(helpers.t("PROPERTY:trigger")),__append('</div>\n        <div class="prop-value">'),__append(helpers.t("PROPERTY:trigger:"+step.trigger)),__append('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(helpers.t("PROPERTY:lampCount")),__append('</div>\n        <div class="prop-value">'),__append(step.lampCount||0),__append('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(helpers.t("PROPERTY:lampDuration")),__append('</div>\n        <div class="prop-value">'),__append(time.toString(step.lampDuration||0)),__append("</div>\n      </div>\n      ")),__append("\n    </div>\n  </div>\n</div>\n");return __output.join("")}});