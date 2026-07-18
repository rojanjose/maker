// Cloudflare Worker for rojan.dev
// - Proxies rojan.dev/maker/* from GitHub Pages (browser URL stays on rojan.dev)
// - Redirects every other path to rojanjose.github.io, preserving the old
//   domain-forward behavior
export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Canonicalize www -> apex
    if (url.hostname === "www.rojan.dev") {
      return Response.redirect("https://rojan.dev" + url.pathname + url.search, 301);
    }

    // Normalize /maker -> /maker/ on our own domain
    if (url.pathname === "/maker") {
      return Response.redirect("https://rojan.dev/maker/", 301);
    }

    // Proxy /maker/* from GitHub Pages
    if (url.pathname.startsWith("/maker/")) {
      const upstream = "https://rojanjose.github.io" + url.pathname + url.search;
      const resp = await fetch(upstream, { redirect: "manual" });
      // Rewrite upstream redirects so they never expose github.io
      const headers = new Headers(resp.headers);
      const loc = headers.get("location");
      if (loc) {
        headers.set(
          "location",
          loc.replace("https://rojanjose.github.io", "https://rojan.dev")
        );
      }
      return new Response(resp.body, { status: resp.status, headers });
    }

    // Everything else: forward to the GitHub user site (path preserved)
    return Response.redirect("https://rojanjose.github.io" + url.pathname, 301);
  },
};
