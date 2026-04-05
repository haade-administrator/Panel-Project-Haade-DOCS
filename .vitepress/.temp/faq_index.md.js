import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"Frequently Asked Questions (FAQ)","description":"","frontmatter":{},"headers":[],"relativePath":"faq/index.md","filePath":"faq/index.md","lastUpdated":1775415175000}');
const _sfc_main = { name: "faq/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="frequently-asked-questions-faq" tabindex="-1">Frequently Asked Questions (FAQ) <a class="header-anchor" href="#frequently-asked-questions-faq" aria-label="Permalink to &quot;Frequently Asked Questions (FAQ)&quot;">​</a></h1><p>This section is created to provide answers to popular questions.</p><h2 id="didn-t-find-an-answer" tabindex="-1">Didn&#39;t find an answer? <a class="header-anchor" href="#didn-t-find-an-answer" aria-label="Permalink to &quot;Didn&#39;t find an answer?&quot;">​</a></h2><p>If you didn&#39;t find a solution to your problem in this section:</p><ul><li>📖 Refer to the <a href="/Panel-Project-Haade-DOCS/guide/">documentation</a></li><li>🙏 Check answers in the <a href="https://github.com/haade-administrator/Panel-Project-Haade/discussions/categories/q-a" target="_blank" rel="noreferrer">repository</a></li><li>💬 Ask a question in <a href="https://github.com/haade-administrator/Panel-Project-Haade/discussions/categories/general" target="_blank" rel="noreferrer">Discussions</a></li></ul></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("faq/index.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  index as default
};
