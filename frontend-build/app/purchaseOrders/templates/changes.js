define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="panel panel-default pos-changes">\n  <div class="panel-heading">'),__append(t("purchaseOrders","panel:changes")),__append('</div>\n  <table class="table table-bordered table-hover">\n    <thead>\n      <tr>\n        <th>'),__append(t("purchaseOrders","PROPERTY:changes.date")),__append("</th>\n        <th>"),__append(t("purchaseOrders","PROPERTY:changes.property")),__append("</th>\n        <th>"),__append(t("purchaseOrders","PROPERTY:changes.oldValue")),__append("</th>\n        <th>"),__append(t("purchaseOrders","PROPERTY:changes.newValue")),__append("</th>\n      </tr>\n    </thead>\n    <tbody>\n      "),changes.forEach(function(e,n){__append("\n      "),hidden&&1===n&&changes.length>3&&(__append('\n      <tr>\n        <td id="'),__append(idPrefix),__append('-more" colspan="999" class="pos-changes-more">'),__append(t("purchaseOrders","changes:more")),__append("</td>\n      </tr>\n      ")),__append('\n      <tr class="'),__append(e.visible?"":"hidden"),__append('">\n        <td colspan="999" class="pos-rowSeparator"></td>\n      </tr>\n      <tr class="pos-changes-change '),__append(e.visible?"":"hidden"),__append('">\n        <td rowspan="'),__append(e.properties.length),__append('">'),__append(e.date),__append("</td>\n        <td>"),__append(e.properties[0].name),__append("</td>\n        <td>"),__append(e.properties[0].oldValue),__append('</td>\n        <td class="pos-changes-change-value" data-property="'),__append(e.properties[0].key),__append('">'),__append(e.properties[0].newValue),__append("</td>\n      </tr>\n      "),e.properties.forEach(function(n,p){__append("\n      "),0!==p&&(__append('\n      <tr class="pos-changes-change-next '),__append(e.visible?"":"hidden"),__append('">\n        <td>'),__append(n.name),__append("</td>\n        <td>"),__append(n.oldValue),__append('</td>\n        <td class="pos-changes-change-value" data-property="'),__append(n.key),__append('">'),__append(n.newValue),__append("</td>\n      </tr>\n      "))}),__append("\n      ")}),__append("\n    </tbody>\n  </table>\n</div>\n");return __output.join("")}});