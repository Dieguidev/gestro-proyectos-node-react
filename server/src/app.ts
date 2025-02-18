import { envs } from './config';
import { MongoDatabase } from './data/mongodb';
import { Database } from './data/prisma/prisma-db';
import { AppRoutes } from './presentation/routes';
import { Server } from './presentation/server';

(() => {
  main();
})();

async function main() {
  // await MongoDatabase.connect({
  //   dbName: envs.MONGO_DB_NAME,
  //   mongoUrl: envs.MONGO_URL,
  // });

  await Database.connect();

  new Server({
    port: envs.PORT,
    routes: AppRoutes.routes,
  }).start();
}

// Manejo de cierre de conexiones ante termino de procesos en terminal
process.on('SIGINT', async () => {
  await Database.disconnect();
  process.exit(0);
});
