define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,function(t){return _ENCODE_HTML_RULES[t]||t})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<form class="well filter-form">\n  <div class="form-group">\n    <label for="'),__output.push(idPrefix),__output.push('-from">'),__output.push(t("core","filter:date:from")),__output.push('</label>\n    <input id="'),__output.push(idPrefix),__output.push('-from" class="form-control" name="from" type="date" placeholder="YYYY-MM-DD">\n  </div>\n  <div class="form-group">\n    <label for="'),__output.push(idPrefix),__output.push('-to">'),__output.push(t("core","filter:date:to")),__output.push('</label>\n    <input id="'),__output.push(idPrefix),__output.push('-to" class="form-control" name="to" type="date" placeholder="YYYY-MM-DD">\n  </div>\n  <div class="form-group">\n    <label for="'),__output.push(idPrefix),__output.push('-shift-any">'),__output.push(t("prodShiftOrders","PROPERTY:shift")),__output.push('</label>\n    <div class="filter-radio-group">\n      '),[0,1,2,3].forEach(function(u){__output.push('\n      <label class="radio-inline">\n        <input id="'),__output.push(idPrefix),__output.push("-shift-"),__output.push(u),__output.push('" name="shift" type="radio" value="'),__output.push(u),__output.push('">\n        '),__output.push(t("core","SHIFT:"+u)),__output.push("\n      </label>\n      ")}),__output.push('\n    </div>\n  </div>\n  <div class="form-group">\n    <label for="'),__output.push(idPrefix),__output.push('-orderId">'),__output.push(t("prodShiftOrders","filter:orderId")),__output.push('</label>\n    <input id="'),__output.push(idPrefix),__output.push('-orderId" class="form-control prodShiftOrders-filter-orderId" name="orderId" type="text" placeholder="'),__output.push(t("prodShiftOrders","filter:placeholder:orderId")),__output.push('">\n  </div>\n  <div class="form-group">\n    <label for="'),__output.push(idPrefix),__output.push('-operationNo">'),__output.push(t("prodShiftOrders","filter:operationNo")),__output.push('</label>\n    <input id="'),__output.push(idPrefix),__output.push('-operationNo" class="form-control prodShiftOrders-filter-operationNo" name="operationNo" type="text" placeholder="'),__output.push(t("prodShiftOrders","filter:placeholder:operationNo")),__output.push('" maxlength="4" pattern="[0-9]+">\n  </div>\n  <div class="form-group">\n    <label for="'),__output.push(idPrefix),__output.push('-prodLine">'),__output.push(t("prodShiftOrders","PROPERTY:prodLine")),__output.push('</label>\n    <input id="'),__output.push(idPrefix),__output.push('-prodLine" name="prodLine" type="text" data-placeholder="'),__output.push(t("prodShiftOrders","filter:placeholder:prodLine")),__output.push('">\n  </div>\n  '),__output.push(renderLimit()),__output.push('\n  <div class="form-group filter-actions">\n    <button type="submit" class="btn btn-default"><i class="fa fa-filter"></i><span>'),__output.push(escape(t("prodShiftOrders","filter:submit"))),__output.push("</span></button>\n  </div>\n</form>\n");return __output.join("")}});