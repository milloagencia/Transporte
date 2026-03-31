# Setup Instructions for Phase 0: Next.js + TypeScript + Prisma + Postgres via Docker Compose

## Prerequisites
- **Node.js**: Install the latest LTS version.
- **pnpm or npm**: Use either package manager.
- **Docker Desktop**: Make sure Docker is running on your machine.

## Steps to Run Docker Compose
1. Create a new Docker Compose file named `docker-compose.yml` in the root of your project:
    ```yaml
    version: "3.8"
    services:
      postgres:
        image: postgres:latest
        environment:
          POSTGRES_USER: user
          POSTGRES_PASSWORD: password
          POSTGRES_DB: mydatabase
        ports:
          - "5432:5432"
        volumes:
          - db_data:/var/lib/postgresql/data
    volumes:
      db_data:
    ```

2. Create a `.env` file in the project root with the following content:
    ```env
    DATABASE_URL=postgresql://user:password@localhost:5432/mydatabase
    AUTH_SECRET=your_auth_secret
    ```

3. Run Docker Compose:
   ```bash
   docker-compose up -d
   ```

4. Run Prisma migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   pnpm run dev  # or npm run dev
   ```

## Development Setup: Email Magic Link (No SMTP)
- Configure a magic link email provider that logs the links to the console instead of sending emails. Here’s how to simulate it:
  
```javascript
// Example code snippet to log magic link to console
app.post('/api/auth/magic-link', (req, res) => {
  const { email } = req.body;
  const magicLink = `http://localhost:3000/auth/verify?token=your_generated_token`;
  console.log(`Magic link for ${email}: ${magicLink}`);
  res.status(200).send('Magic link sent to console');
});
```

## Troubleshooting
- If you encounter issues, ensure that Docker is running and the Postgres container is up.
- Check the `.env` values for any typos.
- Ensure PostgreSQL is correctly set up and accessible via the provided connection string.
- Review your network settings if you have problems connecting to the database.
