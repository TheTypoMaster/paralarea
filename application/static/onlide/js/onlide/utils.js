
// Функция для диагностики
window.assert = function(condition, message){
    if(!condition){
        throw new Error(message || "проверка утверждения не пройдена");
    }
};

