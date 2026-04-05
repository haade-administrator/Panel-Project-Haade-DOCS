import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"HOME MAIN","description":"","frontmatter":{},"headers":[],"relativePath":"ru/guide/widgets/home/main.md","filePath":"ru/guide/widgets/home/main.md","lastUpdated":1775413032000}');
const _sfc_main = { name: "ru/guide/widgets/home/main.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="home-main" tabindex="-1">HOME MAIN <a class="header-anchor" href="#home-main" aria-label="Permalink to &quot;HOME MAIN&quot;">​</a></h1></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("ru/guide/widgets/home/main.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const main = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  main as default
};
