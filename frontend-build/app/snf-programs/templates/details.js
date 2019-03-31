define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(p){return void 0==p?"":String(p).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(p){return _ENCODE_HTML_RULES[p]||p}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="panel panel-primary snf-programs-details">\n  <div class="panel-heading">'),__append(panelTitle),__append('</div>\n  <div class="panel-details row">\n    <div class="col-md-3">\n      <div class="props first">\n        <div class="prop">\n          <div class="prop-name">'),__append(helpers.t("PROPERTY:name")),__append('</div>\n          <div class="prop-value">'),__append(escapeFn(model.name)),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(helpers.t("PROPERTY:kind")),__append('</div>\n          <div class="prop-value">'),__append(helpers.t("kind:"+model.kind)),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(helpers.t("PROPERTY:lightSourceType")),__append('</div>\n          <div class="prop-value">'),__append(helpers.t("lightSourceType:"+model.lightSourceType)),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(helpers.t("PROPERTY:bulbPower")),__append('</div>\n          <div class="prop-value">'),__append(helpers.t("bulbPower:"+model.bulbPower)),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(helpers.t("PROPERTY:ballast")),__append('</div>\n          <div class="prop-value">'),__append(helpers.t("ballast:"+model.ballast)),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(helpers.t("PROPERTY:ignitron")),__append('</div>\n          <div class="prop-value">'),__append(helpers.t("ignitron:"+model.ignitron)),__append('</div>\n        </div>\n      </div>\n    </div>\n    <div class="col-md-4">\n      <div class="props">\n        <div class="prop">\n          <div class="prop-name">'),__append(helpers.t("PROPERTY:waitForStartTime")),__append('</div>\n          <div class="prop-value">'),__append(time.toString(model.waitForStartTime)),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(helpers.t("PROPERTY:illuminationTime")),__append('</div>\n          <div class="prop-value">'),__append(time.toString(model.illuminationTime)),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(helpers.t("PROPERTY:hrsInterval")),__append('</div>\n          <div class="prop-value">'),__append("hrs"===model.kind?time.toString(model.hrsInterval):"-"),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(helpers.t("PROPERTY:hrsTime")),__append('</div>\n          <div class="prop-value">'),__append("hrs"===model.kind?time.toString(model.hrsTime):"-"),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(helpers.t("PROPERTY:hrsCount")),__append('</div>\n          <div class="prop-value">'),__append("hrs"===model.kind?model.hrsCount:"-"),__append('</div>\n        </div>\n      </div>\n    </div>\n    <div class="col-md-5">\n      <div class="props">\n        <div class="prop">\n          <div class="prop-name">'),__append(helpers.t("PROPERTY:limitSwitch")),__append('</div>\n          <div class="prop-value">'),__append(t("core","BOOL:"+model.limitSwitch)),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(helpers.t("PROPERTY:lampBulb")),__append('</div>\n          <div class="prop-value">'),__append(t("core","BOOL:"+model.lampBulb)),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(helpers.t("PROPERTY:lightSensors")),__append('</div>\n          <div class="prop-value">'),__append(t("core","BOOL:"+model.lightSensors)),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(helpers.t("PROPERTY:lampCount")),__append('</div>\n          <div class="prop-value">'),__append(helpers.t("lampCount:"+model.lampCount)),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(helpers.t("PROPERTY:interlock")),__append('</div>\n          <div class="prop-value">'),__append(helpers.t("interlock:"+model.interlock)),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(helpers.t("PROPERTY:contactors")),__append('</div>\n          <div class="prop-value">\n            '),contactors.forEach(function(p){__append("\n            "),model[p]&&(__append('\n            <span class="label label-'),__append(model[p]?"success":"danger"),__append('">'),__append(helpers.t("PROPERTY:"+p)),__append("</span>\n            ")),__append("\n            ")}),__append('\n          </div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(helpers.t("PROPERTY:currentBoundries")),__append('</div>\n          <div class="prop-value">\n          '),0===model.minCurrent&&0===model.maxCurrent?(__append("\n          "),__append(helpers.t("current:noBoundries")),__append("\n          ")):(__append("\n          "),__append(helpers.t("current:boundries",{min:model.minCurrent,max:model.maxCurrent})),__append("\n          ")),__append("\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n");return __output.join("")}});