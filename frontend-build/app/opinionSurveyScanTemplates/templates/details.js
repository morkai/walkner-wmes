define(["app/i18n"],function(t){return function anonymous(locals,escapeFn,include,rethrow){function encode_char(n){return _ENCODE_HTML_RULES[n]||n}escapeFn=escapeFn||function(n){return void 0==n?"":String(n).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[],__append=__output.push.bind(__output);with(locals||{})__append('<div class="opinionSurveyScanTemplates-details">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(t("opinionSurveyScanTemplates","PANEL:TITLE:details")),__append('</div>\n    <div class="panel-details">\n      <div class="props first">\n        <div class="prop">\n          <div class="prop-name">'),__append(t("opinionSurveyScanTemplates","PROPERTY:survey")),__append('</div>\n          <div class="prop-value">'),__append(escapeFn(model.survey)),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("opinionSurveyScanTemplates","PROPERTY:pageNumber")),__append('</div>\n          <div class="prop-value">'),__append(model.pageNumber),__append('</div>\n        </div>\n        <div class="prop">\n          <div class="prop-name">'),__append(t("opinionSurveyScanTemplates","PROPERTY:name")),__append('</div>\n          <div class="prop-value">'),__append(escapeFn(model.name)),__append('</div>\n        </div>\n      </div>\n    </div>\n  </div>\n  <div class="panel panel-default">\n    <div class="panel-heading">'),__append(t("opinionSurveyScanTemplates","PANEL:TITLE:params")),__append('</div>\n    <div class="panel-details">\n      <div class="row">\n        <div class="col-md-4">\n          <div class="props first">\n            <div class="prop">\n              <div class="prop-name">'),__append(t("opinionSurveyScanTemplates","PROPERTY:dp")),__append('</div>\n              <div class="prop-value">'),__append(model.dp.toLocaleString()),__append('</div>\n            </div>\n            <div class="prop">\n              <div class="prop-name">'),__append(t("opinionSurveyScanTemplates","PROPERTY:cannyThreshold")),__append('</div>\n              <div class="prop-value">'),__append(model.cannyThreshold),__append('</div>\n            </div>\n            <div class="prop">\n              <div class="prop-name">'),__append(t("opinionSurveyScanTemplates","PROPERTY:circleAccumulatorThreshold")),__append('</div>\n              <div class="prop-value">'),__append(escapeFn(model.circleAccumulatorThreshold)),__append('</div>\n            </div>\n          </div>\n        </div>\n        <div class="col-md-4">\n          <div class="props">\n            <div class="prop">\n              <div class="prop-name">'),__append(t("opinionSurveyScanTemplates","PROPERTY:minimumRadius")),__append('</div>\n              <div class="prop-value">'),__append(escapeFn(model.minimumRadius)),__append('</div>\n            </div>\n            <div class="prop">\n              <div class="prop-name">'),__append(t("opinionSurveyScanTemplates","PROPERTY:maximumRadius")),__append('</div>\n              <div class="prop-value">'),__append(escapeFn(model.maximumRadius)),__append('</div>\n            </div>\n            <div class="prop">\n              <div class="prop-name">'),__append(t("opinionSurveyScanTemplates","PROPERTY:minimumDistance")),__append('</div>\n              <div class="prop-value">'),__append(escapeFn(model.minimumDistance)),__append('</div>\n            </div>\n          </div>\n        </div>\n        <div class="col-md-4">\n          <div class="props">\n            <div class="prop">\n              <div class="prop-name">'),__append(t("opinionSurveyScanTemplates","PROPERTY:filledThreshold")),__append('</div>\n              <div class="prop-value">'),__append(escapeFn(model.filledThreshold)),__append('</div>\n            </div>\n            <div class="prop">\n              <div class="prop-name">'),__append(t("opinionSurveyScanTemplates","PROPERTY:markedThreshold")),__append('</div>\n              <div class="prop-value">'),__append(escapeFn(model.markedThreshold)),__append('</div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n  <div class="opinionSurveyScanTemplates-page-container">\n    <div class="opinionSurveyScanTemplates-page-wrapper">\n      <div class="opinionSurveyScanTemplates-page">\n        <img class="opinionSurveyScanTemplates-page-image" src="/opinionSurveys/scanTemplates/'),__append(model.image),__append('.jpg" width="'),__append(model.width),__append('" height="'),__append(model.height),__append('">\n        '),regions.forEach(function(n){__append("\n        "),__append(renderRegion(n)),__append("\n        ")}),__append("\n      </div>\n    </div>\n  </div>\n</div>\n");return __output.join("")}});