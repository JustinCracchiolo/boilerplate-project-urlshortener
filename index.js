require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const dns = require("dns");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

let urlDatabase = {}
let counter = 1

// /api/shortul POST
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  // Validate URL format
  try {
    const parsedUrl = new URL(originalUrl);

    // Must start with http or https
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return res.json({ error: "invalid url" });
    }

    // DNS lookup to verify hostname
    dns.lookup(parsedUrl.hostname, (err) => {
      if (err) {
        return res.json({ error: "invalid url" });
      }

      const shortUrl = counter++; //input into hasmap must not be mutable (hence the need to make a const variable)
      urlDatabase[shortUrl] = originalUrl

      res.json({
        original_url: originalUrl,
        short_url: shortUrl
      });

    })
    
  } catch (err) {
  return res.json({ error: "invalid url" })
}
});

// /api/shorturl/:shorturl GET 
app.get("/api/shorturl/:shorturl", (req, res) => {
  const shortUrl = req.params.shorturl
  const originalUrl = urlDatabase[shortUrl]

  if (!originalUrl) {
    return res.json({ error: "invalid url" });
  }

  res.redirect(originalUrl)

})

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
