define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form id="'),__append(idPrefix),__append('-form" class="well filter-form">\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-_id">'),__append(t("emptyOrders","PROPERTY:_id")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-_id" class="form-control orders-filter-_id" name="_id" type="text" minlength="4" maxlength="10" placeholder="'),__append(t("emptyOrders","filter:placeholder:_id")),__append('">\n  </div>\n  <div class="form-group form-group-dateRange">\n    <div>\n      <label class="radio-inline">\n        <input name="date" type="radio" value="startDate">\n        '),__append(t("emptyOrders","PROPERTY:startDate")),__append('\n      </label><label class="radio-inline">\n        <input name="date" type="radio" value="finishDate">\n        '),__append(t("emptyOrders","PROPERTY:finishDate")),__append('\n      </label>\n    </div>\n    <div>\n      <label for="'),__append(idPrefix),__append('-from">'),__append(t("core","filter:date:from")),__append('</label>\n      <input id="'),__append(idPrefix),__append('-from" class="form-control" name="from" type="date" placeholder="YYYY-MM-DD">\n      <label for="'),__append(idPrefix),__append('-to" class="control-label">'),__append(t("core","filter:date:to")),__append('</label>\n      <input id="'),__append(idPrefix),__append('-to" class="form-control" name="to" type="date" placeholder="YYYY-MM-DD">\n    </div>\n  </div>\n  '),__append(renderLimit()),__append('\n  <div class="form-group filter-actions">\n    <button type="submit" class="btn btn-default"><i class="fa fa-filter"></i><span>'),__append(t("emptyOrders","filter:submit")),__append("</span></button>\n  </div>\n</form>");return __output.join("")}});