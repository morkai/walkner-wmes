define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="panel panel-primary">\n  <div class="panel-heading">\n    '),__append(t("prodFlows","PANEL:TITLE:details")),__append('\n  </div>\n  <div class="panel-details">\n    <div class="props first">\n      <div class="prop">\n        <div class="prop-name">'),__append(t("prodFlows","PROPERTY:subdivision")),__append('</div>\n        <div class="prop-value">'),__append(subdivision),__append('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(t("prodFlows","PROPERTY:mrpControllers")),__append('</div>\n        <div class="prop-value">\n          '),mrpControllers.length?(__append("\n          <ul>\n            "),mrpControllers.forEach(function(n){__append('\n            <li><a href="'),__append(n.href),__append('">'),__append(escapeFn(n.label)),__append("</a></li>\n            ")}),__append("\n          </ul>\n          ")):__append("\n          -\n          "),__append('\n        </div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(t("prodFlows","PROPERTY:name")),__append('</div>\n        <div class="prop-value">'),__append(escapeFn(name||"-")),__append('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__append(t("prodFlows","PROPERTY:deactivatedAt")),__append('</div>\n        <div class="prop-value">'),__append(escapeFn(deactivatedAt)),__append("</div>\n      </div>\n    </div>\n  </div>\n</div>\n");return __output.join("")}});