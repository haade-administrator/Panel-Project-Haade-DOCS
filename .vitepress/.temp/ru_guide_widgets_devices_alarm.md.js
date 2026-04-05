import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"alarm panel","description":"","frontmatter":{},"headers":[],"relativePath":"ru/guide/widgets/devices/alarm.md","filePath":"ru/guide/widgets/devices/alarm.md","lastUpdated":1775413032000}');
const _sfc_main = { name: "ru/guide/widgets/devices/alarm.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="alarm-panel" tabindex="-1">alarm panel <a class="header-anchor" href="#alarm-panel" aria-label="Permalink to &quot;alarm panel&quot;">​</a></h1></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("ru/guide/widgets/devices/alarm.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const alarm = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  alarm as default
};
