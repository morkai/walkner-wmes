define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(p){return void 0==p?"":String(p).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(p){return _ENCODE_HTML_RULES[p]||p}var __output="";function __append(p){void 0!==p&&null!==p&&(__output+=p)}with(locals||{})["lp10","fmx","kitter","platformer","packer"].forEach(function(p){__append('\n<div class="wh-problems-column wh-problems-func '),__append(funcs[p].className),__append(" "),__append(funcs[p].solvable?"wh-problems-solvable":""),__append('" data-func="'),__append(p),__append('">\n  <div class="wh-problems-prop">\n    <div class="wh-problems-prop-name">'),__append(funcs[p].label),__append('</div>\n    <div class="wh-problems-prop-value">'),__append(funcs[p].status),__append("</div>\n  </div>\n  "),funcs[p].user&&(__append('\n  <div class="wh-problems-prop">\n    <div class="wh-problems-prop-name">'),__append(helpers.t("prop:user")),__append('</div>\n    <div class="wh-problems-prop-value">'),__append(funcs[p].user),__append("</div>\n  </div>\n  ")),__append("\n  "),funcs[p].carts&&(__append('\n  <div class="wh-problems-prop">\n    <div class="wh-problems-prop-name">'),__append(helpers.t("prop:carts")),__append('</div>\n    <div class="wh-problems-prop-value">'),__append(funcs[p].carts),__append("</div>\n  </div>\n  ")),__append("\n  "),funcs[p].problemArea&&(__append('\n  <div class="wh-problems-prop">\n    <div class="wh-problems-prop-name">'),__append(helpers.t("prop:problemArea")),__append('</div>\n    <div class="wh-problems-prop-value">'),__append(funcs[p].problemArea),__append("</div>\n  </div>\n  ")),__append("\n  "),funcs[p].problem&&(__append('\n  <div class="wh-problems-prop wh-problems-problem">\n    <div class="wh-problems-prop-name">'),__append(helpers.t("prop:problem")),__append('</div>\n    <div class="wh-problems-prop-value">'),__append(funcs[p].problem),__append("</div>\n  </div>\n  ")),__append("\n</div>\n")}),__append("\n");return __output}});