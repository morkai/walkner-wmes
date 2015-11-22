define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(u){return void 0==u?"":String(u).replace(_MATCH_HTML,function(u){return _ENCODE_HTML_RULES[u]||u})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<div class="col-md-'),__output.push(kaizenColumnSize),__output.push('">\n  <div class="panel panel-success">\n    <div class="panel-heading">'),__output.push(t("suggestions","type:kaizen")),__output.push('</div>\n    <div class="panel-details '),__output.push(model.changed.all?"is-changed":""),__output.push('">\n      <div class="props first">\n        <div class="prop">\n          <div class="prop-name '),__output.push(model.changed.kaizenOwners?"is-changed":""),__output.push('">'),__output.push(t("suggestions","PROPERTY:kaizenOwners")),__output.push('</div>\n          <div class="prop-value">\n            '),model.kaizenOwners.length?(__output.push("\n            <ul>\n              "),model.kaizenOwners.forEach(function(u){__output.push("\n              <li>"),__output.push(u),__output.push("</li>\n              ")}),__output.push("\n            </ul>\n            ")):__output.push("\n            -\n            "),__output.push('\n          </div>\n        </div>\n        <div class="prop">\n          <div class="prop-name '),__output.push(model.changed.kaizenStartDate?"is-changed":""),__output.push('">'),__output.push(t("suggestions","PROPERTY:kaizenStartDate")),__output.push('</div>\n          <div class="prop-value">'),__output.push(model.kaizenStartDate||"-"),__output.push('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name '),__output.push(model.changed.kaizenFinishDate?"is-changed":""),__output.push('">'),__output.push(t("suggestions","PROPERTY:kaizenFinishDate")),__output.push('</div>\n          <div class="prop-value">'),__output.push(model.kaizenFinishDate||"-"),__output.push('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name '),__output.push(model.changed.kaizenStartDate||model.changed.kaizenFinishDate?"is-changed":""),__output.push('">'),__output.push(t("suggestions","PROPERTY:kaizenDuration")),__output.push('</div>\n          <div class="prop-value">'),__output.push(model.kaizenDuration||"-"),__output.push('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name '),__output.push(model.changed.kaizenFinishDate?"is-changed":""),__output.push('">'),__output.push(t("suggestions","PROPERTY:finishDuration")),__output.push('</div>\n          <div class="prop-value">'),__output.push(model.finishDuration||"-"),__output.push('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name '),__output.push(model.changed.kaizenImprovements?"is-changed":""),__output.push('">'),__output.push(t("suggestions","PROPERTY:kaizenImprovements")),__output.push('</div>\n          <div class="prop-value text-lines">'),__output.push(escape(model.kaizenImprovements||"-")),__output.push('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name '),__output.push(model.changed.kaizenEffect?"is-changed":""),__output.push('">'),__output.push(t("suggestions","PROPERTY:kaizenEffect")),__output.push('</div>\n          <div class="prop-value text-lines">'),__output.push(escape(model.kaizenEffect||"-")),__output.push("</div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n");return __output.join("")}});