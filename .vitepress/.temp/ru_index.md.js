import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"","description":"","frontmatter":{"layout":"home","hero":{"name":"ESP32-S3 Display","text":"Firmware","tagline":"Руководство по установке и кастомизации","actions":[{"theme":"brand","text":"Начать","link":"/ru/guide/"},{"theme":"alt","text":"GitHub","link":"https://github.com/haade-administrator/Panel-Project-Haade"}]},"features":[{"icon":"🎨","title":"Красивые интерфейсы","details":"Создание современных UI с помощью LVGL"},{"icon":"⚡","title":"Быстрая настройка","details":"Простая конфигурация через ESPHome"},{"icon":"🏠","title":"Home Assistant","details":"Полная интеграция с умным домом"}]},"headers":[],"relativePath":"ru/index.md","filePath":"ru/index.md","lastUpdated":1775415175000}');
const _sfc_main = { name: "ru/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("ru/index.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  index as default
};
