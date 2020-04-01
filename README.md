# Graphql Prisma2 Boilerplate

A great boilerplate to start your new graphql project.

## Development Setup

```shell
yarn install
yarn local:db:up
```

Wait until database is ready.

```shell
yarn local:migrate:up
yarn local
```

- `yarn install` - Install yarn dependencies
- `yarn local:db:up` - Create a new database (with docker-compose)
- `yarn local:migrate:up` - Send migrations to database (Create schema in the database)
- `yarn local` - Run local server // @TODO ~ put this inside docker compose with volume and nodemon
- `yarn uninstall` - Remove docker containers (then you can safely remove this folder)

## Example Queries

You can see a list of test queries to execute on graphql playground.

See [Example Queries](./docs/ExampleQueries.md)

## Tech stack

- Typescript
- Apollo Server (graphql) // @TODO ~ use graphql-yoga
- Nexus - Generate graphql's file `schema.graphql` from the nexus schema on `src/schema.ts`
- Docker compose - Right now it's only creating a new database // @TODO ~ put this server inside a container and create a volume

## Environment Variables

- `NODE_ENV=`local
- `MASTERKEY`=localmasterkey
- `PORT`=4001
- `DB_URL`=mysql://prisma:prisma@localhost:3310/workouts

> @TODO ~ If you define a masterkey, then you need to send it in the header of all requests to this graphql server. More details below on Masterkey Authentication.

## Manual Hooks

Somethings are not automatic. Here is what you need to do when you do what you do.

| When you... | Do this!
| --- | ---
| Change file: `prisma/schema.prisma` | Run `yarn local:migrate:save && yarn local:migrate:up`
| Change file: `local.yml` | Run `yarn local:db:up`

- `yarn local:migrate:save` - Update the folder prisma/migrations with the new schema definition on schema.prisma (`prisma2 migrate save --experimental`)
- `yarn local:migrate:up` - Sync database with the newly created migrations (`prisma2 migrate up --experimental`)
- `yarn local:db:up` - Roda o banco de dados local (via docker-compose)

## Masterkey Authentication

@TODO ~ Not implemented yet.

If you define a MASTERKEY env variable, then this string must be send to every API call.

Header:

```
X-Masterkey: XXXXXXX
```

> The masterkey config is located at `config/*.env`.

## Tags

> This project comes with a default schema with "tags". This allows you to immediately test your API and maybe you even like the initial schema and start building your software with tags...

A `Todo` may have as many tags as the client wants.

When you query `todos(tags:["tag1","tag2"]) { ... }` you need to send an array with tags. The todos must be related to **all the tags you send** (but it may have more).

If you pass an empty tags array, then all todos are returned.

## @TODO

- Steps to deploy in production
- Add seed todos
