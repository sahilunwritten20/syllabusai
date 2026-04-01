const searchWeb = async (query) => {
  try {
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`
    );
    const data = await response.json();
    return data.AbstractText || data.RelatedTopics?.[0]?.Text || 'No results found';
  } catch (error) {
    return 'Search unavailable';
  }
};

module.exports = { searchWeb };