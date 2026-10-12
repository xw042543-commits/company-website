import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { JSDOM } from "jsdom";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import ts from "typescript";

// Compile the actual TSX component while keeping the application's React instance.
const source = readFileSync(new URL("./remote-image.tsx", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
});
const componentModule = { exports: {} };
new Function("require", "module", "exports", outputText)(
  createRequire(import.meta.url), componentModule, componentModule.exports,
);
const { RemoteImage } = componentModule.exports;

test("a failed image recovers when its source changes, including a return to the original source", async () => {
  const dom = new JSDOM("<!doctype html><div id='root'></div>");
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  const previousActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const container = dom.window.document.getElementById("root");
  const root = createRoot(container);
  const render = (src, label = "University A") => act(() => root.render(createElement(RemoteImage, {
    src, label, alt: "Campus", className: "campus-image", eager: true,
  })));

  try {
    await render("/first.jpg");
    const firstImage = container.querySelector("img");
    await act(() => firstImage.dispatchEvent(new dom.window.Event("error")));
    assert.equal(container.querySelector("img"), null);
    assert.equal(container.querySelector("span").textContent, "UA");

    // Unrelated prop updates must not repeatedly retry the same failed URL.
    await render("/first.jpg", "Updated University");
    assert.equal(container.querySelector("img"), null);
    assert.equal(container.querySelector("span").getAttribute("aria-label"), "Updated University");

    await render("/second.jpg");
    const secondImage = container.querySelector("img");
    assert.ok(secondImage, "the replacement image must be rendered after an earlier failure");
    assert.equal(secondImage.getAttribute("src"), "/second.jpg");
    assert.equal(secondImage.getAttribute("alt"), "Campus");
    assert.equal(secondImage.getAttribute("class"), "campus-image");
    assert.equal(secondImage.getAttribute("loading"), "eager");

    // A late event from the replaced image must not hide the current image.
    await act(() => firstImage.dispatchEvent(new dom.window.Event("error")));
    assert.equal(container.querySelector("img"), secondImage);

    await act(() => secondImage.dispatchEvent(new dom.window.Event("error")));
    assert.equal(container.querySelector("img"), null);
    await render("/first.jpg");
    assert.equal(container.querySelector("img")?.getAttribute("src"), "/first.jpg");
  } finally {
    await act(() => root.unmount());
    dom.window.close();
    globalThis.window = previousWindow;
    globalThis.document = previousDocument;
    globalThis.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
  }
});
