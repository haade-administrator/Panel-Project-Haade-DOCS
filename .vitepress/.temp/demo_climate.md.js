import { resolveComponent, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"Climate widget","description":"","frontmatter":{},"headers":[],"relativePath":"demo/climate.md","filePath":"demo/climate.md","lastUpdated":1775413032000}');
const _sfc_main = { name: "demo/climate.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_HAGuard = resolveComponent("HAGuard");
  const _component_ClimateWidget = resolveComponent("ClimateWidget");
  _push(`<div${ssrRenderAttrs(_attrs)}>`);
  _push(ssrRenderComponent(_component_HAGuard, null, null, _parent));
  _push(`<h1 id="climate-widget" tabindex="-1">Climate widget <a class="header-anchor" href="#climate-widget" aria-label="Permalink to &quot;Climate widget&quot;">​</a></h1>`);
  _push(ssrRenderComponent(_component_ClimateWidget, null, null, _parent));
  _push(`</div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("demo/climate.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const climate = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  climate as default
};
