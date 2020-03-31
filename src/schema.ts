import { nexusPrismaPlugin } from 'nexus-prisma'
import { objectType, makeSchema, queryType, mutationType } from 'nexus';

const Mutation = mutationType({
  definition(t) {
    t.crud.upsertOneTag();
  }
});

const Query = queryType({
  definition(t) {
    t.crud.tags();
  }
});

const Tag = objectType({
  name: "Tag",
  definition(t) {
    t.id("id", { nullable: false });
    t.string("slug");
    // t.model.todos();
  }
});

const Todo = objectType({
  name: "Todo",
  definition(t) {
    t.id("id", { nullable: false });
    t.string("name");
    t.string("description");
    // t.model.tags();
  }
});

export const schema = makeSchema({
  types: [Query, Mutation, Tag, Todo],
  plugins: [nexusPrismaPlugin()],
  outputs: {
    schema: __dirname + '/../schema.graphql',
    typegen: __dirname + '/generated/nexus.ts',
  },
  typegenAutoConfig: {
    contextType: 'Context.Context',
    sources: [
      {
        source: '@prisma/client',
        alias: 'prisma',
      },
      {
        source: require.resolve('./context'),
        alias: 'Context',
      },
    ],
  },
});
