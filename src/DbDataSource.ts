import { DataSource } from "typeorm";

export const dbDataSource = new DataSource({
  type: 'sqlite',
  database: 'db.sqlite',
  entities: [
    `${ __dirname }/entities/*.{js,ts}`,
  ],
  synchronize: true,
});
