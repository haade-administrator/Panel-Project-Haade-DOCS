import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"MEDIA PLAYER","description":"","frontmatter":{},"headers":[],"relativePath":"ru/guide/widgets/devices/media.md","filePath":"ru/guide/widgets/devices/media.md","lastUpdated":1775413032000}');
const _sfc_main = { name: "ru/guide/widgets/devices/media.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="media-player" tabindex="-1">MEDIA PLAYER <a class="header-anchor" href="#media-player" aria-label="Permalink to &quot;MEDIA PLAYER&quot;">​</a></h1></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("ru/guide/widgets/devices/media.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const media = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  media as default
};
