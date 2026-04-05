import { resolveComponent, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"ESPHome Firmware Designer","description":"","frontmatter":{},"headers":[],"relativePath":"demo/index.md","filePath":"demo/index.md","lastUpdated":1775413032000}');
const _sfc_main = { name: "demo/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_HALogin = resolveComponent("HALogin");
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="esphome-firmware-designer" tabindex="-1">ESPHome Firmware Designer <a class="header-anchor" href="#esphome-firmware-designer" aria-label="Permalink to &quot;ESPHome Firmware Designer&quot;">​</a></h1>`);
  _push(ssrRenderComponent(_component_HALogin, null, null, _parent));
  _push(`</div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("demo/index.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  index as default
};
