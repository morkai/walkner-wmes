define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(p){return _ENCODE_HTML_RULES[p]||p}escape=escape||function(p){return void 0==p?"":String(p).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="panel panel-primary">\n  <div class="panel-heading">'),__append(t("qiActionStatuses","PANEL:TITLE:details")),__append('</div>\n  <div class="panel-details">\n    <div class="props first">\n      <div class="prop">\n        <div class="prop-name">'),__append(t("qiActionStatuses","PROPERTY:_id")),__append('</div>\n        <div class="prop-value">'),__append(escape(model._id)),__append('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(t("qiActionStatuses","PROPERTY:name")),__append('</div>\n        <div class="prop-value">'),__append(escape(model.name)),__append('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(t("qiActionStatuses","PROPERTY:position")),__append('</div>\n        <div class="prop-value">'),__append(escape(model.position||0)),__append("</div>\n      </div>\n    </div>\n  </div>\n</div>\n");return __output.join("")}});