'use strict';

const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');

const root = path.join(process.argv[2] || process.cwd(), 'uploaded');
const extractText = path.join(__dirname, '..', 'backend/node_modules/orderDocuments/extractText.js');

fs.readdirSync(root).forEach(nc15 =>
{
  if (!/^[0-9]{15}$/.test(nc15))
  {
    return;
  }

  console.log(nc15);

  fs.readdirSync(path.join(root, nc15)).forEach(hash =>
  {
    if (!/^[a-f0-9]{32}$/.test(hash))
    {
      return;
    }

    const pdfFile = path.join(root, nc15, hash, `${nc15}.pdf`);

    try
    {
      const meta = execSync(`node ${extractText} ${pdfFile}`);

      fs.writeFileSync(path.join(root, nc15, hash, 'meta.json'), meta);
    }
    catch (err)
    {
      console.log(err.message);
    }
  });
});
