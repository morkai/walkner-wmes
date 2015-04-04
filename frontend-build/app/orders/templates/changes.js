define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,function(t){return _ENCODE_HTML_RULES[t]||t})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<div class="panel panel-default orders-changes">\n  <div class="panel-heading">\n    '),__output.push(t("orders","PANEL:TITLE:changes")),__output.push("\n  </div>\n  "),changes.length?(__output.push('\n  <table class="table table-condensed">\n    <thead>\n      <tr>\n        <th>'),__output.push(t("orders","CHANGES:time")),__output.push("\n        <th>"),__output.push(t("orders","CHANGES:property")),__output.push("\n        <th>"),__output.push(t("orders","CHANGES:oldValue")),__output.push("\n        <th>"),__output.push(t("orders","CHANGES:newValue")),__output.push("\n      </tr>\n    </thead>\n    "),changes.length>5&&__output.push('\n    <tfoot>\n      <tr>\n        <td class="orders-changes-more" colspan="4">Pokaż starsze zmiany...</td>\n      </tr>\n    </tfoot>\n    '),__output.push("\n    "),changes.forEach(function(u,p){__output.push("\n    "),p%5===0&&(__output.push('\n    <tbody class="orders-changes-page '),__output.push(p?"hidden":""),__output.push('">\n    ')),__output.push('\n      <tr>\n        <td rowspan="'),__output.push(u.values.length),__output.push('">'),__output.push(u.timeText),__output.push('</td>\n        <td class="orders-changes-property">'),__output.push(escape(t("orders","PROPERTY:"+u.values[0].property))),__output.push("</td>\n        <td>"),__output.push(renderValueChange(u.values[0],p,"oldValue")),__output.push("</td>\n        <td>"),__output.push(renderValueChange(u.values[0],p,"newValue")),__output.push("</td>\n      </tr>\n      "),u.values.forEach(function(u,n){__output.push("\n      "),0!==n&&(__output.push('\n      <tr>\n        <td class="orders-changes-property">'),__output.push(escape(t("orders","PROPERTY:"+u.property))),__output.push("</td>\n        <td>"),__output.push(renderValueChange(u,p,"oldValue")),__output.push("</td>\n        <td>"),__output.push(renderValueChange(u,p,"newValue")),__output.push("</td>\n      </tr>\n      "))}),__output.push("\n    ")}),__output.push("\n  </table>\n  ")):(__output.push('\n  <div class="panel-body">\n    '),__output.push(t("orders","CHANGES:NO_DATA")),__output.push("\n  </div>\n  ")),__output.push("\n</div>\n");return __output.join("")}});