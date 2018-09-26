define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="well filter-form">\n  '),user.data.vendor||(__append('\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-vendor" class="control-label">'),__append(t("purchaseOrders","filter:vendor")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-vendor" type="text" autocomplete="new-password" name="vendor">\n  </div>\n  ')),__append('\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-from">'),__append(t("purchaseOrders","filter:from")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-from" class="form-control" name="from" type="date" placeholder="YYYY-MM-DD">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-to">'),__append(t("purchaseOrders","filter:to")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-to" class="form-control" name="to" type="date" placeholder="YYYY-MM-DD">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-_id">'),__append(t("purchaseOrders","PROPERTY:_id")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-_id" class="form-control no-controls" name="_id" type="number" min="2" max="999999">\n  </div>\n  <div class="form-group">\n    <label for="'),__append(idPrefix),__append('-items-nc12">'),__append(t("purchaseOrders","PROPERTY:item.nc12")),__append('</label>\n    <input id="'),__append(idPrefix),__append('-items-nc12" class="form-control no-controls" name="items.nc12" type="number" min="1" max="999999999999">\n  </div>\n  <div class="form-group">\n    <label>'),__append(t("purchaseOrders","filter:status")),__append('</label>\n    <div id="'),__append(idPrefix),__append('-status" class="btn-group filter-btn-group" data-toggle="buttons">\n      '),["open","closed"].forEach(function(e){__append('\n      <label class="btn btn-default">\n        <input type="checkbox" name="status[]" value="'),__append(e),__append('"> '),__append(t("purchaseOrders","filter:status:"+e)),__append("\n      </label>\n      ")}),__append("\n    </div>\n  </div>\n  "),__append(renderLimit()),__append('\n  <div class="form-group filter-actions">\n    <button type="submit" class="btn btn-default"><i class="fa fa-filter"></i><span>'),__append(escapeFn(t("purchaseOrders","filter:submit"))),__append("</span></button>\n  </div>\n</form>\n");return __output.join("")}});