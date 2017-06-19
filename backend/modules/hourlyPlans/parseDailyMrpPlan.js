// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const moment = require('moment');
const XLSX = require('xlsx');

const DATE_COLUMNS = ['A', 'B', 'C', 'D', 'E'];

const workbook = XLSX.readFile(process.argv[2], {
  cellFormula: false,
  cellHTML: false
});
const sheet = workbook.Sheets.Plan;
const rowCount = sheet['!ref'].match(/^[A-Z]+[0-9]+:[A-Z]+([0-9]+)/)[1];
const mrpToOrdersMap = {
  __DATE__: null
};
let currentMrp = null;
let date = null;

for (let i = 1; i < rowCount; ++i)
{
  if (date === null && (date = findDate(i)) !== null)
  {
    continue;
  }

  const no = cell('C', i, '').toString().trim();
  const description = ' ' + cell('E', i, '').trim() + ' ';

  if (/^[0-9]{9}$/.test(no))
  {
    var order = {
      _id: no,
      nc12: cell('D', i, '').toString().trim().replace(/^0+/, ''),
      name: description.trim(),
      qty: round(cell('F', i, 0)),
      rbh: round(cell('G', i, 0)),
      operators: round(cell('H', i, 0)),
      shifts: round(cell('I', i, 0))
    };

    mrpToOrdersMap[currentMrp].push(order);

    continue;
  }

  var matches = description.match(/\s+([A-Z][A-Z0-9]{2})\s+/);

  if (matches)
  {
    currentMrp = matches[1];

    if (!mrpToOrdersMap[currentMrp])
    {
      mrpToOrdersMap[currentMrp] = [];
    }
  }
}

if (date)
{
  mrpToOrdersMap.__DATE__ = date;
}

process.stdout.write(JSON.stringify(mrpToOrdersMap));

function findDate(row)
{
  for (let i = 0; i < DATE_COLUMNS.length; ++i)
  {
    const column = DATE_COLUMNS[i];
    const value = cell(column, row, '').toString();
    const matches = value.match(/([0-9]{1,2}[^0-9][0-9]{1,2}[^0-9][0-9]{4})/);

    if (matches)
    {
      const dateMoment = moment(matches[1], 'DD.MM.YYYY');

      if (dateMoment.isValid())
      {
        return dateMoment.format('YYYY-MM-DD');
      }
    }
  }

  return null;
}

function cell(column, row, defaultValue)
{
  const cell = sheet[`${column}${row}`];

  return cell ? cell.v : defaultValue;
}

function round(value)
{
  return typeof value !== 'number' ? 0 : (Math.round(value * 1000) / 1000);
}
