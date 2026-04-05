import { resolveComponent, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"Light widget","description":"","frontmatter":{},"headers":[],"relativePath":"demo/light.md","filePath":"demo/light.md","lastUpdated":1775413032000}');
const _sfc_main = { name: "demo/light.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_LightWidget = resolveComponent("LightWidget");
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="light-widget" tabindex="-1">Light widget <a class="header-anchor" href="#light-widget" aria-label="Permalink to &quot;Light widget&quot;">​</a></h1>`);
  _push(ssrRenderComponent(_component_LightWidget, null, null, _parent));
  _push(`</div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("demo/light.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const light = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  light as default
};
