function noSearchDefaultPageRender() {
  const app = document.querySelector("#app");
  if (app) {
    const currentUrl = window.location.href;

    app.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
        <div class="content-container">
          <h1>LocalBang</h1>
          <p>DuckDuckGo's bang redirects are too slow. Add the following URL as a custom search engine to your browser. Enables <a href="https://unduck-bangs.netlify.app/" target="_blank">all of DuckDuckGo's bangs.</a></p>
          <div class="url-container"> 
            <input 
              type="text" 
              class="url-input"
              value="${currentUrl}/?q=%s"
              readonly 
            />
            <button class="copy-button">
              <img src="/public/clipboard.svg" alt="Copy" />
            </button>
            <br>
            <p id="customize-link-container">
              <a href="#" id="customize-link">Want to customize the default bang?</a>
            </p>
            <div id="customize-section" style="display: none;">
              <input 
                type="text" 
                id="default-bang-input"
                class="url-input"
                placeholder="!g (default)" 
              />
            </div>
          </div>
        </div>
      </div>
    `;

    const copyButton = app.querySelector(".copy-button");
    const copyIcon = copyButton.querySelector("img");
    const urlInput = app.querySelector(".url-input");
    const customizeLink = document.getElementById("customize-link");
    const customizeSection = document.getElementById("customize-section");
    const defaultBangInput = document.getElementById("default-bang-input");
    const customizeLinkContainer = document.getElementById("customize-link-container");
    const originalUrl = urlInput?.value || "";

    if (customizeLink) {
      customizeLink.addEventListener("click", (e) => {
        e.preventDefault();
        customizeSection.style.display = "block";
        customizeLinkContainer.style.display = "none";
      });
    }

    if (defaultBangInput) {
      const currentUrl = window.location.href;
      defaultBangInput.addEventListener("input", () => {
        const defaultBang = defaultBangInput.value.trim();
        if (defaultBang === "") {
          urlInput.value = originalUrl;
        } else {
          urlInput.value = `${currentUrl}/?q=%s&default=${defaultBang}`;
        }
      });
    }

    if (copyButton) {
      copyButton.addEventListener("click", async () => {
        await navigator.clipboard.writeText(urlInput.value);
        copyIcon.src = "/public/clipboard-check.svg";

        setTimeout(() => {
          copyIcon.src = "/public/clipboard.svg";
        }, 2000);
      });
    }
  }
}

function getBangredirectUrl() {
  const url = new URL(window.location.href);
  const query = url.searchParams.get("q")?.trim() ?? "";
  const urlDefault = url.searchParams.get("default")?.trim() ?? localStorage.getItem("default-bang") ?? "g";
  const defaultBang = bangs.find((b) => b.t === urlDefault);
  if (!query) {
    noSearchDefaultPageRender();
    return null;
  }

  const match = query.match(/!([a-z0-9]+)/i);

  const bangCandidate = match?.[1]?.toLowerCase();
  const selectedBang = bangs.find((b) => b.t === bangCandidate) ?? defaultBang;

  // Remove the first bang from the query
  const cleanQuery = query.replace(/![a-z0-9]+\s*/i, "").trim();

  // Format of the url is:
  // https://www.google.com/search?q={{{s}}}
  const searchUrl = selectedBang?.u.replace(
    "{{{s}}}",
    // Replace %2F with / to fix formats like "!ghr+t3dotgg/unduck"
    encodeURIComponent(cleanQuery).replace(/%2F/g, "/")
  );
  if (!searchUrl) return null;

  return searchUrl;
}

function doRedirect() {
  const searchUrl = getBangredirectUrl();
  if (!searchUrl) return;
  window.location.replace(searchUrl);
}

doRedirect();