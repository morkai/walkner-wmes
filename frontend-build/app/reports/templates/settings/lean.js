define(["app/i18n"],function(t){return function anonymous(locals,escape,include,rethrow){escape=escape||function(t){return void 0==t?"":String(t).replace(_MATCH_HTML,function(t){return _ENCODE_HTML_RULES[t]||t})};var _ENCODE_HTML_RULES={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&#34;","'":"&#39;"},_MATCH_HTML=/[&<>'"]/g,__output=[];with(locals||{})__output.push('<div class="panel-body" data-tab="lean">\n  <div class="form-group">\n    <label for="'),__output.push(idPrefix),__output.push('-lean-hoursCoeff">'),__output.push(t("reports","settings:lean:hoursCoeff")),__output.push('</label>\n    <input id="'),__output.push(idPrefix),__output.push('-lean-hoursCoeff" class="form-control" name="reports.lean.hoursCoeff" type="number" min="0" step="0.1">\n  </div>\n  <div class="form-group">\n    <label for="'),__output.push(idPrefix),__output.push('-lean-totalVolumeProducedProdFlows">'),__output.push(t("reports","settings:lean:totalVolumeProducedProdFlows")),__output.push('</label>\n    <input id="'),__output.push(idPrefix),__output.push('-lean-totalVolumeProducedProdFlows" name="reports.lean.totalVolumeProducedProdFlows" type="text">\n  </div>\n  <div class="form-group-horizontal">\n    <div class="form-group">\n      <label for="'),__output.push(idPrefix),__output.push('-lean-prodQualityInspectionSubdivision">'),__output.push(t("reports","settings:lean:prodQualityInspectionSubdivision")),__output.push('</label>\n      <input id="'),__output.push(idPrefix),__output.push('-lean-prodQualityInspectionSubdivision" name="reports.lean.prodQualityInspectionSubdivision" type="text">\n    </div>\n    <div class="form-group">\n      <label for="'),__output.push(idPrefix),__output.push('-lean-prodQualityInspectionPlan">'),__output.push(t("reports","settings:lean:prodQualityInspectionPlan")),__output.push('</label>\n      <input id="'),__output.push(idPrefix),__output.push('-lean-prodQualityInspectionPlan" class="form-control" name="reports.lean.prodQualityInspectionPlan" type="number" min="0" step="1">\n    </div>\n  </div>\n  <div class="form-group-horizontal">\n    <div class="form-group">\n      <label for="'),__output.push(idPrefix),__output.push('-lean-materialQualityInspectionSubdivision">'),__output.push(t("reports","settings:lean:materialQualityInspectionSubdivision")),__output.push('</label>\n      <input id="'),__output.push(idPrefix),__output.push('-lean-materialQualityInspectionSubdivision" name="reports.lean.materialQualityInspectionSubdivision" type="text">\n    </div>\n    <div class="form-group">\n      <label for="'),__output.push(idPrefix),__output.push('-lean-materialQualityInspectionPlan">'),__output.push(t("reports","settings:lean:materialQualityInspectionPlan")),__output.push('</label>\n      <input id="'),__output.push(idPrefix),__output.push('-lean-materialQualityInspectionPlan" class="form-control" name="reports.lean.materialQualityInspectionPlan" type="number" min="0" step="1">\n    </div>\n  </div>\n  <div class="form-group-horizontal">\n    <div class="form-group">\n      <label for="'),__output.push(idPrefix),__output.push('-lean-maintenanceSubdivision">'),__output.push(t("reports","settings:lean:maintenanceSubdivision")),__output.push('</label>\n      <input id="'),__output.push(idPrefix),__output.push('-lean-maintenanceSubdivision" name="reports.lean.maintenanceSubdivision" type="text">\n    </div>\n    <div class="form-group">\n      <label for="'),__output.push(idPrefix),__output.push('-lean-maintenancePlan">'),__output.push(t("reports","settings:lean:maintenancePlan")),__output.push('</label>\n      <input id="'),__output.push(idPrefix),__output.push('-lean-maintenancePlan" class="form-control" name="reports.lean.maintenancePlan" type="number" min="0" step="1">\n    </div>\n  </div>\n  <div class="form-group">\n    <label for="'),__output.push(idPrefix),__output.push('-lean-prodOperatorCoeff">'),__output.push(t("reports","settings:lean:prodOperatorCoeff")),__output.push('</label>\n    <input id="'),__output.push(idPrefix),__output.push('-lean-prodOperatorCoeff" class="form-control" name="reports.lean.prodOperatorCoeff" type="number" min="0" step="0.01">\n  </div>\n  <div class="form-group">\n    <label for="'),__output.push(idPrefix),__output.push('-lean-realProdSetterDowntimeReasons">'),__output.push(t("reports","settings:lean:realProdSetterDowntimeReasons")),__output.push('</label>\n    <input id="'),__output.push(idPrefix),__output.push('-lean-realProdSetterDowntimeReasons" name="reports.lean.realProdSetterDowntimeReasons" type="text">\n  </div>\n  <div class="form-group">\n    <label for="'),__output.push(idPrefix),__output.push('-lean-leadersPlanDen">'),__output.push(t("reports","settings:lean:leadersPlanDen")),__output.push('</label>\n    <input id="'),__output.push(idPrefix),__output.push('-lean-leadersPlanDen" class="form-control" name="reports.lean.leadersPlanDen" type="number" min="0" step="1">\n  </div>\n  <div class="form-group">\n    <label for="'),__output.push(idPrefix),__output.push('-lean-prodMaterialHandlingPlanCoeff">'),__output.push(t("reports","settings:lean:prodMaterialHandlingPlanCoeff")),__output.push('</label>\n    <input id="'),__output.push(idPrefix),__output.push('-lean-prodMaterialHandlingPlanCoeff" class="form-control" name="reports.lean.prodMaterialHandlingPlanCoeff" type="number" min="0" step="0.001">\n  </div>\n  <div class="form-group-horizontal">\n    <div class="form-group">\n      <label for="'),__output.push(idPrefix),__output.push('-lean-kittersPlanCoeff1">'),__output.push(t("reports","settings:lean:kittersPlanCoeff1")),__output.push('</label>\n      <input id="'),__output.push(idPrefix),__output.push('-lean-kittersPlanCoeff1" class="form-control" name="reports.lean.kittersPlanCoeff1" type="number" min="0" step="0.001">\n    </div>\n    <div class="form-group">\n      <label for="'),__output.push(idPrefix),__output.push('-lean-kittersPlanCoeff2">'),__output.push(t("reports","settings:lean:kittersPlanCoeff2")),__output.push('</label>\n      <input id="'),__output.push(idPrefix),__output.push('-lean-kittersPlanCoeff2" class="form-control" name="reports.lean.kittersPlanCoeff2" type="number" min="0" step="0.001">\n    </div>\n  </div>\n  <div class="form-group">\n    <label for="'),__output.push(idPrefix),__output.push('-lean-realKittersProdTasks">'),__output.push(t("reports","settings:lean:realKittersProdTasks")),__output.push('</label>\n    <input id="'),__output.push(idPrefix),__output.push('-lean-realKittersProdTasks" name="reports.lean.realKittersProdTasks" type="text">\n  </div>\n  <div class="form-group-horizontal">\n    <div class="form-group">\n      <label for="'),__output.push(idPrefix),__output.push('-lean-prodTransportPlanCoeff1">'),__output.push(t("reports","settings:lean:prodTransportPlanCoeff1")),__output.push('</label>\n      <input id="'),__output.push(idPrefix),__output.push('-lean-prodTransportPlanCoeff1" class="form-control" name="reports.lean.prodTransportPlanCoeff1" type="number" min="0" step="0.001">\n    </div>\n    <div class="form-group">\n      <label for="'),__output.push(idPrefix),__output.push('-lean-prodTransportPlanCoeff2">'),__output.push(t("reports","settings:lean:prodTransportPlanCoeff2")),__output.push('</label>\n      <input id="'),__output.push(idPrefix),__output.push('-lean-prodTransportPlanCoeff2" class="form-control" name="reports.lean.prodTransportPlanCoeff2" type="number" min="0" step="0.001">\n    </div>\n  </div>\n  <div class="form-group">\n    <label for="'),__output.push(idPrefix),__output.push('-lean-realProdTransportProdTasks">'),__output.push(t("reports","settings:lean:realProdTransportProdTasks")),__output.push('</label>\n    <input id="'),__output.push(idPrefix),__output.push('-lean-realProdTransportProdTasks" name="reports.lean.realProdTransportProdTasks" type="text">\n  </div>\n  <div class="form-group-horizontal">\n    <div class="form-group">\n      <label for="'),__output.push(idPrefix),__output.push('-lean-cycleCountingPlanCoeff1">'),__output.push(t("reports","settings:lean:cycleCountingPlanCoeff1")),__output.push('</label>\n      <input id="'),__output.push(idPrefix),__output.push('-lean-cycleCountingPlanCoeff1" class="form-control" name="reports.lean.cycleCountingPlanCoeff1" type="number" min="0" step="0.001">\n    </div>\n    <div class="form-group">\n      <label for="'),__output.push(idPrefix),__output.push('-lean-cycleCountingPlanCoeff2">'),__output.push(t("reports","settings:lean:cycleCountingPlanCoeff2")),__output.push('</label>\n      <input id="'),__output.push(idPrefix),__output.push('-lean-cycleCountingPlanCoeff2" class="form-control" name="reports.lean.cycleCountingPlanCoeff2" type="number" min="0" step="0.001">\n    </div>\n  </div>\n  <div class="form-group">\n    <label for="'),__output.push(idPrefix),__output.push('-lean-realCycleCountingProdTasks">'),__output.push(t("reports","settings:lean:realCycleCountingProdTasks")),__output.push('</label>\n    <input id="'),__output.push(idPrefix),__output.push('-lean-realCycleCountingProdTasks" name="reports.lean.realCycleCountingProdTasks" type="text">\n  </div>\n  <div class="form-group-horizontal">\n    <div class="form-group">\n      <label for="'),__output.push(idPrefix),__output.push('-lean-otherWarehousingPlanCoeff1">'),__output.push(t("reports","settings:lean:otherWarehousingPlanCoeff1")),__output.push('</label>\n      <input id="'),__output.push(idPrefix),__output.push('-lean-otherWarehousingPlanCoeff1" class="form-control" name="reports.lean.otherWarehousingPlanCoeff1" type="number" min="0" step="0.001">\n    </div>\n    <div class="form-group">\n      <label for="'),__output.push(idPrefix),__output.push('-lean-otherWarehousingPlanCoeff2">'),__output.push(t("reports","settings:lean:otherWarehousingPlanCoeff2")),__output.push('</label>\n      <input id="'),__output.push(idPrefix),__output.push('-lean-otherWarehousingPlanCoeff2" class="form-control" name="reports.lean.otherWarehousingPlanCoeff2" type="number" min="0" step="0.001">\n    </div>\n  </div>\n  <div class="form-group">\n    <label for="'),__output.push(idPrefix),__output.push('-lean-realOtherWarehousingProdTasks">'),__output.push(t("reports","settings:lean:realOtherWarehousingProdTasks")),__output.push('</label>\n    <input id="'),__output.push(idPrefix),__output.push('-lean-realOtherWarehousingProdTasks" name="reports.lean.realOtherWarehousingProdTasks" type="text">\n  </div>\n  <div class="form-group">\n    <label for="'),__output.push(idPrefix),__output.push('-lean-realRoutingTimeForLineDowntimeReasons">'),__output.push(t("reports","settings:lean:realRoutingTimeForLineDowntimeReasons")),__output.push('</label>\n    <input id="'),__output.push(idPrefix),__output.push('-lean-realRoutingTimeForLineDowntimeReasons" name="reports.lean.realRoutingTimeForLineDowntimeReasons" type="text">\n  </div>\n  <div class="form-group">\n    <label for="'),__output.push(idPrefix),__output.push('-lean-realRoutingTimeForLabourDowntimeReasons">'),__output.push(t("reports","settings:lean:realRoutingTimeForLabourDowntimeReasons")),__output.push('</label>\n    <input id="'),__output.push(idPrefix),__output.push('-lean-realRoutingTimeForLabourDowntimeReasons" name="reports.lean.realRoutingTimeForLabourDowntimeReasons" type="text">\n  </div>\n  <div class="form-group">\n    <label for="'),__output.push(idPrefix),__output.push('-lean-heijunkaTimeForLineCoeff">'),__output.push(t("reports","settings:lean:heijunkaTimeForLineCoeff")),__output.push('</label>\n    <input id="'),__output.push(idPrefix),__output.push('-lean-heijunkaTimeForLineCoeff" class="form-control" name="reports.lean.heijunkaTimeForLineCoeff" type="number" min="0" step="0.001">\n  </div>\n  '),["realBreaksDowntimeReasons","realFap0DowntimeReasons","realStartupDowntimeReasons","realMeetingsDowntimeReasons","realSixSDowntimeReasons","realTpmDowntimeReasons","realTrainingsDowntimeReasons","realCoTimeDowntimeReasons"].forEach(function(e){__output.push('\n  <div class="form-group">\n    <label for="'),__output.push(idPrefix),__output.push("-lean-"),__output.push(e),__output.push('">'),__output.push(t("reports","settings:lean:"+e)),__output.push('</label>\n    <input id="'),__output.push(idPrefix),__output.push("-lean-"),__output.push(e),__output.push('" name="reports.lean.'),__output.push(e),__output.push('" type="text">\n  </div>\n  ')}),__output.push('\n  <div class="form-group">\n    <label for="'),__output.push(idPrefix),__output.push('-lean-realShutdownThreshold">'),__output.push(t("reports","settings:lean:realShutdownThreshold")),__output.push('</label>\n    <input id="'),__output.push(idPrefix),__output.push('-lean-realShutdownThreshold" class="form-control" name="reports.lean.realShutdownThreshold" type="number" min="0" step="1">\n  </div>\n  <div class="form-group">\n    <label for="'),__output.push(idPrefix),__output.push('-lean-efficiencyPlanFormula">'),__output.push(t("reports","settings:lean:efficiencyPlanFormula")),__output.push('</label>\n    <textarea id="'),__output.push(idPrefix),__output.push('-lean-efficiencyPlanFormula" class="form-control reports-settings-efficiencyFormula" name="reports.lean.efficiencyPlanFormula" rows="3"></textarea>\n  </div>\n  <div class="form-group">\n    <label for="'),__output.push(idPrefix),__output.push('-lean-realEfficiencyFormula">'),__output.push(t("reports","settings:lean:realEfficiencyFormula")),__output.push('</label>\n    <textarea id="'),__output.push(idPrefix),__output.push('-lean-realEfficiencyFormula" class="form-control reports-settings-efficiencyFormula" name="reports.lean.realEfficiencyFormula" rows="3"></textarea>\n    <p class="help-block">\n      '),__output.push(t("reports","settings:lean:efficiencyFormulaHelp")),__output.push('\n      <span class="reports-settings-efficiencyFormula">\n        TIME_AVAIL_PER_SHIFT,\n        ROUTING_TIME_FOR_LINE,\n        ROUTING_TIME_FOR_LABOUR,\n        HEIJUNKA_TIME_FOR_LINE,\n        BREAKS,\n        FAP_0,\n        STARTUP,\n        SHUTDOWN,\n        MEETINGS,\n        6S,\n        TPM,\n        TRAININGS,\n        CO_TIME,\n        DOWNTIME\n      </span>\n    </p>\n  </div>\n</div>\n');return __output.join("")}});