// Виды, живущие в модальном слое MenuDialog (меню, статистика, лобби).
// Игровой вид (Фаза 3+) сюда не входит: при нём диалог скрыт и виден
// только игровой слой. Отдельный модуль, т.к. <script setup> запрещает
// ES-экспорты, а константа нужна и диалогу, и App.vue (inert слоя игры).
export const MENU_DIALOG_VIEWS: ReadonlySet<string> = new Set([
  'main',
  'mode',
  'opponent',
  'settings',
  'rules',
])
