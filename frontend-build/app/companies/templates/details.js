define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(p){return void 0==p?"":String(p).replace(_MATCH_HTML,function(p){return _ENCODE_HTML_RULES[p]||p})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<div class="panel panel-primary">\n  <div class="panel-heading">'),__output.push(t("companies","PANEL:TITLE:details")),__output.push('</div>\n  <div class="panel-details">\n    <div class="props first">\n      <div class="prop">\n        <div class="prop-name">'),__output.push(t("companies","PROPERTY:_id")),__output.push('</div>\n        <div class="prop-value">'),__output.push(escape(model._id)),__output.push('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__output.push(t("companies","PROPERTY:name")),__output.push('</div>\n        <div class="prop-value">'),__output.push(escape(model.name||"-")),__output.push('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__output.push(t("companies","PROPERTY:color")),__output.push('</div>\n        <div class="prop-value">'),__output.push(model.color),__output.push("</div>\n      </div>\n    </div>\n  </div>\n</div>\n");return __output.join("")}});