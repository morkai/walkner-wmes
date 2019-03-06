define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="'),__append(showPanel?"panel panel-default":""),__append(" orders-changes "),__append(noSystemChanges?"orders-no-system-changes":""),__append('">\n  '),showPanel&&(__append('\n  <div class="panel-heading is-with-actions">\n    '),__append(helpers.t("PANEL:TITLE:changes")),__append('\n    <div class="panel-actions">\n      <button id="'),__append(idPrefix),__append('-toggleSystemChanges" class="btn btn-default '),__append(noSystemChanges?"active":""),__append('" type="button">'),__append(helpers.t("CHANGES:toggleSystemChanges")),__append("</button>\n    </div>\n  </div>\n  ")),__append('\n  <div class="list">\n    <div class="table-responsive">\n      <table id="'),__append(idPrefix),__append('-table" class="table table-condensed table-bordered table-hover">\n        <thead>\n          <tr>\n            <th class="is-min">'),__append(helpers.t("CHANGES:time")),__append('\n            <th class="is-min">'),__append(helpers.t("CHANGES:user")),__append('\n            <th class="is-min">'),__append(helpers.t("CHANGES:property")),__append('\n            <th class="is-min">'),__append(helpers.t("CHANGES:oldValue")),__append("\n            <th>"),__append(helpers.t("CHANGES:newValue")),__append("\n          </tr>\n        </thead>\n        "),canComment&&__append('\n        <tfoot>\n          <tr>\n            <td class="orders-commentForm-container" colspan="5"></td>\n          </tr>\n        </tfoot>\n        '),__append("\n        "),changes.length||(__append('\n        <tbody id="'),__append(idPrefix),__append('-empty">\n          <tr>\n            <td colspan="5">'),__append(helpers.t("CHANGES:NO_DATA")),__append("</td>\n          </tr>\n        </tbody>\n        ")),__append("\n        "),changes.forEach(function(e,n){__append("\n        "),__append(renderChange({renderPropertyLabel,renderValueChange,change:e,i:n})),__append("\n        ")}),__append("\n      </table>\n    </div>\n  </div>\n</div>\n");return __output.join("")}});