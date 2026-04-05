import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"ON_OFF LIGHTS","description":"","frontmatter":{},"headers":[],"relativePath":"ru/guide/widgets/light/onoff.md","filePath":"ru/guide/widgets/light/onoff.md","lastUpdated":1775413032000}');
const _sfc_main = { name: "ru/guide/widgets/light/onoff.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="on-off-lights" tabindex="-1">ON_OFF LIGHTS <a class="header-anchor" href="#on-off-lights" aria-label="Permalink to &quot;ON_OFF LIGHTS&quot;">​</a></h1></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("ru/guide/widgets/light/onoff.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const onoff = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  onoff as default
};
