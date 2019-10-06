define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="toolcal-tools-form" method="post" action="'),__append(formAction),__append('" autocomplete="off">\n  <input type="hidden" name="_method" value="'),__append(formMethod),__append('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(panelTitleText),__append('</div>\n    <div class="panel-body">\n      <div id="'),__append(idPrefix),__append('-statusGroup" class="form-group clearfix">\n        <label for="'),__append(idPrefix),__append('-status" class="control-label">'),__append(helpers.t("PROPERTY:status")),__append('</label>\n        <br>\n        <div id="'),__append(idPrefix),__append('-status" class="btn-group" data-toggle="buttons">\n          '),statuses.forEach(function(e){__append('\n          <label class="btn btn-default">\n            <input type="radio" name="status" value="'),__append(e),__append('">'),__append(helpers.t("status:"+e)),__append("\n          </label>\n          ")}),__append('\n        </div>\n      </div>\n      <div class="row">\n        <div class="col-lg-3 form-group has-required-select2">\n          <label for="'),__append(idPrefix),__append('-type" class="control-label is-required">'),__append(helpers.t("PROPERTY:type")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-type" type="text" name="type" required>\n        </div>\n      </div>\n      <div class="row">\n        <div class="col-lg-3 form-group">\n          <label for="'),__append(idPrefix),__append('-name" class="control-label is-required">'),__append(helpers.t("PROPERTY:name")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-name" class="form-control" type="text" name="name" required maxlength="100">\n        </div>\n      </div>\n      <div class="row">\n        <div class="col-lg-3 form-group">\n          <label for="'),__append(idPrefix),__append('-sn" class="control-label">'),__append(helpers.t("PROPERTY:sn")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-sn" class="form-control" type="text" name="sn">\n        </div>\n      </div>\n      <div style="display: flex">\n        <div class="form-group">\n          <label for="'),__append(idPrefix),__append('-interval" class="control-label is-required">'),__append(helpers.t("PROPERTY:interval")),__append('</label>\n          <div style="display: flex">\n            <input id="'),__append(idPrefix),__append('-interval" class="form-control" type="number" name="interval" min="1" max="9999" required style="width: 70px">\n            <select id="'),__append(idPrefix),__append('-intervalUnit" class="form-control" name="intervalUnit" required style="margin-left: -1px">\n              '),["day","week","month","year"].forEach(function(e){__append('\n                <option value="'),__append(e),__append('">'),__append(helpers.t("interval:unit:"+e)),__append("</option>\n              ")}),__append('\n            </select>\n          </div>\n        </div>\n        <div class="form-group" style="margin-left: 15px">\n          <label for="'),__append(idPrefix),__append('-lastDate" class="control-label is-required">'),__append(helpers.t("PROPERTY:lastDate")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-lastDate" class="form-control" type="date" name="lastDate" required min="2000-01-01" max="'),__append(time.getMoment().add(7,"days").format("YYYY-MM-DD")),__append('">\n        </div>\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-individualUsers" class="control-label">'),__append(helpers.t("PROPERTY:individualUsers")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-individualUsers" type="text" name="individualUsers">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-currentUsers" class="control-label">'),__append(helpers.t("PROPERTY:currentUsers")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-currentUsers" type="text" name="currentUsers">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-certificateFile" class="control-label">'),__append(t("PROPERTY:certificateFile")),__append('</label>\n        <table>\n          <tbody>\n          <tr>\n            <td class="is-min" style="padding: 0 10px 5px 0">'),__append(t("FORM:attachment:old")),__append('</td>\n            <td style="padding-bottom: 5px">\n              '),model.certificateFile?(__append('\n              <a href="/toolcal/attachments/'),__append(model._id),__append('/certificate" target="_blank">'),__append(escapeFn(model.certificateFile.name)),__append("</a>\n              ")):(__append("\n              "),__append(t("FORM:attachment:empty")),__append("\n              ")),__append('\n            </td>\n          </tr>\n          <tr>\n            <td class="is-min" style="padding-right: 10px">'),__append(t("FORM:attachment:new")),__append('</td>\n            <td><input id="'),__append(idPrefix),__append('-certificateFile" name="certificateFile" class="form-control" type="file"></td>\n          </tr>\n          </tbody>\n        </table>\n        '),model.certificateFile&&(__append('\n        <p class="help-block">'),__append(t("FORM:attachment:help")),__append("</p>\n        ")),__append("\n      </div>\n      "),editMode&&(__append('\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-comment" class="control-label">'),__append(helpers.t("PROPERTY:comment")),__append('</label>\n        <textarea id="'),__append(idPrefix),__append('-comment" class="form-control" name="comment" rows="3"></textarea>\n      </div>\n      ')),__append('\n    </div>\n    <div class="panel-footer">\n      <button id="'),__append(idPrefix),__append('-submit" type="submit" class="btn btn-primary">'),__append(formActionText),__append("</button>\n    </div>\n  </div>\n</form>\n");return __output.join("")}});