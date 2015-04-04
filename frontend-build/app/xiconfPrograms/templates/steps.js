define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(u){return void 0==u?"":String(u).replace(_MATCH_HTML,function(u){return _ENCODE_HTML_RULES[u]||u})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<div class="xiconfPrograms-steps">\n  '),steps.forEach(function(u){__output.push('\n  <div class="xiconfPrograms-step '),__output.push(u.stepClassName),__output.push('" data-type="'),__output.push(u.type),__output.push('" data-index="'),__output.push(u.index),__output.push('">\n    <div class="xiconfPrograms-step-status">\n      '),null!==u.unit&&(__output.push('\n      <div class="xiconfPrograms-step-unit xiconfPrograms-step-cornerBox">'),__output.push(u.unit),__output.push("</div>\n      ")),__output.push("\n      "),null!==u.minValue&&(__output.push('\n      <div class="xiconfPrograms-step-minValue xiconfPrograms-step-cornerBox">'),__output.push(u.minValue),__output.push("</div>\n      ")),__output.push("\n      "),null!==u.maxValue&&(__output.push('\n      <div class="xiconfPrograms-step-maxValue xiconfPrograms-step-cornerBox">'),__output.push(u.maxValue),__output.push("</div>\n      ")),__output.push("\n      "),null!==u.value&&(__output.push('\n      <div class="xiconfPrograms-step-value">'),__output.push(u.value),__output.push("</div>\n      ")),__output.push('\n    </div>\n    <div class="xiconfPrograms-step-nameAndProgress">\n      <h3 class="xiconfPrograms-step-name">'),__output.push(t("xiconfPrograms","step:"+u.type)),__output.push('</h3>\n      <div class="xiconfPrograms-step-details">\n        '),u.totalTime&&(__output.push('\n        <span class="xiconfPrograms-step-details-prop">T='),__output.push(u.totalTime),__output.push("</span>\n        ")),__output.push("\n        "),u.voltage&&(__output.push('\n        <span class="xiconfPrograms-step-details-prop">U='),__output.push(u.voltage),__output.push("V</span>\n        ")),__output.push("\n        "),u.resistanceMax&&(__output.push('\n        <span class="xiconfPrograms-step-details-prop">R<sub>max</sub>='),__output.push(u.resistanceMax),__output.push("Ω</span>\n        ")),__output.push("\n        "),u.powerReq&&(__output.push('\n        <span class="xiconfPrograms-step-details-prop">P<sub>req</sub>='),__output.push(u.powerReq),__output.push("W</span>\n        ")),__output.push("\n        "),u.powerMin&&(__output.push('\n        <span class="xiconfPrograms-step-details-prop">P<sub>min</sub>='),__output.push(u.powerMin),__output.push("W</span>\n        ")),__output.push("\n        "),u.powerMax&&(__output.push('\n        <span class="xiconfPrograms-step-details-prop">P<sub>max</sub>='),__output.push(u.powerMax),__output.push("W</span>\n        ")),__output.push('\n      </div>\n      <div class="progress">\n        <div class="progress-bar '),__output.push(u.progressBarClassName),__output.push('" style="width: '),__output.push(u.progressBarWidth),__output.push('"></div>\n      </div>\n    </div>\n  </div>\n  ')}),__output.push("\n</div>\n");return __output.join("")}});