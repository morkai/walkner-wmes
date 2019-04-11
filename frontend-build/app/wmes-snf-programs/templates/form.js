define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="snf-programs-form" method="post" action="'),__append(formAction),__append('" autocomplete="off">\n  <input type="hidden" name="_method" value="'),__append(formMethod),__append('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(panelTitleText),__append('</div>\n    <div class="panel-body">\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-name" class="control-label">'),__append(helpers.t("PROPERTY:name")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-name" class="form-control" type="text" name="name" required autofocus maxlength="150">\n      </div>\n      <div class="form-group">\n        <label for="'),__append(idPrefix),__append('-kind" class="control-label">'),__append(helpers.t("PROPERTY:kind")),__append('</label>\n        <select id="'),__append(idPrefix),__append('-kind" name="kind">\n          '),kinds.forEach(function(e){__append('\n          <option value="'),__append(e),__append('">'),__append(helpers.t("kind:"+e)),__append("</option>\n          ")}),__append('\n        </select>\n      </div>\n      <div class="row snf-programs-form-choices">\n        <div class="col-md-3 form-group">\n          <label for="'),__append(idPrefix),__append('-lightSourceType" class="control-label">'),__append(helpers.t("PROPERTY:lightSourceType")),__append('</label>\n          <select id="'),__append(idPrefix),__append('-lightSourceType" name="lightSourceType">\n            '),lightSourceTypes.forEach(function(e){__append('\n            <option value="'),__append(e),__append('">'),__append(helpers.t("lightSourceType:"+e)),__append("</option>\n            ")}),__append('\n          </select>\n        </div>\n        <div class="col-md-3 form-group">\n          <label for="'),__append(idPrefix),__append('-bulbPower" class="control-label">'),__append(helpers.t("PROPERTY:bulbPower")),__append('</label>\n          <select id="'),__append(idPrefix),__append('-bulbPower" name="bulbPower">\n            '),bulbPowers.forEach(function(e){__append('\n            <option value="'),__append(e),__append('">'),__append(helpers.t("bulbPower:"+e)),__append("</option>\n            ")}),__append('\n          </select>\n        </div>\n        <div class="col-md-3 form-group">\n          <label for="'),__append(idPrefix),__append('-ballast" class="control-label">'),__append(helpers.t("PROPERTY:ballast")),__append('</label>\n          <select id="'),__append(idPrefix),__append('-ballast" name="ballast">\n            '),ballasts.forEach(function(e){__append('\n            <option value="'),__append(e),__append('">'),__append(helpers.t("ballast:"+e)),__append("</option>\n            ")}),__append('\n          </select>\n        </div>\n        <div class="col-md-3 form-group">\n          <label for="'),__append(idPrefix),__append('-ignitron" class="control-label">'),__append(helpers.t("PROPERTY:ignitron")),__append('</label>\n          <select id="'),__append(idPrefix),__append('-ignitron" name="ignitron">\n            '),ignitrons.forEach(function(e){__append('\n            <option value="'),__append(e),__append('">'),__append(helpers.t("ignitron:"+e)),__append("</option>\n            ")}),__append('\n          </select>\n        </div>\n      </div>\n      <div class="row">\n        <div class="col-md-6 form-group">\n          <label for="'),__append(idPrefix),__append('-waitForStartTime" class="control-label">'),__append(helpers.t("PROPERTY:waitForStartTime")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-waitForStartTime" class="form-control snf-programs-form-time" type="text" name="waitForStartTime" required>\n        </div>\n        <div class="col-md-6 form-group">\n          <label for="'),__append(idPrefix),__append('-illuminationTime" class="control-label">'),__append(helpers.t("PROPERTY:illuminationTime")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-illuminationTime" class="form-control snf-programs-form-time" type="text" name="illuminationTime">\n        </div>\n      </div>\n      <div id="'),__append(idPrefix),__append('-hrs" class="row">\n        <div class="col-md-4 form-group">\n          <label for="'),__append(idPrefix),__append('-hrsInterval" class="control-label">'),__append(helpers.t("PROPERTY:hrsInterval")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-hrsInterval" class="form-control snf-programs-form-time" type="text" name="hrsInterval" required>\n        </div>\n        <div class="col-md-4 form-group">\n          <label for="'),__append(idPrefix),__append('-hrsTime" class="control-label">'),__append(helpers.t("PROPERTY:hrsTime")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-hrsTime" class="form-control snf-programs-form-time" type="text" name="hrsTime">\n        </div>\n        <div class="col-md-4 form-group">\n          <label for="'),__append(idPrefix),__append('-hrsCount" class="control-label">'),__append(helpers.t("PROPERTY:hrsCount")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-hrsCount" class="form-control" type="number" name="hrsCount">\n        </div>\n      </div>\n      <div class="row">\n        <div class="col-md-4">\n          <div class="form-group">\n            <div class="checkbox">\n              <label><input id="'),__append(idPrefix),__append('-limitSwitch" type="checkbox" name="limitSwitch" value="true"> '),__append(helpers.t("PROPERTY:limitSwitch")),__append('</label>\n            </div>\n            <div class="checkbox">\n              <label><input id="'),__append(idPrefix),__append('-lampBulb" type="checkbox" name="lampBulb" value="true"> '),__append(helpers.t("PROPERTY:lampBulb")),__append('</label>\n            </div>\n            <div class="checkbox">\n              <label><input id="'),__append(idPrefix),__append('-lightSensors" type="checkbox" name="lightSensors" value="true"> '),__append(helpers.t("PROPERTY:lightSensors")),__append('</label>\n            </div>\n          </div>\n          <div class="form-group">\n            <label for="'),__append(idPrefix),__append('-lampCount" class="control-label">'),__append(helpers.t("PROPERTY:lampCount")),__append('</label>\n            <div class="radio">\n              <label><input id="'),__append(idPrefix),__append('-lampCount" type="radio" name="lampCount" value="1"> '),__append(helpers.t("lampCount:1")),__append('</label>\n            </div>\n            <div class="radio">\n              <label><input type="radio" name="lampCount" value="2"> '),__append(helpers.t("lampCount:2")),__append('</label>\n            </div>\n            <div class="radio">\n              <label><input type="radio" name="lampCount" value="3"> '),__append(helpers.t("lampCount:3")),__append('</label>\n            </div>\n          </div>\n          <div class="form-group form-group-last">\n            <label for="'),__append(idPrefix),__append('-interlock" class="control-label">'),__append(helpers.t("PROPERTY:interlock")),__append('</label>\n            <div class="radio">\n              <label><input id="'),__append(idPrefix),__append('-interlock" type="radio" name="interlock" value="1"> '),__append(helpers.t("interlock:1")),__append('</label>\n            </div>\n            <div class="radio">\n              <label><input id="'),__append(idPrefix),__append('-interlock" type="radio" name="interlock" value="1+2"> '),__append(helpers.t("interlock:1+2")),__append('</label>\n            </div>\n            <div class="radio">\n              <label><input id="'),__append(idPrefix),__append('-interlock" type="radio" name="interlock" value="mnh"> '),__append(helpers.t("interlock:mnh")),__append('</label>\n            </div>\n          </div>\n        </div>\n        <div class="col-md-4 form-group">\n          <label class="control-label">'),__append(helpers.t("PROPERTY:contactors")),__append("</label>\n          "),contactors.forEach(function(e){__append('\n          <div class="checkbox">\n            <label><input type="checkbox" name="'),__append(e),__append('"> '),__append(helpers.t("PROPERTY:"+e)),__append("</label>\n          </div>\n          ")}),__append('\n        </div>\n        <div class="col-md-4">\n          <div class="row">\n            <div class="col-md-6 form-group">\n              <label for="'),__append(idPrefix),__append('-minCurrent" class="control-label">'),__append(helpers.t("PROPERTY:minCurrent")),__append('</label>\n              <input id="'),__append(idPrefix),__append('-minCurrent" class="form-control" type="number" name="minCurrent" min="0" max="100">\n            </div>\n            <div class="col-md-6 form-group">\n              <label for="'),__append(idPrefix),__append('-maxCurrent" class="control-label">'),__append(helpers.t("PROPERTY:maxCurrent")),__append('</label>\n              <input id="'),__append(idPrefix),__append('-maxCurrent" class="form-control" type="number" name="maxCurrent" min="0" max="100">\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n    <div class="panel-footer">\n      <button type="submit" class="btn btn-primary">'),__append(formActionText),__append("</button>\n    </div>\n  </div>\n</form>\n");return __output.join("")}});