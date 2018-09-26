define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form id="'),__append(idPrefix),__append('-vendorPrintDialog" autocomplete="off">\n  <div class="row">\n    <div class="col-md-4 form-group">\n      <label for="'),__append(idPrefix),__append('-printer" class="control-label">'),__append(t("purchaseOrders","PROPERTY:print.printer")),__append('</label>\n      <select id="'),__append(idPrefix),__append('-printer" class="form-control" name="printer" required autofocus>\n        '),printers.forEach(function(n){__append('\n        <option value="'),__append(escapeFn(n)),__append('">'),__append(escapeFn(n)),__append("</option>\n        ")}),__append('\n      </select>\n    </div>\n    <div class="col-md-8 form-group">\n      <label for="'),__append(idPrefix),__append('-labelType" class="control-label">'),__append(t("purchaseOrders","vendorPrintDialog:labelType")),__append('</label>\n      <select id="'),__append(idPrefix),__append('-labelType" class="form-control" name="labelType">\n        '),labelTypes.forEach(function(n){__append('\n          <option value="'),__append(n.id),__append('">'),__append(escapeFn(n.text)),__append("</option>\n        ")}),__append('\n      </select>\n    </div>\n  </div>\n  <div class="form-group pos-printDialog-items-group">\n    <div class="table-responsive">\n      <table class="table pos-printDialog-items">\n        <thead>\n          <tr>\n            <th>'),__append(t("purchaseOrders","PROPERTY:item._id")),__append("</th>\n            <th>"),__append(t("purchaseOrders","PROPERTY:item.nc12")),__append("</th>\n            <th>"),__append(t("purchaseOrders","vendorPrintDialog:labelCount")),__append("</th>\n            <th>"),__append(t("vendorNc12s","PROPERTY:value")),__append("</th>\n            <th>"),__append(t("vendorNc12s","PROPERTY:unit")),__append("</th>\n          </tr>\n        </thead>\n        <tbody>\n          "),items.forEach(function(n,e){__append('\n          <tr class="pos-printDialog-items-item">\n            <td>\n              '),__append(n._id),__append('\n              <input name="items['),__append(e),__append(']._id" type="hidden" value="'),__append(n._id),__append('">\n            </td>\n            <td>\n              '),__append(n.nc12),__append('\n              <input name="items['),__append(e),__append('].nc12" type="hidden" value="'),__append(n.nc12),__append('">\n            </td>\n            <td><input class="form-control no-controls pos-printDialog-qty" name="items['),__append(e),__append('].labelCount" type="text" autocomplete="new-password" max="9999999"></td>\n            <td><input class="form-control" name="items['),__append(e),__append('].value" type="text" autocomplete="new-password" ></td>\n            <td><input class="form-control" name="items['),__append(e),__append('].unit" type="text" autocomplete="new-password"></td>\n          </tr>\n          ')}),__append('\n        </tbody>\n      </table>\n    </div>\n  </div>\n  <div class="form-actions">\n    <button type="submit" class="btn btn-primary"><i class="fa fa-print"></i><span>'),__append(t("purchaseOrders","printDialog:print")),__append('</span></button>\n    <button type="button" class="cancel btn btn-link">'),__append(t("core","ACTION_FORM:BUTTON:cancel")),__append("</button>\n  </div>\n</form>\n");return __output.join("")}});