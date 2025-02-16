import express, { Router } from 'express'
import colors from 'colors'
import cors from 'cors'
import { corsConfig } from '../config/cors';
import morgan from 'morgan';

interface Options {
  port?: number;
  routes: Router;
}

export class Server {

  public readonly app = express()
  private readonly port: number;
  private readonly routes: Router;

  constructor(options: Options) {
    const { port = 3100, routes } = options;
    this.port = port;
    this.routes = routes;
  }

  async start() {

    this.app.use(cors(corsConfig));

    this.app.use(morgan('dev'));

    //middlewares
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    //rutas
    this.app.use(this.routes);

    this.app.listen(this.port, () => {
      console.log(colors.cyan.bold(`Server is running on port ${this.port}`))
    })
  }
}
