import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"HOME INFO","description":"","frontmatter":{},"headers":[],"relativePath":"ru/guide/widgets/home/info.md","filePath":"ru/guide/widgets/home/info.md","lastUpdated":1775413032000}');
const _sfc_main = { name: "ru/guide/widgets/home/info.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="home-info" tabindex="-1">HOME INFO <a class="header-anchor" href="#home-info" aria-label="Permalink to &quot;HOME INFO&quot;">​</a></h1></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("ru/guide/widgets/home/info.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const info = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  info as default
};
