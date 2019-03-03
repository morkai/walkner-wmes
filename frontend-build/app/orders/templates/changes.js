define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="'),__append(showPanel?"panel panel-default":""),__append(" orders-changes "),__append(noSystemChanges?"orders-no-system-changes":""),__append('">\n  '),showPanel&&(__append('\n  <div class="panel-heading is-with-actions">\n    '),__append(t("orders","PANEL:TITLE:changes")),__append('\n    <div class="panel-actions">\n      <button id="'),__append(idPrefix),__append('-toggleSystemChanges" class="btn btn-default '),__append(noSystemChanges?"active":""),__append('" type="button">'),__append(t("orders","CHANGES:toggleSystemChanges")),__append("</button>\n    </div>\n  </div>\n  ")),__append('\n  <div class="list">\n    <div class="table-responsive">\n      <table id="'),__append(idPrefix),__append('-table" class="table table-condensed table-bordered table-hover">\n        <thead>\n          <tr>\n            <th class="is-min">'),__append(t("orders","CHANGES:time")),__append('\n            <th class="is-min">'),__append(t("orders","CHANGES:user")),__append('\n            <th class="is-min">'),__append(t("orders","CHANGES:property")),__append('\n            <th class="is-min">'),__append(t("orders","CHANGES:oldValue")),__append("\n            <th>"),__append(t("orders","CHANGES:newValue")),__append("\n          </tr>\n        </thead>\n        "),canComment&&__append('\n        <tfoot>\n          <tr>\n            <td class="orders-commentForm-container" colspan="5"></td>\n          </tr>\n        </tfoot>\n        '),__append("\n        "),changes.length||(__append('\n        <tbody id="'),__append(idPrefix),__append('-empty">\n          <tr>\n            <td colspan="5">'),__append(t("orders","CHANGES:NO_DATA")),__append("</td>\n          </tr>\n        </tbody>\n        ")),__append("\n        "),changes.forEach(function(n,e){__append("\n        "),__append(renderChange({renderPropertyLabel,renderValueChange,change:n,i:e})),__append("\n        ")}),__append("\n      </table>\n    </div>\n  </div>\n</div>\n");return __output.join("")}});