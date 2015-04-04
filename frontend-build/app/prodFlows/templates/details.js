define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(p){return void 0==p?"":String(p).replace(_MATCH_HTML,function(p){return _ENCODE_HTML_RULES[p]||p})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<div class="panel panel-primary">\n  <div class="panel-heading">\n    '),__output.push(t("prodFlows","PANEL:TITLE:details")),__output.push('\n  </div>\n  <div class="panel-details">\n    <div class="props first">\n      <div class="prop">\n        <div class="prop-name">'),__output.push(t("prodFlows","PROPERTY:subdivision")),__output.push('</div>\n        <div class="prop-value">'),__output.push(subdivision),__output.push('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__output.push(t("prodFlows","PROPERTY:mrpControllers")),__output.push('</div>\n        <div class="prop-value">\n          '),mrpControllers.length?(__output.push("\n          <ul>\n            "),mrpControllers.forEach(function(p){__output.push('\n            <li><a href="'),__output.push(p.href),__output.push('">'),__output.push(escape(p.label)),__output.push("</a></li>\n            ")}),__output.push("\n          </ul>\n          ")):__output.push("\n          -\n          "),__output.push('\n        </div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__output.push(t("prodFlows","PROPERTY:name")),__output.push('</div>\n        <div class="prop-value">'),__output.push(escape(name||"-")),__output.push('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__output.push(t("prodFlows","PROPERTY:deactivatedAt")),__output.push('</div>\n        <div class="prop-value">'),__output.push(escape(deactivatedAt)),__output.push("</div>\n      </div>\n    </div>\n  </div>\n</div>\n");return __output.join("")}});