define(["underscore","jquery","app/core/util/html","app/core/templates/forms/dropdownRadio"],function(e,n,o,t){"use strict";return function(e,o){o=Object.assign({label:"?",options:[]},o);var a=n(t({label:o.label,options:o.options}));function r(){var n=e.val(),t=o.options.find(function(e){return e.value===n});t||(t=o.options[0],e.val(t.value));var r=t.selectedLabel||t.optionLabel;a.find(".dropdownRadio-selectedLabel").text(r)}a.on("click",".dropdown-menu a",function(t){var a=n(t.currentTarget).parent().index(),r=o.options[a];e.val(r.value).trigger("change")}),e.on("change",function(){r()}),a.insertAfter(e),e.appendTo(a),r()}});