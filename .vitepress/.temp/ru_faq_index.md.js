import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"Часто задаваемые вопросы (FAQ)","description":"","frontmatter":{},"headers":[],"relativePath":"ru/faq/index.md","filePath":"ru/faq/index.md","lastUpdated":1775415175000}');
const _sfc_main = { name: "ru/faq/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="часто-задаваемые-вопросы-faq" tabindex="-1">Часто задаваемые вопросы (FAQ) <a class="header-anchor" href="#часто-задаваемые-вопросы-faq" aria-label="Permalink to &quot;Часто задаваемые вопросы (FAQ)&quot;">​</a></h1><p>Этот раздел создан для того, чтобы получить ответы на популярные вопросы.</p><h2 id="не-нашли-ответ" tabindex="-1">Не нашли ответ? <a class="header-anchor" href="#не-нашли-ответ" aria-label="Permalink to &quot;Не нашли ответ?&quot;">​</a></h2><p>Если вы не нашли решение своей проблемы в данном разделе:</p><ul><li>📖 Обратитесь к <a href="/Panel-Project-Haade-DOCS/ru/guide/">документации</a></li><li>🙏 Посмотрите ответы в <a href="https://github.com/haade-administrator/Panel-Project-Haade/discussions/categories/q-a" target="_blank" rel="noreferrer">репозитории</a></li><li>💬 Задайте вопрос в <a href="https://github.com/haade-administrator/Panel-Project-Haade/discussions/categories/general" target="_blank" rel="noreferrer">Discussions</a></li></ul></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("ru/faq/index.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  index as default
};
