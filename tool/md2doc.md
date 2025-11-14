# Функции

## Работа с коллекциями и последовательностями

### Right!
**Аргументы**:

| value |
| --- |
| Optional<T> |

**Возвращаемое значение**: T

Извлекает значение из `Optional`. Если значение отсутствует (`None`), вызывает ошибку выполнения.

```yqls
(let opt (Just (Int32 '42)))
(let val (Right! opt))  -- возвращает 42
```

---

### TakeWhileInclusive
**Аргументы**:

| collection | predicate |
| --- | --- |
| List<T> | Callable(T) -> Bool |

**Возвращаемое значение**: List<T>

Возвращает элементы с начала списка, пока `predicate` возвращает `True`, **включая первый элемент, для которого `predicate` стал `False`**.

```yqls
(let nums (AsList (Uint32 '1) (Uint32 '2) (Uint32 '3) (Uint32 '4) (Uint32 '5) (Uint32 '2)))
(let result (TakeWhileInclusive nums (lambda '(x) (< x (Uint32 '4)))))
-- результат: [1, 2, 3, 4]
```

---

### SkipWhileInclusive
**Аргументы**:

| collection | predicate |
| --- | --- |
| List<T> | Callable(T) -> Bool |

**Возвращаемое значение**: List<T>

Пропускает элементы с начала, пока `predicate` возвращает `True`, **включая первый элемент, для которого `predicate` вернул `False`**.

```yqls
(let nums (AsList (Uint32 '1) (Uint32 '2) (Uint32 '3) (Uint32 '4) (Uint32 '5) (Uint32 '6)))
(let result (SkipWhileInclusive nums (lambda '(x) (< x (Uint32 '4)))))
-- результат: [5, 6]
```

---

### FlatMap
**Аргументы**:

| collection | transformer |
| --- | --- |
| List<T> | Callable(T) -> List<R> |

**Возвращаемое значение**: List<R>

Применяет `transformer` к каждому элементу и объединяет результаты в один плоский список.

```yqls
(let lists (AsList
    (AsList (Uint32 '1) (Uint32 '2))
    (AsList (Uint32 '3))
    (AsList (Uint32 '4) (Uint32 '5))
))
(let result (FlatMap lists (lambda '(x) x)))
-- результат: [1, 2, 3, 4, 5]
```

---

### OrderedFlatMap
**Аргументы**:

| collection | transformer |
| --- | --- |
| List<T> | Callable(T) -> List<R> |

**Возвращаемое значение**: List<R>

Аналог `FlatMap`, но гарантирует **сохранение порядка** элементов даже при параллельной обработке.

```yqls
(let items (AsList (Uint32 '1) (Uint32 '2) (Uint32 '3)))
(let result (OrderedFlatMap items (lambda '(x)
    (AsList x (Add x (Uint32 '1)))
)))
-- результат: [1, 2, 2, 3, 3, 4]
```

---

### StaticMap
**Аргументы**:

| collection | mapping |
| --- | --- |
| List<T> | Dict<T, R> |

**Возвращаемое значение**: List<Optional<R>>

Преобразует каждый элемент по словарю. Если элемент отсутствует в словаре — результат `None`.

```yqls
(let keys (AsList (String 'Alice) (String 'Bob) (String 'Charlie)))
(let dict (AsDict
    (AsTuple (String 'Alice) (String 'A))
    (AsTuple (String 'Bob) (String 'B))
))
(let result (StaticMap keys dict))
-- результат: [Just("A"), Just("B"), None]
```

---

### StaticZip
**Аргументы**:

| collection1 | collection2 | ... |
| --- | --- | --- |
| List<T1> | List<T2> | ... |

**Возвращаемое значение**: List<Tuple<T1, T2, ...>>

Соединяет списки по индексам. Длина результата — по самому короткому.

