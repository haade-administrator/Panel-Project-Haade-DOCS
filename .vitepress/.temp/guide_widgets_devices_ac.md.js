import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"AIR CONDITIONER","description":"","frontmatter":{},"headers":[],"relativePath":"guide/widgets/devices/ac.md","filePath":"guide/widgets/devices/ac.md","lastUpdated":1775413032000}');
const _sfc_main = { name: "guide/widgets/devices/ac.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="air-conditioner" tabindex="-1">AIR CONDITIONER <a class="header-anchor" href="#air-conditioner" aria-label="Permalink to &quot;AIR CONDITIONER&quot;">​</a></h1></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("guide/widgets/devices/ac.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const ac = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  ac as default
};
