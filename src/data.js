

const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api';

export function initData() {
    // переменные для кеширования данных
    let sellers;
    let customers;
    let lastResult;
    let lastQuery;

// функция для приведения строк в тот вид, который нужен нашей таблице
    const mapRecords = (data) => data.map(item => ({
        id: item.receipt_id,
        date: item.date,
        seller: sellers[item.seller_id],
        customer: customers[item.customer_id],
        total: item.total_amount
    }));

// функция получения индексов
    const getIndexes = async () => {
        if (!sellers || !customers) { // если индексы ещё не установлены, то делаем запросы
            [sellers, customers] = await Promise.all([ // запрашиваем и деструктурируем в уже объявленные ранее переменные
                fetch(`${BASE_URL}/sellers`).then(res => res.json()), // запрашиваем продавцов
                fetch(`${BASE_URL}/customers`).then(res => res.json()), // запрашиваем покупателей
            ]);
        }

        return { sellers, customers };
    }

// функция получения записей о продажах с сервера
    const getRecords = async (query, isUpdated = false) => {
        try {
            const qs = new URLSearchParams(query);
            const nextQuery = qs.toString();

            if (lastQuery === nextQuery && !isUpdated) {
                return lastResult;
            }

            const response = await fetch(`${BASE_URL}/records?${nextQuery}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const records = await response.json();

            // Валидация ответа сервера
            const safeTotal = typeof records.total === 'number' ? records.total : 0;
            const safeItems = Array.isArray(records.items) ? records.items : [];

            lastQuery = nextQuery;
            lastResult = {
                total: safeTotal,
                items: mapRecords(safeItems)
            };

            return lastResult;
        } catch (error) {
            console.error('Ошибка загрузки записей:', error);
            return {
                total: 0,
                items: []
            };
        }
    };


    return {
        getIndexes,
        getRecords
    };
}