import { schema } from 'nexus-future';

schema.mutationType({
  definition(t) {
    t.crud.upsertOneTag();

    t.field('createTodo', {
      type: "Todo",
      description: "Create a new todo entry",
      args: {
        name: schema.stringArg({ required: true }),
        tags: schema.stringArg({
          list: true,
          required: true
        }),
      },
      async resolve(_, args, ctx) {
        const name = args.name;
        const tagsIds = [];

        for (let tagslug of args.tags) {
          const tag = await ctx.db.tag.upsert({
            where: {
              slug: tagslug,
            },
            create: {
              slug: tagslug,
            },
            update: {
              slug: tagslug,
            }
          });
          // The connect param below accepts an array of
          // objects like [{ id: 1 }, { id: 2 }]
          tagsIds.push({ id: tag.id });
        }

        const todo = await ctx.db.todo.create({
          data: {
            name,
            tags: {
              connect: tagsIds,
            }
          }
        });

        return todo;
      },
    });
  }
});

schema.queryType({
  definition(t) {
    t.crud.tags();

    t.field('todos', {
      type: "Todo",
      list: true,
      args: {
        tags: schema.stringArg({
          nullable: false,
          list: [true],
        }),
      },
      async resolve(_, { tags }: any, ctx) {
        const where = {
          AND: [],
        };

        if (tags && tags.length) {
          where.AND = tags.map((slug: string) => ({
            tags: {
              some: { slug }
            }
          }
          ));
        }

        return await ctx.db.todo.findMany({
          where,
        });
      }
    });
  }
});

schema.objectType({
  name: "Tag",
  definition(t) {
    t.id("id", { nullable: false });
    t.string("slug");
    t.model.todos();
  }
});

schema.objectType({
  name: "Todo",
  definition(t) {
    t.id("id", { nullable: false });
    t.string("name");
    t.model.tags();
  }
});
