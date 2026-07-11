# FischerTest

**Тип продукта:** веб- и мобильное приложение для подготовки к теоретической части экзамена `Fischereiprüfung` в Германии.

**Рабочее название:** `FischerTest`

**Варианты названия:** `Angelschein`, `AngelscheinTest`, `AngelTest`

## Цель проекта

Создать сервис, который помогает пользователям готовиться к экзамену на рыболовный билет в Германии через тесты, режим симуляции экзамена, обучение по темам, повторение ошибок и отслеживание прогресса.

Продукт должен быть понятным, быстрым, современным и полезным как для носителей немецкого языка, так и для мигрантов.

## Задачи проекта

Сервис должен:

- обучать теории по темам экзамена;
- давать доступ к базе вопросов;
- проводить пробный экзамен;
- показывать ошибки;
- адаптировать обучение под слабые места пользователя;
- позволять пользователям повторять выборочные вопросы;
- сохранять прогресс;
- поддерживать только землю NRW;
- поддерживать немецкий язык интерфейса/учебных данных и переводы интерфейса/учебных данных на английский и русский.

## Целевая аудитория

Основная аудитория:

- пользователи, готовящиеся к `Fischereiprüfung`;
- мигранты и иностранцы, которым нужен более понятный формат обучения.

## Статус проекта

Проект находится на этапе MVP. Сейчас подготовлены технический каркас, Prisma-схема, миграции и seed начальных данных.

Актуальный рабочий план хранится в `.temp/plan.md`.
Технический долг, отложенные решения и замечания к будущим улучшениям хранятся в `.temp/tech-debt.md`.
Временные планы, черновики и промежуточные заметки по разработке хранятся в `.temp/`.

## Стек технологий

**Runtime:** Node.js 22.12+

**Backend:** Next.js 16.2, TypeScript 5.9, PostgreSQL 16, Prisma 7.8

**Frontend:** React 19.2, Next.js 16.2, Mantine UI 9.1

**Инструменты:** Biome 2.2, Vitest 4.1, tsx 4.22

## Требования

- Node.js 22.12 или выше;
- npm;
- PostgreSQL 16;
- доступная локальная или удаленная база данных PostgreSQL.

## Переменные окружения

**DATABASE_URL** для подключения к PostgreSQL, используется Prisma Client, миграциями и seed.

Пример формата:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/fischer_test"
```

## Проверки

Проверка типов:

```bash
npm run typecheck
```

Линтинг и форматирование:

```bash
npm run lint
```

Тесты:

```bash
npm run test
```

Production-сборка:

```bash
npm run build
```

## Локальная установка

Сценарий для разработки на локальной машине.

```bash
git clone <repository-url>
cd FischerTest
cp .env.example .env
npm ci
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

После команды `cp .env.example .env` заполните `DATABASE_URL` в `.env`.

Перед выполнением миграций создайте PostgreSQL-базу любым удобным способом.

После запуска приложение доступно по адресу `http://localhost:3000`.

## Production-установка с нуля

Сценарий для первичного разворачивания production-сборки на сервере или в окружении деплоя.

```bash
git clone <repository-url>
cd FischerTest
npm ci
npm run prisma:generate
npm run prisma:deploy
npm run prisma:seed
npm run build
npm prune --omit=dev
npm start
```

Перед запуском задайте production-значение `DATABASE_URL` в переменных окружения деплоя.

## Production-обновление

Сценарий для выкладки новой версии в уже развернутое production-окружение.

```bash
git pull
npm ci
npm run prisma:generate
npm run prisma:deploy
npm run build
npm prune --omit=dev
npm start
```

Используйте `npm run prisma:seed` отдельно при изменении начальных справочников, банка вопросов, переводов или логики наполнения данных.


## Документация

- `documentation/data-model.md` — сущности и связи;
- `documentation/business-rules.md` — бизнес-правила тренировок и прогресса;
- `documentation/exam-rules.md` — правила экзамена NRW;
- `documentation/auth-and-user-states.md` — авторизация и пользовательские состояния;
- `documentation/pages.md` — основные экраны;
- `SOURCES.md` — источники данных и дисклеймеры.
