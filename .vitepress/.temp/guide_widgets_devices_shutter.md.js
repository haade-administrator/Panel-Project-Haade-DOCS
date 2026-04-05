import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"SHUTTER","description":"","frontmatter":{},"headers":[],"relativePath":"guide/widgets/devices/shutter.md","filePath":"guide/widgets/devices/shutter.md","lastUpdated":1775413032000}');
const _sfc_main = { name: "guide/widgets/devices/shutter.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="shutter" tabindex="-1">SHUTTER <a class="header-anchor" href="#shutter" aria-label="Permalink to &quot;SHUTTER&quot;">​</a></h1></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("guide/widgets/devices/shutter.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const shutter = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  shutter as default
};
