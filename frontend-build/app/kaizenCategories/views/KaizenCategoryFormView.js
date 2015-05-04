// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define(["app/core/views/FormView","app/kaizenCategories/templates/form"],function(e,i){"use strict";return e.extend({template:i,afterRender:function(){e.prototype.afterRender.call(this),this.options.editMode&&(this.$id("id").prop("readonly",!0),this.$id("name").focus())},serializeForm:function(e){return e.description||(e.description=""),e.inNearMiss=!!e.inNearMiss,e.inSuggestion=!!e.inSuggestion,e}})});