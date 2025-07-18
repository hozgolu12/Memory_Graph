/* eslint-disable prettier/prettier */
export const config = {

  //Backend Configuration

  BACKEND_PORT: process.env.BACKEND_PORT || 3001,

  //Neo4j Configuration

  NEO4J_SCHEME: process.env.NEO4J_SCHEME || 'neo4j',
  NEO4J_HOST: process.env.NEO4J_HOST || 'localhost',
  NEO4J_PORT: process.env.NEO4J_PORT || 7687,
  NEO4J_USERNAME: process.env.NEO4J_USERNAME || 'neo4j',
  NEO4J_PASSWORD: process.env.NEO4J_PASSWORD || 'Golu@8678',

};
