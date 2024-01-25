## Описание
Проект **Swarman** предназначен для запуска [Postman](https://www.postman.com/) сценариев с помощью библиотеки [newman](https://www.npmjs.com/package/newman) с последующий обработкой результатов для записи их в БД посредством CRUD сервиса [api-reporter-crud](https://gitlab-internal.wildberries.ru/swarm/testops/api-reporter-crud) и отображением результатов [frontend-test-ui](https://gitlab-internal.wildberries.ru/swarm/frontops/frontend-test-ui)

## Требования к сценарию
1. Сценарий пишется в инструменте Postman.
2. Одна коллекция - тесты для одног сервиса
3. Каждая ручка - отдельная папка. Запросы внутри папки - разные передаваемые данные в запросе 
3. Название каждого запроса должно содержать тег в квадратных скобках, по которому будут сгенерированы фильтры
4. Название каждого запроса не должно содержать символ ':'
5. Переменные коллекции должны содержать:

Название переменной | описание
--------------------|---------
HOST | адрес на который будут посылаться запросы
PORT | порт  на который будут посылаться запросы
sevriceName | название сервиса. *Не должно содержать символ ':'*
\^[a-zA-Z]+JsonSchema$ | переменные попадающие под такой шаблон хронят в себе json-схемы для проверки ответов

**Важно:** Значение переменных должно быть задано в столбце `init value`. Значение из столбца `current value` используется при запуске тестов из самого Postman. При экспорте коллекции ввиде json-файла в переменных лежат значения из столбца `init value`. Значения из столбца `current value` в экспортируемый  файл не попадают.

## json-файл сценария
1. Название json-файла со сценарием должно попадать под шаблон `\^[a-zA-Z]+.test-data$` и иметь расширение json
2. Файлы должны храниться `/src/data` (если класть внуть контейнера то `/usr/src/swarmman/build/data`)

## Настройки окружения

**Блок настрок соединения с api-report-crud**

`REPORTER_HOST` - адрес по которому распологается api-report-crud 

`REPORTER_PORT` - порт, который слушает сервис api-report-crud

`REPORTER_PROTOCOL`=http

**Настройка логгировая**

`LOG_TYPE` - настройка внешнего вида отображения логов. Доступные значения: json, pretty, hidden

`LOG_LVL` - уровень логгирования. Доступные значения:  DEBUG, INFO, ERROR

**Данные от GitLab CI\CD**

`PIPLINE_ID` - Номер пайплайна, который запустил тесты. Можно получить из предопределеной переменной GitLab CI\CD *CI_PIPELINE_ID*.

`JOB_ID` - Номер джобы, в которой запустились тесты. Можно получить из предопределеной переменной GitLab CI\CD *CI_JOB_ID*

`SRC_BRANCH` - ветка из которой был MR породивший запуск тестов Можно получить из предопределеной переменной GitLab CI\CD *CI_MERGE_REQUEST_SOURCE_BRANCH_NAME*

`COMMIT` - хэш коммита Можно получить из предопределеной переменной GitLab CI\CD *CI_COMMIT_SHORT_SHA*

`TAG` - таг версии тестируемого сервиса.

## Запуск в инфраструктуре wildberries

Шаблоны для запуска swarmman тестов лежат [swarmman template](https://gitlab-internal.wildberries.ru/swarm/swarmops/devops/ci/ci-templates/-/tree/main/swarmman)

1. Создать проект, который будет состоять из:
 * папка `data` c тестовыми файлами
 * файл .gitlab-ci.yml
2. Запуск тестов осуществляется 
 * перейти в Build -> Pipelines для проекта
 * нажать Run Pipeline
 * указать в переменной TAG тэг тестируемой версии продукта
 * нажать Run Pipeline

Пример gitlab-ci.yml
```yml
.template_repo: &repo
  project: &ci_tmpl 'swarm/swarmops/devops/ci/ci-templates'
  ref: &ci_tmpl_vers 'v1.0.0'
  
variables: 
  REPORTER_HOST: //адрес по которому распологается api-report-crud
  REPORTER_PORT: //порт, который слушает сервис api-report-crud
  REPORTER_PROTOCOL: http

include:
  - <<: *repo
    file: /swarmman/main.yml
  
stages:
  - test

```