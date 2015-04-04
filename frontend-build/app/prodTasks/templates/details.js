define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(p){return void 0==p?"":String(p).replace(_MATCH_HTML,function(p){return _ENCODE_HTML_RULES[p]||p})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<div class="panel panel-primary">\n  <div class="panel-heading">\n    '),__output.push(t("prodTasks","PANEL:TITLE:details")),__output.push('\n  </div>\n  <div class="panel-details">\n    <div class="props first">\n      <div class="prop">\n        <div class="prop-name">'),__output.push(t("prodTasks","PROPERTY:name")),__output.push('</div>\n        <div class="prop-value">'),__output.push(escape(model.name)),__output.push('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__output.push(t("prodTasks","PROPERTY:parent")),__output.push('</div>\n        <div class="prop-value">'),__output.push(escape(model.parent?model.parent.name:"-")),__output.push('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__output.push(t("prodTasks","PROPERTY:tags")),__output.push('</div>\n        <div class="prop-value">'),__output.push(escape(model.tags.length?model.tags.join(", "):"-")),__output.push('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__output.push(t("prodTasks","PROPERTY:fteDiv")),__output.push('</div>\n        <div class="prop-value">'),__output.push(escape(t("core","BOOL:"+model.fteDiv))),__output.push('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__output.push(t("prodTasks","PROPERTY:inProd")),__output.push('</div>\n        <div class="prop-value">'),__output.push(escape(t("core","BOOL:"+model.inProd))),__output.push('</div>\n      </div>\n      <div class="prop">\n        <div class="prop-name">'),__output.push(t("prodTasks","PROPERTY:clipColor")),__output.push('</div>\n        <div class="prop-value">\n          '),model.clipColor?(__output.push('\n          <span class="label" style="background: '),__output.push(model.clipColor),__output.push('">'),__output.push(model.clipColor),__output.push("</span>\n          ")):__output.push("\n          -\n          "),__output.push("\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n");return __output.join("")}});