define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="xiconfPrograms-steps">\n  '),steps.forEach(function(n){__append('\n  <div class="xiconfPrograms-step '),__append(n.stepClassName),__append('" data-type="'),__append(n.type),__append('" data-index="'),__append(n.index),__append('">\n    <div class="xiconfPrograms-step-status">\n      '),null!==n.unit&&(__append('\n      <div class="xiconfPrograms-step-unit xiconfPrograms-step-cornerBox">'),__append(n.unit),__append("</div>\n      ")),__append("\n      "),null!==n.minValue&&(__append('\n      <div class="xiconfPrograms-step-minValue xiconfPrograms-step-cornerBox">'),__append(n.minValue),__append("</div>\n      ")),__append("\n      "),null!==n.maxValue&&(__append('\n      <div class="xiconfPrograms-step-maxValue xiconfPrograms-step-cornerBox">'),__append(n.maxValue),__append("</div>\n      ")),__append("\n      "),null!==n.value&&(__append('\n      <div class="xiconfPrograms-step-value" data-length="'),__append(n.value.length),__append('">'),__append(n.value),__append("</div>\n      ")),__append('\n    </div>\n    <div class="xiconfPrograms-step-nameAndProgress">\n      <h3 class="xiconfPrograms-step-name">'),__append(n.label||helpers.t("step:"+n.type)),__append('</h3>\n      <div class="xiconfPrograms-step-details">\n        '),n.props.forEach(function(n){__append("\n        "),n.key&&(__append('\n        <span class="xiconfPrograms-step-details-prop">'),__append(n.key),__append(n.sub?"<sub>"+n.sub+"</sub>":""),__append("="),__append(n.value),__append(n.unit||""),__append("</span>\n        ")),__append("\n        ")}),__append('\n      </div>\n      <div class="progress">\n        <div class="progress-bar '),__append(n.progressBarClassName),__append('" style="width: '),__append(n.progressBarWidth),__append('"></div>\n      </div>\n    </div>\n  </div>\n  ')}),__append("\n</div>\n");return __output.join("")}});