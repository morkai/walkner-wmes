define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,function(t){return _ENCODE_HTML_RULES[t]||t})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<div class="panel panel-default xiconfPrograms-details-pe">\n  <div class="panel-heading">\n    '),__output.push(t("xiconfPrograms","step:pe")),__output.push('\n  </div>\n  <div class="panel-details">\n    <div class="props first">\n      <div class="prop">\n        <div class="prop-name">'),__output.push(t("xiconfPrograms","PROPERTY:startTime")),__output.push('</div>\n        <div class="prop-value">'),__output.push(escape(time.toString(step.startTime))),__output.push('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__output.push(t("xiconfPrograms","PROPERTY:duration")),__output.push('</div>\n        <div class="prop-value">'),__output.push(escape(time.toString(step.duration))),__output.push('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__output.push(t("xiconfPrograms","PROPERTY:voltage")),__output.push('</div>\n        <div class="prop-value">'),__output.push(escape(step.voltage.toLocaleString())),__output.push('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__output.push(t("xiconfPrograms","PROPERTY:resistance:max")),__output.push('</div>\n        <div class="prop-value">'),__output.push(escape(step.resistanceMax.toLocaleString())),__output.push("</div>\n      </div>\n    </div>\n  </div>\n</div>\n");return __output.join("")}});