import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"TEMPERATURE LIGHTS","description":"","frontmatter":{},"headers":[],"relativePath":"guide/widgets/light/temperature.md","filePath":"guide/widgets/light/temperature.md","lastUpdated":1775413032000}');
const _sfc_main = { name: "guide/widgets/light/temperature.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="temperature-lights" tabindex="-1">TEMPERATURE LIGHTS <a class="header-anchor" href="#temperature-lights" aria-label="Permalink to &quot;TEMPERATURE LIGHTS&quot;">​</a></h1></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("guide/widgets/light/temperature.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const temperature = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  temperature as default
};
