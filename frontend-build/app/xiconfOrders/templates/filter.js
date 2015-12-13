define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escape=escape||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="well filter-form xiconfOrders-filter">\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-from">'),__append(t("core","filter:date:from")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-from" class="form-control" name="from" type="date" placeholder="YYYY-MM-DD">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-to">'),__append(t("core","filter:date:to")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-to" class="form-control" name="to" type="date" placeholder="YYYY-MM-DD">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-orderNo">'),__append(t("xiconf","PROPERTY:no")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-orderNo" class="form-control" name="orderNo" type="text" maxlength="9" pattern="^[0-9]+$">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-nc12">'),__append(t("xiconf","PROPERTY:nc12")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-nc12" class="form-control" name="nc12" type="text" maxlength="12">\n  </div>\n  <div class="form-group">\n    <label>'),__append(t("xiconfOrders","PROPERTY:status")),__append('</label>\n    <div id="'),__append(idPrefix),__append('-status" class="btn-group filter-btn-group" data-toggle="buttons">\n      '),[[-1,"danger"],[0,"success"],[1,"warning"]].forEach(function(n){__append('\n      <label class="btn btn-'),__append(n[1]),__append('">\n        <input type="checkbox" name="status[]" value="'),__append(n[0]),__append('"> '),__append(t("xiconfOrders","status:"+n[0])),__append("\n      </label>\n      ")}),__append("\n    </div>\n  </div>\n  "),__append(renderLimit()),__append('\n  <div class="form-group filter-actions">\n    <button type="submit" class="btn btn-default"><i class="fa fa-filter"></i><span>'),__append(escape(t("xiconfOrders","filter:submit"))),__append("</span></button>\n  </div>\n</form>\n");return __output.join("")}});