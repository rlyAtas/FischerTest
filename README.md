# FischerTest

**Тип продукта:** веб- и мобильное приложение для подготовки к теоретической части экзамена `Fischereiprüfung` в земле Nordrhein-Westfalen (NRW).

## Требования

- Node.js 22.12 или выше;
- npm;
- PostgreSQL 16;

## Локальная установка

Сценарий для разработки на локальной машине.

Создайте PostgreSQL-базу.

```bash
git clone <repository-url>
cd FischerTest
cp .env.example .env
```

Заполните переменные окружения в `.env`.

```bash
npm ci
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

После запуска приложение доступно по адресу `http://localhost:3000`.

## Production-установка с нуля

Сценарий для первичного разворачивания production-сборки на сервере или в окружении деплоя.

Создайте PostgreSQL-базу.
Задайте переменные из `.env.example` в окружении деплоя до выполнения команд Prisma.

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

## Production-обновление

Сценарий для выкладки новой версии в уже развернутое production-окружение.

```bash
git pull
npm ci
npm run prisma:generate
npm run prisma:deploy
# Выполните, если изменились начальные данные или логика их загрузки
npm run prisma:seed
npm run build
npm prune --omit=dev
```

После обновления перезапустите приложение средствами вашего окружения деплоя.
