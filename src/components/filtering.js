export function initFiltering(elements) {
  const updateIndexes = (elements, indexes) => {
    Object.keys(indexes).forEach((elementName) => {
      elements[elementName].append(
        ...Object.values(indexes[elementName]).map((name) => {
          const el = document.createElement("option");
          el.textContent = name;
          el.value = name;
          return el;
        })
      );
    });
  };

  const applyFiltering = (query, state, action) => {
    // код с обработкой очистки поля
    if (action) {
      const button = action.target || action;
      if (button && button.name === "clear") {
        const fieldName = button.getAttribute("data-field"); // "date" или "customer"
        // ищем ближайший контейнер фильтра и внутри него input/select
        let filterWrapper = button.parentElement;
        // на всякий случай поднимемся до ближайшей колонки, если в filterWrapper не нашли
        const input =
          (filterWrapper && filterWrapper.querySelector && filterWrapper.querySelector("input, select")) ||
          (button.closest && button.closest(".table-column") && button.closest(".table-column").querySelector("input, select"));
        if (input) {
          input.value = ""; // сбрасываем значение поля
        }
        // синхронизируем state: сбрасываем значение в состоянии
        if (fieldName && state && typeof state === "object") {
          if (
            state.filters && Object.prototype.hasOwnProperty.call(state.filters, fieldName)
          ) {
            state.filters[fieldName] = "";
          } else {
            state[fieldName] = "";
          }
        }
      }
    }

    // @todo: #4.5 — отфильтровать данные, используя компаратор
    const filter = {};
    Object.keys(elements).forEach((key) => {
      if (elements[key]) {
        if (
          ["INPUT", "SELECT"].includes(elements[key].tagName) &&
          elements[key].value
        ) {
          // ищем поля ввода в фильтре с непустыми данными
          filter[`filter[${elements[key].name}]`] = elements[key].value; // чтобы сформировать в query вложенный объект фильтра
        }
      }
    });

    return Object.keys(filter).length
      ? Object.assign({}, query, filter)
      : query; // если в фильтре что-то добавилось, применим к запросу
  };

  return {
    updateIndexes,
    applyFiltering,
  };
}
