define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escape=escape||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="panel panel-primary">\n  <div class="panel-heading">'),__append(t("qiKinds","PANEL:TITLE:details")),__append('</div>\n  <div class="panel-details">\n    <div class="props first">\n      <div class="prop">\n        <div class="prop-name">'),__append(t("qiKinds","PROPERTY:name")),__append('</div>\n        <div class="prop-value">'),__append(escape(model.name)),__append("</div>\n      </div>\n    </div>\n  </div>\n</div>\n");return __output.join("")}});