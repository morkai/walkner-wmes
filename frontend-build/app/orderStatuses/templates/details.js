define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(u){return void 0==u?"":String(u).replace(_MATCH_HTML,function(u){return _ENCODE_HTML_RULES[u]||u})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<div class="panel panel-primary">\n  <div class="panel-heading">\n    '),__output.push(t("orderStatuses","PANEL:TITLE:details")),__output.push('\n  </div>\n  <div class="panel-details">\n    <div class="props first">\n      <div class="prop">\n        <div class="prop-name">'),__output.push(t("orderStatuses","PROPERTY:_id")),__output.push('</div>\n        <div class="prop-value">'),__output.push(escape(model._id)),__output.push('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__output.push(t("orderStatuses","PROPERTY:label")),__output.push('</div>\n        <div class="prop-value">'),__output.push(escape(model.label||"-")),__output.push('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__output.push(t("orderStatuses","PROPERTY:color")),__output.push('</div>\n        <div class="prop-value"><span class="label" style="background-color: '),__output.push(model.color),__output.push('">'),__output.push(model.color),__output.push("</span></div>\n      </div>\n    </div>\n  </div>\n</div>\n");return __output.join("")}});