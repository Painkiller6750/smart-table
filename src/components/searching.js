export function initSearching(searchField, fieldName = "search") {
  return (query, state, action) => {
    // result заменили на query
    return state[fieldName]
      ? Object.assign({}, query, {
          // проверяем, что в поле поиска было что-то введено
          search: state[fieldName], // устанавливаем в query параметр
        })
      : query; // если поле с поиском пустое, просто возвращаем query без изменений
  };
}
