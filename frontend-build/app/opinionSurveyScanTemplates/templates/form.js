define(["underscore","jquery","app/i18n","app/time","app/user","app/core/util/forms"],function(_,$,t,time,user,forms){return function anonymous(locals,escapeFn,include,rethrow){escapeFn=escapeFn||function(e){return void 0==e?"":String(e).replace(_MATCH_HTML,encode_char)};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g;function encode_char(e){return _ENCODE_HTML_RULES[e]||e}var __output=[],__append=__output.push.bind(__output);with(locals||{})__append('<form class="opinionSurveyScanTemplates-form" method="post" action="'),__append(formAction),__append('">\n  <input type="hidden" name="_method" value="'),__append(formMethod),__append('">\n  <div class="panel panel-primary">\n    <div class="panel-heading">'),__append(panelTitleText),__append('</div>\n    <div class="panel-body">\n      <div class="form-group has-required-select2">\n        <label for="'),__append(idPrefix),__append('-survey" class="control-label is-required">'),__append(helpers.t("PROPERTY:survey")),__append('</label>\n        <input id="'),__append(idPrefix),__append('-survey" name="survey" type="text" autocomplete="new-password" required>\n      </div>\n      <div class="row">\n        <div class="col-md-2 form-group">\n          <label for="'),__append(idPrefix),__append('-pageNumber" class="control-label is-required">'),__append(helpers.t("PROPERTY:pageNumber")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-pageNumber" name="pageNumber" class="form-control" type="number" required min="1" max="10">\n        </div>\n        <div class="col-md-10 form-group">\n          <label for="'),__append(idPrefix),__append('-name" class="control-label is-required">'),__append(helpers.t("PROPERTY:name")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-name" name="name" class="form-control" type="text" autocomplete="new-password" required>\n        </div>\n      </div>\n      <div class="row">\n        <div class="col-md-4 form-group">\n          <label for="'),__append(idPrefix),__append('-dp" class="control-label is-required">'),__append(helpers.t("PROPERTY:dp")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-dp" name="dp" class="form-control" type="number" required min="0.1" max="2" step="0.1">\n          <p class="help-block">'),__append(helpers.t("form:help:dp")),__append('</p>\n        </div>\n        <div class="col-md-4 form-group">\n          <label for="'),__append(idPrefix),__append('-cannyThreshold" class="control-label is-required">'),__append(helpers.t("PROPERTY:cannyThreshold")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-cannyThreshold" name="cannyThreshold" class="form-control" type="number" required min="1" step="1">\n          <p class="help-block">'),__append(helpers.t("form:help:cannyThreshold")),__append('</p>\n        </div>\n        <div class="col-md-4 form-group">\n          <label for="'),__append(idPrefix),__append('-circleAccumulatorThreshold" class="control-label is-required">'),__append(helpers.t("PROPERTY:circleAccumulatorThreshold")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-circleAccumulatorThreshold" name="circleAccumulatorThreshold" class="form-control" type="number" required min="1" step="1">\n          <p class="help-block">'),__append(helpers.t("form:help:circleAccumulatorThreshold")),__append('</p>\n        </div>\n      </div>\n      <div class="row">\n        <div class="col-md-4 form-group">\n          <label for="'),__append(idPrefix),__append('-minimumRadius" class="control-label is-required">'),__append(helpers.t("PROPERTY:minimumRadius")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-minimumRadius" name="minimumRadius" class="form-control" type="number" required min="1" step="1">\n          <p class="help-block">'),__append(helpers.t("form:help:minimumRadius")),__append('</p>\n        </div>\n        <div class="col-md-4 form-group">\n          <label for="'),__append(idPrefix),__append('-maximumRadius" class="control-label is-required">'),__append(helpers.t("PROPERTY:maximumRadius")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-maximumRadius" name="maximumRadius" class="form-control" type="number" required min="1" step="1">\n          <p class="help-block">'),__append(helpers.t("form:help:maximumRadius")),__append('</p>\n        </div>\n        <div class="col-md-4 form-group">\n          <label for="'),__append(idPrefix),__append('-minimumDistance" class="control-label is-required">'),__append(helpers.t("PROPERTY:minimumDistance")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-minimumDistance" name="minimumDistance" class="form-control" type="number" required min="1" step="1">\n          <p class="help-block">'),__append(helpers.t("form:help:minimumDistance")),__append('</p>\n        </div>\n      </div>\n      <div class="row">\n        <div class="col-md-4 form-group">\n          <label for="'),__append(idPrefix),__append('-filledThreshold" class="control-label is-required">'),__append(helpers.t("PROPERTY:filledThreshold")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-filledThreshold" name="filledThreshold" class="form-control" type="number" required min="100" max="255" step="1">\n          <p class="help-block">'),__append(helpers.t("form:help:filledThreshold")),__append('</p>\n        </div>\n        <div class="col-md-4 form-group">\n          <label for="'),__append(idPrefix),__append('-markedThreshold" class="control-label is-required">'),__append(helpers.t("PROPERTY:markedThreshold")),__append('</label>\n          <input id="'),__append(idPrefix),__append('-markedThreshold" name="markedThreshold" class="form-control" type="number" required min="10" max="100" step="1">\n          <p class="help-block">'),__append(helpers.t("form:help:markedThreshold")),__append('</p>\n        </div>\n      </div>\n      <div id="'),__append(idPrefix),__append('-toolbar" class="opinionSurveyScanTemplates-toolbar">\n        <div id="'),__append(idPrefix),__append('-toolbar-inner" class="opinionSurveyScanTemplates-toolbar-inner">\n          <input data-role="noImageError" class="form-control opinionSurveyScanTemplates-toolbar-error" type="text" autocomplete="new-password" tabindex="-1" data-action="editImage">\n          <input data-role="noRegionsError" class="form-control opinionSurveyScanTemplates-toolbar-error" type="text" autocomplete="new-password" tabindex="-1" data-action="createRegion">\n          <button data-action="editImage" type="button" class="btn btn-default"><i class="fa fa-image"></i><span>'),__append(helpers.t("toolbar:editImage")),__append('</span></button>\x3c!--\n          //--\x3e<button data-action="createRegion" type="button" class="btn btn-default"><i class="fa fa-dot-circle-o"></i><span>'),__append(helpers.t("toolbar:createRegion")),__append('</span></button>\x3c!--\n          //--\x3e<button data-action="measureDiameter" type="button" class="btn btn-default"><i class="fa fa-text-height"></i><span>'),__append(helpers.t("toolbar:measureDiameter")),__append("</span></button>\x3c!--\n          //--\x3e<span>"),__append(helpers.t("toolbar:measuredValue")),__append(' <span id="'),__append(idPrefix),__append('-measuredValue">0</span>px</span>\n        </div>\n      </div>\n      <div id="'),__append(idPrefix),__append('-container" class="opinionSurveyScanTemplates-page-container dragscroll">\n        <div class="opinionSurveyScanTemplates-page-wrapper">\n          <div id="'),__append(idPrefix),__append('-page" class="opinionSurveyScanTemplates-page">\n            <img id="'),__append(idPrefix),__append('-image" class="opinionSurveyScanTemplates-page-image" src="'),__append(image.src),__append('" width="'),__append(image.width),__append('" height="'),__append(image.height),__append('" data-id="'),__append(image.id),__append('">\n            <div id="'),__append(idPrefix),__append('-overlay" class="opinionSurveyScanTemplates-page-overlay"></div>\n            <div id="'),__append(idPrefix),__append('-line" class="opinionSurveyScanTemplates-page-line" style="display: none"></div>\n            <div id="'),__append(idPrefix),__append('-region" class="opinionSurveyScanTemplates-page-region" style="display: none"></div>\n            '),regions.forEach(function(e){__append("\n            "),__append(renderRegion(e)),__append("\n            ")}),__append('\n          </div>\n        </div>\n      </div>\n    </div>\n    <div class="panel-footer">\n      <button type="submit" class="btn btn-primary">'),__append(formActionText),__append("</button>\n    </div>\n  </div>\n</form>\n");return __output.join("")}});