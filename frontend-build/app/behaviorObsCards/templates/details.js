define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(e){return _ENCODE_HTML_RULES[e]||e}escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="behaviorObsCards-details">\n  <div class="panel panel-info behaviorObsCards-details-props">\n    <div class="panel-heading">\n      '),__append(t("behaviorObsCards","PANEL:TITLE:details")),__append('\n    </div>\n    <div class="panel-details">\n      <div class="row">\n        <div class="col-md-4">\n          <div class="props first">\n            <div class="prop">\n              <div class="prop-name">'),__append(t("behaviorObsCards","PROPERTY:section")),__append('</div>\n              <div class="prop-value">'),__append(escapeFn(model.section)),__append('</div>\n            </div>\n            <div class="prop">\n              <div class="prop-name">'),__append(t("behaviorObsCards","PROPERTY:line")),__append('</div>\n              <div class="prop-value">'),__append(escapeFn(model.line||"-")),__append('</div>\n            </div>\n            <div class="prop">\n              <div class="prop-name">'),__append(t("behaviorObsCards","PROPERTY:position")),__append('</div>\n              <div class="prop-value">'),__append(escapeFn(model.position||"-")),__append('</div>\n            </div>\n          </div>\n        </div>\n        <div class="col-md-4">\n          <div class="props">\n            <div class="prop">\n              <div class="prop-name">'),__append(t("behaviorObsCards","PROPERTY:observer")),__append('</div>\n              <div class="prop-value">'),__append(model.observer),__append('</div>\n            </div>\n            <div class="prop">\n              <div class="prop-name">'),__append(t("behaviorObsCards","PROPERTY:superior")),__append('</div>\n              <div class="prop-value">'),__append(model.superior),__append('</div>\n            </div>\n            <div class="prop">\n              <div class="prop-name">'),__append(t("behaviorObsCards","PROPERTY:creator")),__append('</div>\n              <div class="prop-value">'),__append(model.creator),__append('</div>\n            </div>\n            <div class="prop">\n              <div class="prop-name">'),__append(t("behaviorObsCards","PROPERTY:updater")),__append('</div>\n              <div class="prop-value">'),__append(model.updater),__append('</div>\n            </div>\n          </div>\n        </div>\n        <div class="col-md-4">\n          <div class="props">\n            <div class="prop">\n              <div class="prop-name">'),__append(t("behaviorObsCards","PROPERTY:date")),__append('</div>\n              <div class="prop-value">'),__append(model.date),__append('</div>\n            </div>\n            <div class="prop">\n              <div class="prop-name">'),__append(t("behaviorObsCards","PROPERTY:createdAt")),__append('</div>\n              <div class="prop-value">'),__append(model.createdAt),__append('</div>\n            </div>\n            <div class="prop">\n              <div class="prop-name">'),__append(t("behaviorObsCards","PROPERTY:updatedAt")),__append('</div>\n              <div class="prop-value">'),__append(model.updatedAt),__append("</div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n  "),model.observations.length&&(__append("\n  "),function(){__append('<div class="panel panel-default">\n  <div class="panel-heading">'),__append(t("behaviorObsCards","PANEL:TITLE:observations")),__append('</div>\n  <table class="table table-bordered table-hover behaviorObsCards-details-observations">\n    <thead>\n    <tr>\n      <th class="is-min">'),__append(t("behaviorObsCards","PROPERTY:observations:category")),__append('</th>\n      <th class="is-min text-center">\n        '),__append(t("behaviorObsCards","PROPERTY:observations:safe:true")),__append("\n        /<br>\n        "),__append(t("behaviorObsCards","PROPERTY:observations:safe:false")),__append("\n      </th>\n      <th>"),__append(t("behaviorObsCards","PROPERTY:observations:observation")),__append("</th>\n      <th>"),__append(t("behaviorObsCards","PROPERTY:observations:cause")),__append('</th>\n      <th class="is-min text-center">\n        '),__append(t("behaviorObsCards","PROPERTY:observations:easy:true")),__append("\n        /<br>\n        "),__append(t("behaviorObsCards","PROPERTY:observations:easy:false")),__append("\n      </th>\n    </tr>\n    </thead>\n    <tbody>\n    "),model.observations.forEach(function(e){__append('\n    <tr>\n      <td class="is-min">'),__append(escapeFn(e.behavior)),__append('</td>\n      <td class="is-min text-center">'),__append(t("behaviorObsCards","PROPERTY:observations:safe:"+e.safe)),__append('</td>\n      <td class="text-lines">'),__append(escapeFn(e.safe?"":e.observation)),__append('</td>\n      <td class="text-lines">'),__append(escapeFn(e.safe?"":e.cause)),__append('</td>\n      <td class="is-min text-center">'),__append(e.safe?"":t("behaviorObsCards","PROPERTY:observations:easy:"+e.easy)),__append("</td>\n    </tr>\n    ")}),__append("\n    </tbody>\n  </table>\n</div>\n")}.call(this),__append("\n  ")),__append("\n  "),(model.risks.length||model.nearMiss)&&(__append("\n  "),function(){__append('<div class="panel panel-danger">\n  <div class="panel-heading is-with-actions">\n    '),__append(t("behaviorObsCards","PANEL:TITLE:risks")),__append("\n    "),model.nearMiss&&(__append('\n    <div class="panel-actions">\n      <p>'),__append(t("behaviorObsCards","PANEL:ACTION:nearMiss")),__append(' <a href="#kaizenOrders/'),__append(model.nearMiss),__append('">#'),__append(model.nearMiss),__append("</a></p>\n    </div>\n    ")),__append('\n  </div>\n  <table class="table table-bordered table-hover behaviorObsCards-details-risks">\n    '),model.risks.length&&(__append("\n    <thead>\n    <tr>\n      <th>"),__append(t("behaviorObsCards","PROPERTY:risks:risk")),__append("</th>\n      <th>"),__append(t("behaviorObsCards","PROPERTY:risks:cause")),__append('</th>\n      <th class="is-min text-center">\n        '),__append(t("behaviorObsCards","PROPERTY:risks:easy:true")),__append("\n        /<br>\n        "),__append(t("behaviorObsCards","PROPERTY:risks:easy:false")),__append("\n      </th>\n    </tr>\n    </thead>\n    ")),__append("\n    <tbody>\n    "),model.risks.length||(__append('\n    <tr>\n      <td colspan="3">'),__append(t("core","LIST:NO_DATA")),__append("</td>\n    </tr>\n    ")),__append("\n    "),model.risks.forEach(function(e){__append('\n    <tr>\n      <td class="text-lines">'),__append(escapeFn(e.risk)),__append('</td>\n      <td class="text-lines">'),__append(escapeFn(e.cause)),__append('</td>\n      <td class="is-min text-center">'),__append(t("behaviorObsCards","PROPERTY:risks:easy:"+e.easy)),__append("</td>\n    </tr>\n    ")}),__append("\n    </tbody>\n  </table>\n</div>\n")}.call(this),__append("\n  ")),__append("\n  "),showEasyDiscussed&&(__append('\n  <p class="message message-inline message-'),__append(model.easyDiscussed?"info":"default"),__append('">\n    <i class="fa fa-thumbs-'),__append(model.easyDiscussed?"up":"down"),__append('"></i> '),__append(t("behaviorObsCards","PROPERTY:easyDiscussed")),__append("\n  </p>\n  ")),__append("\n  "),(model.difficulties.length||model.suggestion)&&(__append("\n  "),function(){__append('<div class="panel panel-warning">\n  <div class="panel-heading is-with-actions">\n    '),__append(t("behaviorObsCards","PANEL:TITLE:difficulties")),__append("\n    "),model.suggestion&&(__append('\n    <div class="panel-actions">\n      <p>'),__append(t("behaviorObsCards","PANEL:ACTION:suggestion")),__append(' <a href="#suggestions/'),__append(model.suggestion),__append('">#'),__append(model.suggestion),__append("</a></p>\n    </div>\n    ")),__append('\n  </div>\n  <table class="table table-bordered table-hover behaviorObsCards-details-difficulties">\n    '),model.difficulties.length&&(__append("\n    <thead>\n    <tr>\n      <th>"),__append(t("behaviorObsCards","PROPERTY:difficulties:problem")),__append("</th>\n      <th>"),__append(t("behaviorObsCards","PROPERTY:difficulties:solution")),__append('</th>\n      <th class="is-min text-center">\n        '),__append(t("behaviorObsCards","PROPERTY:difficulties:behavior:true")),__append("\n        /<br>\n        "),__append(t("behaviorObsCards","PROPERTY:difficulties:behavior:false")),__append("\n      </th>\n    </tr>\n    </thead>\n    ")),__append("\n    <tbody>\n    "),model.difficulties.length||(__append('\n    <tr>\n      <td colspan="3">'),__append(t("core","LIST:NO_DATA")),__append("</td>\n    </tr>\n    ")),__append("\n    "),model.difficulties.forEach(function(e){__append('\n    <tr>\n      <td class="text-lines">'),__append(escapeFn(e.problem)),__append('</td>\n      <td class="text-lines">'),__append(escapeFn(e.solution)),__append('</td>\n      <td class="is-min text-center">'),__append(t("behaviorObsCards","PROPERTY:difficulties:behavior:"+e.behavior)),__append("</td>\n    </tr>\n    ")}),__append("\n    </tbody>\n  </table>\n</div>\n")}.call(this),__append("\n  ")),__append("\n</div>\n");return __output.join("")}});