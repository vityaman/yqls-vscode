# YQLS Language Server Testing Guide

## Исправленные проблемы

### 1. Go to Definition (F12)
Полностью переписана функция `findSymbolAtPosition` в `yqlsSymbolTable.ts`:
- Корректно находит определения переменных при клике на их использование
- Добавлена поддержка поиска по ссылкам (references)
- Реализован поиск вверх по цепочке scope'ов

### 2. Symbol Collection для S-expression синтаксиса
Полностью переписан `symbolCollector.ts` для работы с S-expression (Lisp-подобным) синтаксисом YQLS:
- Реализована обработка `list` узлов как основных конструкций
- Добавлена обработка команд `declare` и `let` для объявления переменных
- Реализован метод `handleIdentifierReferences` для отслеживания всех использований переменных с префиксом `$`
- Добавлены вспомогательные методы для навигации по AST:
  - `getFirstElement` - получение первого элемента списка
  - `getElements` - получение всех элементов списка
  - `getIdentFromElement` - извлечение идентификатора из элемента
  - `extractTypeInfo` - извлечение информации о типе
- Реализована проверка `isSameLocation` чтобы не добавлять определение в список ссылок

## Структура YQLS (S-expression синтаксис)

YQLS использует S-expression синтаксис (как Lisp), где:
- Все конструкции заключены в скобки: `(command arg1 arg2 ...)`
- Переменные начинаются с `$`: `$my_variable`
- Строки начинаются с `'`: `'"string_value"`

### Основные конструкции:

```yqls
# Объявление переменных
(declare $variable_name (DataType Type))
(declare $my_var (DataType String))
(declare $my_list (ListType (DataType String)))

# Присваивание
(let $result (expression))

# Блоки
(block '(
  (let $temp (expression))
  (return $temp)
))

# Фильтрация
(Filter $source (== (Member '"column") $value))

# Агрегация
(Aggregate $data
  '(('"group_col" (Member '"column")))
  '(('"count" (Count)))
)
```

## Тестовые файлы

### test.yqls
Базовый пример с объявлением переменных через `declare` и `let`, использованием в фильтрах и структурах.

### examples/basic.yqls
Пример с:
- Объявлением параметров разных типов (String, Date, Int64)
- Фильтрацией данных с использованием переменных
- Агрегацией с группировкой
- Записью результата

### examples/advanced.yqls
Продвинутый пример с:
- Списковыми типами (ListType)
- Множественными блоками и промежуточными переменными
- Сложными условиями фильтрации (And, Between, In)
- Агрегатными функциями (Count, Sum, Avg, Min, Max)
- Сортировкой результатов

## Как тестировать

1. **Запустите Language Server:**
   ```bash
   cd server
   npm install
   npm run compile
   ```

2. **Откройте тестовый файл в VSCode:**
   - Откройте `test.yqls` или любой файл из `examples/`

3. **Проверьте Go to Definition:**
   - Поместите курсор на использование переменной (например, `$my_variable` внутри Filter или другой конструкции)
   - Нажмите F12 или Ctrl+Click (Cmd+Click на Mac)
   - Должен произойти переход к строке с `declare` или `let` этой переменной

4. **Проверьте Find All References:**
   - Поместите курсор на определение переменной (в строке с `declare` или `let`)
   - Нажмите Shift+F12
   - Должны показаться все места использования этой переменной

## Структура кода

```
server/src/symbolTable/
├── symbolTable.ts          # Интерфейс таблицы символов
├── symbol.ts               # Определение символа
├── scope.ts                # Определение области видимости
├── models/
│   ├── symbolKind.ts       # Типы символов
│   └── scopeType.ts        # Типы областей видимости
└── impls/
    ├── yqlsSymbolTable.ts  # Реализация таблицы символов
    └── symbolCollector.ts  # Сборщик символов из AST (S-expression)
```

## Основные методы

### YQLSSymbolTable
- `buildFromTree(tree)` - строит таблицу символов из AST
- `findSymbol(name, scope)` - находит символ по имени
- `findSymbolAtPosition(position)` - находит символ в позиции курсора (для Go to Definition)
- `addSymbol(symbol)` - добавляет символ в таблицу

### SymbolCollector (для S-expression)
- `collect(node)` - рекурсивно обходит AST и собирает символы
- `handleList(node)` - обрабатывает list узлы (основные конструкции)
- `handleDeclaration(node, command)` - обрабатывает `declare` и `let`
- `handleIdentifierReferences(node)` - находит все использования переменных
- `getFirstElement(listNode)` - получает первый элемент списка (команду)
- `getElements(listNode)` - получает все элементы списка
- `getIdentFromElement(elementNode)` - извлекает идентификатор из элемента

## Примеры использования в YQLS

### Объявление переменных
```yqls
(declare $string_var (DataType String))
(declare $int_var (DataType Int32))
(declare $date_var (DataType Date))
(declare $list_var (ListType (DataType String)))
```

### Использование переменных
```yqls
(let $result (Filter $source (== (Member '"id") $user_id)))
(Write! $output_table $result)
```

### Блоки с промежуточными переменными
```yqls
(let $result (block '(
  (let $temp (DataSource $input))
  (let $filtered (Filter $temp (condition)))
  (return $filtered)
)))
```

## Отладка

Если Go to Definition не работает:

1. Проверьте консоль VSCode (View -> Output -> выберите "Yqls Language Server")
2. Убедитесь, что переменные начинаются с `$`
3. Убедитесь, что синтаксис соответствует S-expression формату
4. Проверьте, что parse tree строится корректно (логи в консоли)