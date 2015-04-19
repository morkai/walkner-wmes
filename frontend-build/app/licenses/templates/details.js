define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(p){return void 0==p?"":String(p).replace(_MATCH_HTML,function(p){return _ENCODE_HTML_RULES[p]||p})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<div class="panel panel-primary">\n  <div class="panel-heading">\n    '),__output.push(t("licenses","PANEL:TITLE:details")),__output.push('\n  </div>\n  <div class="panel-details">\n    <div class="props first">\n      <div class="prop">\n        <div class="prop-name">'),__output.push(t("licenses","PROPERTY:_id")),__output.push('</div>\n        <div class="prop-value licenses-id">'),__output.push(escape(model._id)),__output.push('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__output.push(t("licenses","PROPERTY:appId")),__output.push('</div>\n        <div class="prop-value licenses-id">'),__output.push(escape(model.appId)),__output.push('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__output.push(t("licenses","PROPERTY:appName")),__output.push('</div>\n        <div class="prop-value">'),__output.push(escape(model.appName)),__output.push('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__output.push(t("licenses","PROPERTY:appVersion")),__output.push('</div>\n        <div class="prop-value">'),__output.push(escape(model.appVersion)),__output.push('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__output.push(t("licenses","PROPERTY:date")),__output.push('</div>\n        <div class="prop-value">'),__output.push(escape(model.date)),__output.push('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__output.push(t("licenses","PROPERTY:licensee")),__output.push('</div>\n        <div class="prop-value">'),__output.push(escape(model.licensee)),__output.push('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__output.push(t("licenses","PROPERTY:features")),__output.push('</div>\n        <div class="prop-value">'),__output.push(model.features),__output.push('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__output.push(t("licenses","PROPERTY:key")),__output.push('</div>\n        <div class="prop-value"><pre>'),__output.push(model.key),__output.push("</pre></div>\n      </div>\n    </div>\n  </div>\n</div>\n");return __output.join("")}});