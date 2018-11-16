define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(n){return _ENCODE_HTML_RULES[n]||n}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="well filter-form">\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-_id">'),__append(t("paintShopPaints","PROPERTY:_id")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-_id" class="form-control" name="_id" type="text" autocomplete="new-password" maxlength="12" style="width: 110px">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-shelf">'),__append(t("paintShopPaints","PROPERTY:shelf")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-shelf" class="form-control" name="shelf" type="text" autocomplete="new-password" style="width: 75px">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-bin">'),__append(t("paintShopPaints","PROPERTY:bin")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-bin" class="form-control" name="bin" type="text" autocomplete="new-password" style="width: 75px">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-name">'),__append(t("paintShopPaints","PROPERTY:name")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-name" class="form-control" name="name" type="text" autocomplete="new-password">\n  </div>\n  '),__append(renderLimit()),__append('\n  <div class="form-group filter-actions">\n    <button type="submit" class="btn btn-default"><i class="fa fa-filter"></i><span>'),__append(escapeFn(t("paintShopPaints","filter:submit"))),__append("</span></button>\n  </div>\n</form>\n");return __output.join("")}});