import { ApolloServer } from 'apollo-server'
import { schema } from './schema'
import { createContext } from './context'

const port = Number(process.env.PORT) || 4000;

new ApolloServer({ schema, context: createContext }).listen(
  { port },
  () => {
    console.log(
      `🚀 Server ready at: http://localhost:${port}\n⭐️ See sample queries: http://pris.ly/e/ts/graphql-apollo-server#using-the-graphql-api`,
    );
  },
)
