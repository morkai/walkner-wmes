// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/core/util/idAndLabel',
  'app/planning/util/contextMenu',
  '../KanbanSettingCollection',
  'app/kanban/templates/editors/input',
  'app/kanban/templates/editors/select',
  'app/kanban/templates/editors/textArea'
], function(
  $,
  idAndLabel,
  contextMenu,
  KanbanSettingCollection,
  inputEditorTemplate,
  selectEditorTemplate,
  textAreaEditorTemplate
) {
  'use strict';

  return {

    editors: {

      input: function(cell, maxLength, pattern, placeholder)
      {
        var view = this;
        var entry = cell.model.serialize(view.model);

        $(document.body).append(inputEditorTemplate({
          idPrefix: view.idPrefix,
          columnId: cell.columnId,
          maxLength: maxLength,
          pattern: pattern,
          placeholder: placeholder,
          value: cell.column.editorValue(
            cell.arrayIndex >= 0 ? entry[cell.columnId][cell.arrayIndex] : entry[cell.columnId],
            cell.column,
            cell.arrayIndex,
            entry
          )
        }));

        view.$id('editor-backdrop').one('click', hide);
        view.$id('editor-form').on('submit', submit);
        view.$id('editor-input').on('blur', hide).on('keydown', keyDown).select();

        view.editorPositioners.input.call(view, cell);

        function submit()
        {
          var newValue = cell.column.parseValue(
            view.$id('editor-input').val(),
            cell.column,
            cell.arrayIndex,
            cell.model.serialize(view.model)
          );

          view.handleEditorValue(cell.modelId, cell.columnId, cell.arrayIndex, newValue);

          hide();

          return false;
        }

        function hide()
        {
          view.$id('editor-backdrop').remove();
          view.$id('editor-form').remove();

          view.afterEdit();
        }

        function keyDown(e)
        {
          if (e.originalEvent.key === 'Escape')
          {
            hide();
          }
        }
      },

      select: function(cell, multiple, options, selected)
      {
        var view = this;
        var changeAt = Number.MAX_VALUE;

        $(document.body).append(selectEditorTemplate({
          idPrefix: view.idPrefix,
          columnId: cell.columnId,
          multiple: multiple,
          options: options.map(function(option)
          {
            option.selected = selected.indexOf(option.id) !== -1;

            return option;
          })
        }));

        view.$id('editor-backdrop').one('click', hide);
        view.$id('editor-form').on('submit', submit);
        view.$id('editor-input')
          .on('blur', hide)
          .on('keydown', keyDown)
          .on('click', click)
          .on('change', change).focus();

        view.editorPositioners.input.call(view, cell);

        function submit()
        {
          var newValue = cell.column.parseValue(
            view.$id('editor-input').val(),
            cell.column,
            cell.arrayIndex,
            cell.model.serialize(view.model)
          );

          view.handleEditorValue(cell.modelId, cell.columnId, cell.arrayIndex, newValue);

          hide();

          return false;
        }

        function hide()
        {
          view.$id('editor-backdrop').remove();
          view.$id('editor-form').remove();

          view.afterEdit();
        }

        function keyDown(e)
        {
          if (e.originalEvent.key === 'Escape')
          {
            hide();
          }
          else if (e.originalEvent.key === 'Enter')
          {
            submit();
          }
        }

        function click()
        {
          var diff = Date.now() - changeAt;

          if (diff >= 0 && diff < 50)
          {
            submit();
          }
        }

        function change()
        {
          changeAt = Date.now();
        }
      },

      textArea: function(cell)
      {
        var view = this;
        var entry = cell.model.serialize(view.model);

        $(document.body).append(textAreaEditorTemplate({
          idPrefix: view.idPrefix,
          columnId: cell.columnId,
          value: cell.column.editorValue(
            cell.arrayIndex >= 0 ? entry[cell.columnId][cell.arrayIndex] : entry[cell.columnId],
            cell.column,
            cell.arrayIndex,
            entry
          )
        }));

        view.$id('editor-backdrop').one('click', hide);

        var inputEl = view.$id('editor-input').on('blur', hide).on('keydown', keyDown)[0];

        inputEl.selectionStart = inputEl.value.length;
        inputEl.selectionEnd = inputEl.value.length;
        inputEl.focus();

        view.editorPositioners.textArea.call(view, cell);

        function submit()
        {
          var newValue = cell.column.parseValue(
            view.$id('editor-input').val(),
            cell.column,
            cell.arrayIndex,
            cell.model.serialize(view.model)
          );

          view.handleEditorValue(cell.modelId, cell.columnId, cell.arrayIndex, newValue);

          hide();

          return false;
        }

        function hide()
        {
          view.$id('editor-backdrop').remove();
          view.$id('editor-form').remove();

          view.afterEdit();
        }

        function keyDown(e)
        {
          if (e.key === 'Enter')
          {
            if (e.shiftKey || e.ctrlKey || e.altKey)
            {
              var inputEl = view.$id('editor-input')[0];
              var selectionStart = inputEl.selectionStart;

              inputEl.value = inputEl.value.substring(0, selectionStart)
                + '\n'
                + inputEl.value.substring(inputEl.selectionEnd);

              inputEl.selectionStart = selectionStart + 1;
              inputEl.selectionEnd = selectionStart + 1;

              return false;
            }

            return submit();
          }

          if (e.key === 'Escape')
          {
            hide();
          }
        }
      },

      kind: function(cell)
      {
        var view = this;
        var rect = cell.td.getBoundingClientRect();
        var oldKind = cell.model.get('kind');
        var menu = [];

        ['kk', 'pk', null].forEach(function(newKind)
        {
          menu.push({
            label: view.t('kind:' + newKind),
            handler: view.handleEditorValue.bind(view, cell.modelId, cell.columnId, cell.arrayIndex, newKind),
            disabled: oldKind === newKind
          });
        });

        contextMenu.show(view, rect.top, rect.left, menu);

        view.broker.subscribe('planning.contextMenu.hidden', view.afterEdit.bind(view)).setLimit(1);
      },

      container: function(cell)
      {
        var options = [{id: null, text: this.t('container:null')}].concat(this.model.containers.map(idAndLabel));
        var selected = [cell.model.get('container')];

        this.editors.select.call(this, cell, false, options, selected);
      },

      workCenter: function(cell)
      {
        var names = [cell.model.get('supplyArea')];
        var options = [{id: '', text: this.t('workCenter:null')}].concat(
          this.model.supplyAreas.getWorkCenters(names)
        );
        var selected = [cell.model.get('workCenter')];

        this.editors.select.call(this, cell, false, options, selected);
      },

      discontinued: function(cell)
      {
        this.handleEditorValue(cell.modelId, cell.columnId, cell.arrayIndex, !cell.model.get('discontinued'));
        this.afterEdit();
      },

      componentQtyJit: function(cell)
      {
        this.editors.input.call(this, cell, '99999.99'.length, '^[0-9]{1,5}([,.][0-9]{1,2})?$');
      },

      workstations: function(cell)
      {
        this.editors.input.call(this, cell, 3, '^([0-9]|[1-9][0-9]|[0-9](\.|,)5)$');
      },

      locations: function(cell)
      {
        this.editors.input.call(this, cell, 3, '^[A-Za-z]([0-9][0-9])$', 'X00');
      },

      comment: function(cell)
      {
        this.editors.textArea.call(this, cell);
      },

      markerColor: function(cell)
      {
        var entry = cell.model.serialize(this.model);
        var options = [{id: '', text: this.t('color:null')}].concat(
          KanbanSettingCollection.getMarkerColors()
        );
        var selected = [entry[cell.columnId] || ''];

        this.editors.select.call(this, cell, false, options, selected);
      }

    },

    positioners: {

      contextMenu: function(editingCell)
      {
        var cell = this.resolveCell(editingCell);

        if (cell)
        {
          var rect = cell.td.getBoundingClientRect();

          contextMenu.position(this, rect.top, rect.left);
        }
      },

      input: function(editingCell)
      {
        var cell = this.resolveCell(editingCell);

        if (cell)
        {
          var rect = cell.td.getBoundingClientRect();

          this.$id('editor-form').css({
            top: rect.top + 'px',
            left: rect.left + 'px'
          });
        }
      },

      textArea: function(editingCell)
      {
        var cell = this.resolveCell(editingCell);

        if (!cell)
        {
          return;
        }

        var rect = cell.td.getBoundingClientRect();
        var top = rect.top;
        var left = rect.left;
        var height = this.$id('editor-input').outerHeight();

        if (top + height >= window.innerHeight - 15)
        {
          top += window.innerHeight - (top + height) - 15;
        }

        if (left + rect.width >= window.innerWidth - 15)
        {
          left += window.innerWidth - (left + rect.width) - 15;
        }

        this.$id('editor-form').css({
          top: top + 'px',
          left: left + 'px'
        });
      },

      kind: 'contextMenu',
      componentQtyJit: 'input',
      workstations: 'input',
      locations: 'input',
      comment: 'textArea'

    }

  };
});
