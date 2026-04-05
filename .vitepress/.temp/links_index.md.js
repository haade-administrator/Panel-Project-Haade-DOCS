import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"Useful Links","description":"","frontmatter":{},"headers":[],"relativePath":"links/index.md","filePath":"links/index.md","lastUpdated":1775415175000}');
const _sfc_main = { name: "links/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="useful-links" tabindex="-1">Useful Links <a class="header-anchor" href="#useful-links" aria-label="Permalink to &quot;Useful Links&quot;">​</a></h1><h2 id="home-assistant" tabindex="-1">Home Assistant <a class="header-anchor" href="#home-assistant" aria-label="Permalink to &quot;Home Assistant&quot;">​</a></h2><ul><li><a href="https://www.home-assistant.io/" target="_blank" rel="noreferrer">Official Website</a></li><li><a href="https://www.home-assistant.io/docs/" target="_blank" rel="noreferrer">Documentation</a></li><li><a href="https://community.home-assistant.io/" target="_blank" rel="noreferrer">Community</a></li><li><a href="https://github.com/home-assistant" target="_blank" rel="noreferrer">GitHub</a></li><li><a href="https://discord.gg/home-assistant" target="_blank" rel="noreferrer">Discord</a></li></ul><h2 id="development" tabindex="-1">Development <a class="header-anchor" href="#development" aria-label="Permalink to &quot;Development&quot;">​</a></h2><ul><li><a href="https://github.com/haade-administrator/Panel-Project-Haade" target="_blank" rel="noreferrer">Project GitHub</a></li></ul><h2 id="learning" tabindex="-1">Learning <a class="header-anchor" href="#learning" aria-label="Permalink to &quot;Learning&quot;">​</a></h2><ul><li><a href="https://esphome.io/" target="_blank" rel="noreferrer">ESPHome</a></li><li><a href="https://esphome.io/components/lvgl/" target="_blank" rel="noreferrer">ESPHome LVGL</a></li></ul><hr></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("links/index.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  index as default
};
