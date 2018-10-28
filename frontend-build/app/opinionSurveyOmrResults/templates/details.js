define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(p){return void 0==p?"":String(p).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(p){return _ENCODE_HTML_RULES[p]||p}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="opinionSurveyOmrResults-details">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(t("opinionSurveyOmrResults","PANEL:TITLE:details")),__append('</div>\n    <div class="panel-details">\n      <div class="props first">\n        <div class="prop">\n          <div class="prop-name">'),__append(t("opinionSurveyOmrResults","PROPERTY:status")),__append('</div>\n          <div class="prop-value">'),__append(model.status),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("opinionSurveyOmrResults","PROPERTY:survey")),__append('</div>\n          <div class="prop-value">\n            '),__append(escapeFn(model.survey)),__append('\n          </div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("opinionSurveyOmrResults","PROPERTY:pageNumber")),__append('</div>\n          <div class="prop-value">'),__append(model.pageNumber),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("opinionSurveyOmrResults","PROPERTY:inputFileName")),__append('</div>\n          <div class="prop-value">'),__append(escapeFn(model.inputDirName)),__append("\\"),__append(escapeFn(model.inputFileName)),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("opinionSurveyOmrResults","PROPERTY:startedAt")),__append('</div>\n          <div class="prop-value">'),__append(model.startedAt),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("opinionSurveyOmrResults","PROPERTY:finishedAt")),__append('</div>\n          <div class="prop-value">'),__append(model.finishedAt),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("opinionSurveyOmrResults","PROPERTY:duration")),__append('</div>\n          <div class="prop-value">'),__append(model.duration),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("opinionSurveyOmrResults","PROPERTY:scanTemplate")),__append('</div>\n          <div class="prop-value">\n            '),model.scanTemplate?(__append('\n            <a href="#opinionSurveyScanTemplates/'),__append(model.scanTemplate._id),__append('">'),__append(escapeFn(model.scanTemplate.name)),__append("</a>\n            ")):__append("\n            -\n            "),__append('\n          </div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("opinionSurveyOmrResults","PROPERTY:qrCode")),__append('</div>\n          <div class="prop-value">'),__append(escapeFn(model.qrCode||"-")),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("opinionSurveyOmrResults","PROPERTY:matchScore")),__append('</div>\n          <div class="prop-value">'),__append(model.matchScore),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("opinionSurveyOmrResults","PROPERTY:errorCode")),__append('</div>\n          <div class="prop-value">'),__append(escapeFn(model.errorCode||"-")),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("opinionSurveyOmrResults","PROPERTY:errorMessage")),__append('</div>\n          <div class="prop-value">'),__append(escapeFn(model.errorMessage||"-")),__append('</div>\n        </div>\n      </div>\n    </div>\n  </div>\n  <div class="opinionSurveyOmrResults-details-tabs">\n    <ul class="nav nav-tabs">\n      '),["omrPreview","omrInput","omrOutput","answers"].forEach(function(p){__append('\n      <li data-tab="'),__append(p),__append('"><a href="#'),__append(idPrefix),__append("-"),__append(p),__append('" data-toggle="tab">'),__append(t("opinionSurveyOmrResults","tabs:"+p)),__append("</a></li>\n      ")}),__append('\n    </ul>\n    <div class="tab-content">\n      <div class="tab-pane active opinionSurveyOmrResults-omrPreview-tab" id="'),__append(idPrefix),__append('-omrPreview">\n        <div class="opinionSurveyOmrResults-omrPreview-wrapper">\n          <img src="/opinionSurveys/omrResults/'),__append(model._id),__append('.jpg" width="1280" alt="">\n          '),circles.forEach(function(p){__append('\n          <div class="opinionSurveyOmrResults-omrPreview-circle '),__append(p.marked?"is-marked":""),__append('" style="top: '),__append(p.top),__append("px; left: "),__append(p.left),__append("px; width: "),__append(p.width),__append("px; height: "),__append(p.height),__append('px;"></div>\n          ')}),__append('\n        </div>\n      </div>\n      <div class="tab-pane" id="'),__append(idPrefix),__append('-omrInput">\n        '),model.omrInput?(__append("\n        <pre>"),__append(escapeFn(JSON.stringify(model.omrInput,null,2))),__append("</pre>\n        ")):__append("\n        -\n        "),__append('\n      </div>\n      <div class="tab-pane" id="'),__append(idPrefix),__append('-omrOutput">\n        '),model.omrOutput?(__append("\n        <pre>"),__append(escapeFn(JSON.stringify(model.omrOutput,null,2))),__append("</pre>\n        ")):__append("\n        -\n        "),__append('\n      </div>\n      <div class="tab-pane" id="'),__append(idPrefix),__append('-answers">\n        '),model.answers?(__append("\n        <pre>"),__append(escapeFn(JSON.stringify(model.answers,null,2))),__append("</pre>\n        ")):__append("\n        -\n        "),__append("\n      </div>\n    </div>\n  </div>\n</div>\n");return __output.join("")}});