```yqls
(let nums (AsList (Uint32 '1) (Uint32 '2) (Uint32 '3)))
(let letters (AsList (String 'a) (String 'b) (String 'c) (String 'd)))
(let result (StaticZip nums letters))
-- результат: [(1,"a"), (2,"b"), (3,"c")]
```

---

### Sort
**Аргументы**:

| collection | [comparator] |
| --- | --- |
| List<T> | Callable(T, T) -> Int |

**Возвращаемое значение**: List<T>

Сортирует список. Без `comparator` — по естественному порядку.

```yqls
(let unsorted (AsList (Int32 '3) (Int32 '1) (Int32 '4) (Int32 '1) (Int32 '5)))
(let sorted (Sort unsorted))
-- результат: [1, 1, 3, 4, 5]
```

С компаратором:

```yqls
(let points (AsList
    (AsStruct '('x (Int32 '3)) '('y (Int32 '4)))
    (AsStruct '('x (Int32 '1)) '('y (Int32 '2)))
))
(let sorted (Sort points (lambda '(a b)
    (let dx (Sub (Member a 'x) (Member b 'x)))
    (if (NotEqual dx (Int32 '0)) dx
        (Sub (Member a 'y) (Member b 'y))
    )
)))
```

---

### GroupByKey
**Аргументы**:

| collection | keySelector |
| --- | --- |
| List<T> | Callable(T) -> K |

**Возвращаемое значение**: Dict<K, List<T>>

Группирует элементы по ключу.

```yqls
(let people (AsList
    (AsStruct '('name (String 'Alice)) '('age (Uint32 '25)))
    (AsStruct '('name (String 'Bob)) '('age (Uint32 '25)))
    (AsStruct '('name (String 'Charlie)) '('age (Uint32 '30)))
))
(let grouped (GroupByKey people (lambda '(p) (Member p 'age))))
-- результат: {25: [...], 30: [...]}
```

---

### Fold
**Аргументы**:

| collection | initial | folder |
| --- | --- | --- |
| List<T> | R | Callable(R, T) -> R |

**Возвращаемое значение**: R

Свёртка слева.

```yqls
(let nums (AsList (Uint32 '1) (Uint32 '2) (Uint32 '3) (Uint32 '4)))
(let sum (Fold nums (Uint32 '0) (lambda '(acc x) (Add acc x))))
-- результат: 10
```

---

### CombineByKey
**Аргументы**:

| collection | createCombiner | mergeValue | mergeCombiners | keySelector |
| --- | --- | --- | --- | --- |
| List<T> | Callable(V) -> C | Callable(C, V) -> C | Callable(C, C) -> C | Callable(T) -> K |

**Возвращаемое значение**: Dict<K, C>

Обобщённая агрегация по ключам.

```yqls
(let data (AsList
    (AsTuple (String 'A) (Uint32 '1))
    (AsTuple (String 'B) (Uint32 '1))
    (AsTuple (String 'A) (Uint32 '1))
))
(let result (CombineByKey data
    (lambda '(v) (Uint32 '1))                    -- create
    (lambda '(c v) (Add c (Uint32 '1)))          -- merge value
    (lambda '(c1 c2) (Add c1 c2))                -- merge combiners
    (lambda '(x) (Nth x (Uint32 '0)))            -- key = первый элемент
))
-- результат: {"A": 2, "B": 1}
```

---

### Insert
**Аргументы**:

| collection | index | value |
| --- | --- | --- |
| List<T> | Uint32 | T |

**Возвращаемое значение**: List<T>

Вставляет значение по индексу.

```yqls
(let lst (AsList (Int32 '10) (Int32 '20) (Int32 '40)))
(let result (Insert lst (Uint32 '2) (Int32 '30)))
-- результат: [10, 20, 30, 40]
```

---

### Append
**Аргументы**:

| collection | value |
| --- | --- |
| List<T> | T |

**Возвращаемое значение**: List<T>

Добавляет элемент в конец.

```yqls
(let lst (AsList (Int32 '1) (Int32 '2) (Int32 '3)))
(let result (Append lst (Int32 '4)))
-- результат: [1, 2, 3, 4]
```

