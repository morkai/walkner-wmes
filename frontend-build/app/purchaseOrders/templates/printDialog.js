define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(p){return void 0==p?"":String(p).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(p){return _ENCODE_HTML_RULES[p]||p}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form id="'),__append(idPrefix),__append('-printDialog" autocomplete="off" action="'),__append(escapeFn(action)),__append('">\n  <div class="row">\n    <div class="col-md-3 form-group">\n      <label for="'),__append(idPrefix),__append('-shippingNo">'),__append(helpers.t("PROPERTY:print.shippingNo")),__append('</label>\n      <input id="'),__append(idPrefix),__append('-shippingNo" name="shippingNo" class="form-control pos-printDialog-input" type="text" autocomplete="new-password" maxlength="20" autofocus pattern="[a-zA-Z0-9\\/\\\\\\.\\-_: ]{0,20}">\n    </div>\n    <div class="col-md-3 form-group">\n      <label for="'),__append(idPrefix),__append('-printer" class="control-label">'),__append(helpers.t("PROPERTY:print.printer")),__append('</label>\n      <select id="'),__append(idPrefix),__append('-printer" class="form-control" name="printer">\n        <option value="browser">'),__append(helpers.t("printer:browser")),__append("</option>\n        "),printers.forEach(function(p){__append('\n        <option value="'),__append(escapeFn(p)),__append('">'),__append(escapeFn(p)),__append("</option>\n        ")}),__append('\n      </select>\n    </div>\n    <div class="col-md-3 form-group">\n      <label for="'),__append(idPrefix),__append('-paper" class="control-label">'),__append(helpers.t("PROPERTY:print.paper")),__append('</label>\n      <select id="'),__append(idPrefix),__append('-paper" class="form-control" name="paper">\n        '),paperGroups.forEach(function(p){__append('\n        <optgroup label="'),__append(escapeFn(p.label)),__append('">\n          '),p.papers.forEach(function(p){__append('\n          <option value="'),__append(p.id),__append('">'),__append(escapeFn(p.text)),__append("</option>\n          ")}),__append("\n        </optgroup>\n        ")}),__append('\n      </select>\n    </div>\n    <div class="col-md-3 form-group">\n      <label for="'),__append(idPrefix),__append('-barcode" class="control-label">'),__append(helpers.t("PROPERTY:print.barcode")),__append('</label>\n      <select id="'),__append(idPrefix),__append('-barcode" class="form-control" name="barcode">\n        '),barcodes.forEach(function(p){__append('\n        <option value="'),__append(p.id),__append('">'),__append(p.text),__append("</option>\n        ")}),__append('\n      </select>\n    </div>\n  </div>\n  <div class="form-group pos-printDialog-items-group">\n    <div class="table-responsive">\n      <table class="table pos-printDialog-items">\n        <thead>\n          <tr>\n            <th>'),__append(helpers.t("PROPERTY:item._id")),__append("</th>\n            <th>"),__append(helpers.t("PROPERTY:item.nc12")),__append("</th>\n            <th>"),__append(helpers.t("PROPERTY:print.packageQty")),__append("</th>\n            <th>"),__append(helpers.t("PROPERTY:print.componentQty")),__append("</th>\n            <th>"),__append(helpers.t("PROPERTY:print.remainingQty")),__append("</th>\n            <th>"),__append(helpers.t("PROPERTY:print.totalPackageQty")),__append("</th>\n            <th>"),__append(helpers.t("PROPERTY:print.totalQty")),__append('</th>\n            <th></th>\n          </tr>\n        </thead>\n        <tfoot>\n          <tr>\n            <td colspan="2" class="pos-printDialog-items-total">'),__append(helpers.t("printDialog:total")),__append('</td>\n            <td id="'),__append(idPrefix),__append('-overallPackageQty">0</td>\n            <td id="'),__append(idPrefix),__append('-overallComponentQty">0</td>\n            <td id="'),__append(idPrefix),__append('-overallRemainingQty">0</td>\n            <td id="'),__append(idPrefix),__append('-overallTotalPackageQty">0</td>\n            <td id="'),__append(idPrefix),__append('-overallTotalQty">0</td>\n            <td></td>\n          </tr>\n        </tfoot>\n        <tbody>\n          '),items.forEach(function(p,n){__append('\n          <tr class="pos-printDialog-items-item">\n            <td>\n              '),__append(p._id),__append('\n              <input name="items['),__append(n),__append(']._id" type="hidden" value="'),__append(p._id),__append('">\n            </td>\n            <td>'),__append(p.nc12),__append('</td>\n            <td><input class="form-control no-controls pos-printDialog-qty" name="items['),__append(n),__append('].packageQty" type="text" autocomplete="new-password" max="999" data-integer></td>\n            <td><input class="form-control no-controls pos-printDialog-qty" name="items['),__append(n),__append('].componentQty" type="text" autocomplete="new-password" max="9999999"></td>\n            <td><input class="form-control no-controls pos-printDialog-qty" name="items['),__append(n),__append('].remainingQty" type="text" autocomplete="new-password" max="9999999"></td>\n            <td class="pos-printDialog-items-totalPackageQty">0</td>\n            <td class="pos-printDialog-items-totalQty">0</td>\n            <td></td>\n          </tr>\n          ')}),__append('\n        </tbody>\n      </table>\n    </div>\n  </div>\n  <div class="form-actions">\n    <button type="submit" class="btn btn-primary"><i class="fa fa-print"></i><span>'),__append(helpers.t("printDialog:print")),__append('</span></button>\n    <button type="button" class="cancel btn btn-link">'),__append(t("core","ACTION_FORM:BUTTON:cancel")),__append("</button>\n  </div>\n</form>\n");return __output.join("")}});