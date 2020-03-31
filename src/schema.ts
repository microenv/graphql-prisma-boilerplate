import { nexusPrismaPlugin } from 'nexus-prisma'
import { objectType, stringArg, arg, inputObjectType, makeSchema, queryType, mutationType, idArg } from 'nexus';
import { WorkoutWhereInput, Workout, WorkoutExerciseDeleteManyArgs } from '@prisma/client';
import NotFoundException from './exception/NotFoundException';

const Mutation = mutationType({
  definition(t) {
    t.crud.createOneWorkoutExercise();

    t.field("createWorkout", {
      type: Workout,
      args: {
        name: stringArg({ required: true }),
        tags: stringArg({
          list: true,
          required: true
        }),
        exercises: arg({
          type: CreateWorkoutExercise,
          list: [false],
        }),
      },
      async resolve(_, { name, tags, exercises }, ctx) {
        let tagsIds = [];

        for (let tagslug of tags) {
          const tg = await ctx.prisma.tag.upsert({
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
          tagsIds.push({ id: tg.id });
        }

        const work: Workout = await ctx.prisma.workout.create({
          data: {
            name,
            tags: {
              connect: tagsIds
            },
          },
        });

        if (!work) {
          throw new Error("Erro desconhecido, o treino não pôde ser criado");
        }

        console.log('Workout:: ', work, exercises);

        if (Array.isArray(exercises)) {
          for (let rawexe of exercises) {
            if (rawexe) {
              const exe = await ctx.prisma.workoutExercise.create({
                data: {
                  name: rawexe.name,
                  workout: {
                    connect: {
                      id: work.id
                    }
                  },
                },
              });
            }
          }
        }

        return work;
      },
    });

    t.field("updateWorkout", {
      type: Workout,
      args: {
        id: idArg({ required: true }),
        name: stringArg({ required: true }),
        exercises: arg({
          type: UpdateWorkoutExercise,
          list: [true],
        }),
      },
      async resolve(_, { id, name, exercises }, ctx) {
        const workoutId = Number(id);

        // # Pegar o workout com esse id
        const workout = await ctx.prisma.workout.findOne({
          where: { id: workoutId }
        });

        if (!workout) throw new NotFoundException();

        // persistExercisesIds tem os ids dos exercícios que precisam continuar
        const persistExercisesIds: number[] = [];
        const otherExercises: { id?: any, name: string }[] = [];

        // # Deletar todos os exercícios com ids diferentes dos que já tem
        if (Array.isArray(exercises)) {
          for (let exe of exercises) {
            if (exe.id) {
              persistExercisesIds.push(Number(exe.id));
            } else {
              otherExercises.push(exe);
            }
          }
        }

        try {
          // Todos os exercícios cujos ids não estejam na lista
          // E que pertençam ao workout
          const whereDelete: WorkoutExerciseDeleteManyArgs['where'] = {
            workout: {
              id: workoutId,
            },
          };

          if (persistExercisesIds.length) {
            whereDelete.id = {
              notIn: persistExercisesIds,
            };
          }

          await ctx.prisma.workoutExercise.deleteMany({
            where: whereDelete,
          });
        } catch (error) {
          // ~
        }

        // # Upsert no resto (update || create)
        for (let exe of otherExercises) {
          if (exe.id) {
            console.log('Update exercise: ', exe.name);
            // Atualizar exercício (pois ele já existe)
            await ctx.prisma.workoutExercise.update({
              // @QUESTION ~
              // Infelizmente nesse where não dá pra usar
              // o campo workout.id, tem como fazer funcionar?
              // @SECURITY_ISSUE ~
              // É possível editar exercício de outras pessoas
              // passando o id do exercício de outra pessoa
              where: {
                id: Number(exe.id),
              },
              data: {
                name: exe.name,
                // @WORKAROUND ~
                // Se ele tiver hackeando os exercícios de alguém
                // Esse exercício se torna dele
                // O efeito colateral é esse exercício sumir do treino dos outros
                // Mas é melhor que alterar pra outra pessoa
                workout: {
                  connect: {
                    id: workoutId
                  }
                }
              }
            });
          } else {
            // Criar um exercício novo
            await ctx.prisma.workoutExercise.create({
              data: {
                name: exe.name,
                workout: {
                  connect: {
                    id: workoutId
                  }
                }
              }
            });
          }
        }

        // # Dar update no workout
        await ctx.prisma.workout.update({
          where: {
            id: workoutId,
          },
          data: {
            name,
          },
        });

        // Retornar o workout
        return await ctx.prisma.workout.findOne({
          where: {
            id: workoutId,
          },
        }) as Workout;
      },
    })
  }
})

const Query = queryType({
  definition(t) {
    t.crud.tags();
    t.crud.workoutExercises();

    t.field('workouts', {
      type: "Workout",
      list: true,
      args: {
        tags: stringArg({
          nullable: false,
          list: true,
        }),
      },
      async resolve(_, { tags }: any, ctx) {
        const where: WorkoutWhereInput = {};
        if (tags && tags.length) {
          where.AND = tags.map((slug: string): WorkoutWhereInput => ({
            tags: {
              some: { slug }
            }
          }
          ));
        }
        return await ctx.prisma.workout.findMany({
          where,
        });
      }
    });
  }
})

const Tag = objectType({
  name: "Tag",
  definition(t) {
    t.id("id", { nullable: false })
    t.string("slug")
    t.model.workouts();
  }
})

const Workout = objectType({
  name: "Workout",
  definition(t) {
    t.id("id", { nullable: false })
    t.string("name")
    t.model.tags();
    t.model.exercises();
  }
})

const WorkoutExercise = objectType({
  name: "WorkoutExercise",
  definition(t) {
    t.id("id", { nullable: false })
    t.string("name")
    t.model.workout();
  }
})

const CreateWorkoutExercise = inputObjectType({
  name: "CreateWorkoutExercise",
  definition(t) {
    t.string("name", { required: true })
  }
});

const UpdateWorkoutExercise = inputObjectType({
  name: "UpdateWorkoutExercise",
  definition(t) {
    t.id("id", { required: false })
    t.string("name", { required: true })
  }
});


export const schema = makeSchema({
  types: [Query, Mutation, Tag, Workout, WorkoutExercise, CreateWorkoutExercise, UpdateWorkoutExercise],
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
})
