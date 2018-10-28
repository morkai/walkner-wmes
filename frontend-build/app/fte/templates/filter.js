define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="well filter-form">\n  <div class="orgUnitDropdowns-container"></div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-from">'),__append(t("core","filter:date:from")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-from" class="form-control" name="from" type="date">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-to">'),__append(t("core","filter:date:to")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-to" class="form-control" name="to" type="date">\n  </div>\n  <div class="form-group">\n    <label>'),__append(t("core","filter:shift")),__append('</label>\n    <div id="'),__append(idPrefix),__append('-shift" class="btn-group filter-btn-group" data-toggle="buttons">\n      '),[0,1,2,3].forEach(function(n){__append('\n      <label class="btn btn-default">\n        <input type="radio" name="shift" value="'),__append(n),__append('"> '),__append(t("core","SHIFT:"+n)),__append("\n      </label>\n      ")}),__append("\n    </div>\n  </div>\n  "),__append(renderLimit()),__append('\n  <div class="form-group filter-actions">\n    <button type="submit" class="btn btn-default"><i class="fa fa-filter"></i><span>'),__append(escapeFn(t("fte","filter:submit"))),__append("</span></button>\n  </div>\n</form>\n");return __output.join("")}});