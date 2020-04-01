import { server, settings } from 'nexus-future';

async function main() {
  const port = Number(process.env.PORT || 3500);

  settings.change({
    server: {
      port,
      playground: true,
    },
  });

  // console.log(`🚀 Server ready at: http://localhost:${port} ⭐️`);
}

main();
