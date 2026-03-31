// Frontend config uses a local proxy by default. Public Drive folders do not need a browser API key.
window.PURESOUND_CONFIG = {
  apiBase: "http://localhost:8787/api",
  drive: {
    rootFolderId: "1eBXiNU5vMlK67JELspL6_QCVQBDSwDJ2",
  },
  allowDirectApiKey: false,
  directBrowser: {
    apiKey: "",
  },
};

