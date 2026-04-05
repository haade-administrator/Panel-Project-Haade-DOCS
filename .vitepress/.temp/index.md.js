import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"","description":"","frontmatter":{"layout":"home","hero":{"name":"ESP32-S3 Display","text":"Firmware","tagline":"Installation and customization guide","actions":[{"theme":"brand","text":"Get Started","link":"/guide/"},{"theme":"alt","text":"GitHub","link":"https://github.com/haade-administrator/Panel-Project-Haade"}]},"features":[{"icon":"🎨","title":"Beautiful Interfaces","details":"Creating modern UI with LVGL"},{"icon":"⚡","title":"Quick Setup","details":"Easy configuration through ESPHome"},{"icon":"🏠","title":"Home Assistant","details":"Full integration with smart home"}]},"headers":[],"relativePath":"index.md","filePath":"index.md","lastUpdated":1775415175000}');
const _sfc_main = { name: "index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("index.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  index as default
};
