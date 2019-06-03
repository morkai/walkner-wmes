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

    const metaPath = path.join(root, nc15, hash, `meta.json`);
    const pdfPath = path.join(root, nc15, hash, `${nc15}.pdf`);

    try
    {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      const extractedText = JSON.parse(execSync(`node ${extractText} ${pdfPath}`).toString());

      if (extractedText.meta.Title && !meta.title)
      {
        meta.title = extractedText.meta.Title;
      }

      if (extractedText.pages)
      {
        meta.pages = extractedText.pages;

        if (!meta.pageCount)
        {
          meta.pageCount = extractedText.pages.length;
        }
      }

      fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
    }
    catch (err)
    {
      console.log(err.message);
    }
  });
});
