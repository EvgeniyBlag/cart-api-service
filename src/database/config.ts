const {
    PG_HOST: host,
    PG_PORT: port,
    PG_DATABASE: database,
    PG_USER: user,
    PG_PASSWORD: password,
} = process.env;

export const databaseConfig = {
    host, port: Number(port), database, user, password
}