# Database Management 

This document summarizes the essential commands for interacting with the Postgres container.

## Prerequisites

* Docker must be installed and the container must be running.
* Replace `DB_USER`, `DB_PASSWORD`, `DB_NAME` and `DB_CONTAINER_ID` with your actual values.

## 1. Backup

To export your database into a compressed `.sql.gz` file:

```bash
docker exec -t DB_CONTAINER_ID sh -c 'PGPASSWORD=DB_PASSWORD pg_dump -U DB_USER DB_NAME' | gzip > linstant_gourmand_db-$(date +%Y%m%d-%H%M%S).sql.gz
```

## 2. Restore (Import a backup)

To import an existing `.sql.gz` file into the database:

```bash
PGPASSWORD='DB_PASSWORD' gunzip -c your_file.sql.gz | docker exec -i DB_CONTAINER_ID psql -U DB_USER -d DB_NAME
```

## 3. Execute a raw SQL file

If you have a standard `.sql` file (not compressed) and want to execute it directly against the database:

```bash
scp *.sql user@server-ip:path-on-server
cat your_script.sql | docker exec -i DB_CONTAINER_ID sh -c 'PGPASSWORD=DB_PASSWORD psql -U DB_USER -d DB_NAME'
```
