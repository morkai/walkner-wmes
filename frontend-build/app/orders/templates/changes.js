define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="'),__append(showPanel?"panel panel-default":""),__append(' orders-changes">\n  '),showPanel&&(__append('\n  <div class="panel-heading">\n    '),__append(t("orders","PANEL:TITLE:changes")),__append("\n  </div>\n  ")),__append('\n  <table id="'),__append(idPrefix),__append('-table" class="table table-condensed table-bordered table-hover">\n    <thead>\n      <tr>\n        <th class="is-min">'),__append(t("orders","CHANGES:time")),__append('\n        <th class="is-min">'),__append(t("orders","CHANGES:user")),__append('\n        <th class="is-min">'),__append(t("orders","CHANGES:property")),__append('\n        <th class="is-min">'),__append(t("orders","CHANGES:oldValue")),__append("\n        <th>"),__append(t("orders","CHANGES:newValue")),__append("\n      </tr>\n    </thead>\n    "),canComment&&__append('\n    <tfoot>\n      <tr>\n        <td class="orders-commentForm-container" colspan="5"></td>\n      </tr>\n    </tfoot>\n    '),__append("\n    "),changes.length||(__append('\n    <tbody id="'),__append(idPrefix),__append('-empty">\n      <tr>\n        <td colspan="5">'),__append(t("orders","CHANGES:NO_DATA")),__append("</td>\n      </tr>\n    </tbody>\n    ")),__append("\n    "),changes.forEach(function(n,e){__append("\n    "),__append(renderChange({renderPropertyLabel:renderPropertyLabel,renderValueChange:renderValueChange,change:n,i:e})),__append("\n    ")}),__append("\n  </table>\n</div>\n");return __output.join("")}});