---

### ToOptional
**Аргументы**:

| value |
| --- |
| T |

**Возвращаемое значение**: Optional<T>

Оборачивает значение в `Optional`.

```yqls
(let opt (ToOptional (String 'hello)))
-- результат: Just("hello")
```

---

### Take
**Аргументы**:

| collection | count |
| --- | --- |
| List<T> | Uint32 |

**Возвращаемое значение**: List<T>

Берёт первые `count` элементов.

```yqls
(let nums (AsList (Int32 '1) (Int32 '2) (Int32 '3) (Int32 '4) (Int32 '5)))
(let head (Take nums (Uint32 '3)))
-- результат: [1, 2, 3]
```

---

### Extract
**Аргументы**:

| optionalValue |
| --- |
| Optional<T> |

**Возвращаемое значение**: T

Извлекает значение из `Optional`. Поведение как у `Right!` — падает, если `None`.

```yqls
(let opt (Just (Int32 '100)))
(let val (Extract opt)) -- возвращает 100
```

---

> **Примечание**:
> - Все функции возвращают **новые значения**, не изменяя исходные.
> - Коллекции — неизменяемые.
> - `lambda`, `AsList`, `AsStruct`, `AsDict`, `AsTuple`, `Member`, `Nth`, `Just`, `None` — стандартные конструкции YQLs.
> - Типы: `Uint32`, `Int32`, `String`, `Bool`, `Optional`, `List`, `Dict`, `Struct`, `Tuple` — поддерживаются напрямую.

---

## Работа с типами и данными

### CallableType
**Аргументы**:

| arg1_type | arg2_type | ... | return_type |
| --- | --- | --- | --- |
| Type | Type | ... | Type |

**Возвращаемое значение**: Type

Определяет тип вызываемого объекта (функции или лямбды), указывая типы его аргументов и возвращаемого значения.

```yqls
(let MyFuncType (CallableType (DataType 'String') (DataType 'Uint32') (DataType 'Bool')))
-- Определяет тип функции, которая принимает String, Uint32 и возвращает Bool
```

---

### DataType
**Аргументы**:

| type_name |
| --- |
| String |

**Возвращаемое значение**: Type

Создает объект типа из его строкового представления. Необходимо для явного указания типов в таких функциях, как `CallableType`.

```yqls
(let type_obj (DataType 'Int32'))
-- возвращает объект, представляющий тип Int32
```
---

### ListType
**Аргументы**:

| item_type |
| --- |
| Type |

**Возвращаемое значение**: Type

Создает тип списка для указанного типа элементов.

```yqls
(let string_list_type (ListType (DataType 'String')))
-- возвращает объект, представляющий тип List<String>
```

---

### String
**Аргументы**:

| literal |
| --- |
| Строковое значение |

**Возвращаемое значение**: String

Создает значение типа `String` из литерала.

```yqls
(let s (String 'hello world'))
-- результат: "hello world"
```

---

### Int32
**Аргументы**:

| literal |
| --- |
| Числовое значение |

**Возвращаемое значение**: Int32

Создает значение типа `Int32` (32-битное знаковое целое) из литерала.

```yqls
(let i (Int32 '-123'))
-- результат: -123
```

---

### AsList
**Аргументы**:

| item1 | item2 | ... |
| --- | --- | --- |
| T | T | ... |

**Возвращаемое значение**: List<T>

Создает список из переданных элементов. Все элементы должны быть одного типа.

```yqls
(let lst (AsList (Int32 '1') (Int32 '2') (Int32 '3')))
-- результат: [1, 2, 3]
```

---

### AsStruct
**Аргументы**:

| (key1, value1) | (key2, value2) | ... |
| --- | --- | --- |
| Tuple<String, T1> | Tuple<String, T2> | ... |

**Возвращаемое значение**: Struct

Создает структуру из пар `(ключ, значение)`. Ключи должны быть строковыми литералами.

