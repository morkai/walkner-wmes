define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="panel panel-primary">\n  <div class="panel-heading">'),__append(t("pkhdStrategies","PANEL:TITLE:details")),__append('</div>\n  <div class="panel-details">\n    <div class="props first">\n      '),["s","t","name"].forEach(function(n){__append('\n      <div class="prop">\n        <div class="prop-name">'),__append(t("pkhdStrategies","PROPERTY:"+n)),__append('</div>\n        <div class="prop-value">'),__append(escapeFn(model[n])),__append("</div>\n      </div>\n      ")}),__append("\n    </div>\n  </div>\n</div>\n");return __output.join("")}});