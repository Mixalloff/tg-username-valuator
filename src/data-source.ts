import { DataSource } from "typeorm";

export const dataSource = new DataSource({
  type: 'sqlite',
  database: 'db.sqlite',
  entities: [
    `${ __dirname }/entities/*.{js,ts}`,
  ],
  synchronize: true,
});