```yqls
(let person (AsStruct
    '('name (String 'Alice))
    '('age (Uint32 '30'))
))
-- результат: {name: "Alice", age: 30}
```

---

## Работа с коллекциями и последовательностями (продолжение)

### Key
**Аргументы**:

| member_name1 | [member_name2] | ... |
| --- | --- | --- |
| Atom | Atom | ... |

**Возвращаемое значение**: Callable

Синтаксический сахар для создания лямбда-функции, извлекающей одно или несколько полей из структуры. Особенно полезен в `GroupByKey` и `Sort`.

```yqls
(let data (AsList
    (AsStruct '('city (String 'A)) '('val (Int32 '1)))
    (AsStruct '('city (String 'B)) '('val (Int32 '2)))
    (AsStruct '('city (String 'A)) '('val (Int32 '3)))
))
-- Группировка по полю 'city'
(let grouped (GroupByKey data (Key 'city)))
-- Эквивалентно: (GroupByKey data (lambda '(x) (Member x 'city)))
-- результат: {"A": [{city:"A", val:1}, {city:"A", val:3}], "B": [...]}
```

---

## Выполнение и вызовы

### Apply
**Аргументы**:

| callable | arg1 | arg2 | ... |
| --- | --- | --- | --- |
| Callable | T1 | T2 | ... |

**Возвращаемое значение**: R (возвращаемый тип `callable`)

Применяет `callable` к переданным аргументам `arg1`, `arg2`, ...

```yqls
(let my_add (lambda '(a b) (Add a b)))
(let result (Apply my_add (Int32 '5') (Int32 '10')))
-- результат: 15
```

---

## Определение функций и модулей

### ScriptUdf
**Аргументы**:

| language | function_name | callable_type | script_body |
| --- | --- | --- | --- |
| String | String | CallableType | String |

**Возвращаемое значение**: Callable

Создает пользовательскую функцию (UDF) из скрипта на другом языке (например, Python). Это позволяет выполнять сложную логику, которую трудно или невозможно выразить на чистом YQLs.

```yqls
(let py_split (ScriptUdf 'python
    'str_split                                         -- Имя функции в Python
    (CallableType (DataType 'String') (DataType 'String') (ListType (DataType 'String'))) -- Тип: (str, sep) -> List[str]
    (String '
def str_split(s, sep):
    return s.split(sep)
')))

(let result (Apply py_split (String "one,two,three") (String ",")))
-- результат: ["one", "two", "three"]
```

---

## Ввод/вывод и состояние

### DataSink
**Аргументы**:

| provider | cluster |
| --- | --- |
| String | String |

**Возвращаемое значение**: DataSink

Создает объект-приемник данных, который указывает, куда будут записаны результаты. Используется в связке с `Write!` и `Commit!`.

```yqls
(let my_sink (DataSink 'yt' 'my_cluster'))
-- Создает приемник для записи в YT кластер 'my_cluster'
```

---
### Commit!
**Аргументы**:

| world | sink | [options] |
| --- | --- | --- |
| World | DataSink | CommitOptions |

**Возвращаемое значение**: World

Фиксирует все отложенные операции записи для указанного `sink`. Это действие с побочным эффектом, которое изменяет состояние внешнего мира.

```yqls
(let world (Commit! world my_sink (CommitOptions)))
-- Фиксирует изменения для приемника 'my_sink', возвращая новое состояние 'world'
```

---

### ResFill!
**Аргументы**:

| world | tag_name | value |
| --- | --- | --- |
| World | String | T |

**Возвращаемое значение**: World

Записывает `value` в именованный "ресурсный тег". Это простой способ передать скалярный результат вычисления из YQL-скрипта во внешнюю систему без использования полноценной таблицы для вывода.

```yqls
(let world (ResFill! world (String 'my_result_tag') (String 'Computation finished successfully')))
-- Записывает строку в ресурсный тег "my_result_tag"
```
