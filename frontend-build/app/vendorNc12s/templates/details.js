define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(p){return void 0==p?"":String(p).replace(_MATCH_HTML,function(p){return _ENCODE_HTML_RULES[p]||p})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<div class="panel panel-primary">\n  <div class="panel-heading">\n    '),__output.push(t("vendorNc12s","PANEL:TITLE:details")),__output.push('\n  </div>\n  <div class="panel-details">\n    <div class="props first">\n      <div class="prop">\n        <div class="prop-name">'),__output.push(t("vendorNc12s","PROPERTY:vendor")),__output.push('</div>\n        <div class="prop-value">'),__output.push(escape(model.vendor)),__output.push('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__output.push(t("vendorNc12s","PROPERTY:nc12")),__output.push('</div>\n        <div class="prop-value">'),__output.push(escape(model.nc12)),__output.push('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__output.push(t("vendorNc12s","PROPERTY:value")),__output.push('</div>\n        <div class="prop-value">'),__output.push(escape(""===model.value?"-":model.value)),__output.push('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__output.push(t("vendorNc12s","PROPERTY:unit")),__output.push('</div>\n        <div class="prop-value">'),__output.push(model.unit||"-"),__output.push("</div>\n      </div>\n    </div>\n  </div>\n</div>\n");return __output.join("")}});