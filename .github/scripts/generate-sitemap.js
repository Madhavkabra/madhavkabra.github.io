const fetch = require('node-fetch');
const fs = require('fs');

const USERNAME = 'madhavkabra';
const GITHUB_API = 'https://api.github.com';

async function getRepos(username) {
  const url = `${GITHUB_API}/users/${username}/repos?per_page=100`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'github-actions' }
  });
  if (!response.ok) throw new Error(`Failed to fetch repos: ${response.statusText}`);
  return response.json();
}

async function getPagesUrl(username, repo) {
  const url = `${GITHUB_API}/repos/${username}/${repo}/pages`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'github-actions' }
  });
  if (response.status === 200) {
    const data = await response.json();
    return data.html_url;
  }
  return null;
}

async function generateSitemap() {
  try {
    const repos = await getRepos(USERNAME);

    const pagesUrls = [];
    for (const repo of repos) {
      const pagesUrl = await getPagesUrl(USERNAME, repo.name);
      if (pagesUrl) {
        pagesUrls.push(pagesUrl);
        console.log(`Found GitHub Pages: ${pagesUrl}`);
      }
    }

    if (pagesUrls.length === 0) {
      console.log('No GitHub Pages sites found.');
      return false;
    }

    const sitemapEntries = pagesUrls
      .map(url => `  <url>\n    <loc>${url}</loc>\n  </url>`)
      .join('\n');

    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      `${sitemapEntries}\n` +
      `</urlset>\n`;

    fs.writeFileSync('sitemap.xml', sitemapContent);
    console.log('sitemap.xml generated successfully.');
    return true;
  } catch (error) {
    console.error('Error:', error.message);
    return false;
  }
}

generateSitemap();
