import bcrypt from 'bcrypt';
import { db } from '@vercel/postgres';
import { invoices, customers, revenue, users } from '../lib/placeholder-data';

/**
 * Represents a connection to the database client.
 * 
 * @constant
 * @type {any}
 * @async
 * @returns {Promise<any>} A promise that resolves to the database client connection.
 */
const client = await db.connect();

/**
 * Seeds the users table with initial data.
 * 
 * This function performs the following steps:
 * 1. Ensures the "uuid-ossp" extension is available in the database.
 * 2. Creates the "users" table if it does not already exist, with columns for id, name, email, and password.
 * 3. Inserts a list of users into the "users" table, hashing their passwords before insertion.
 *    If a user with the same id already exists, the insertion for that user is skipped.
 * 
 * @returns {Promise<any[]>} A promise that resolves to an array of the inserted users.
 */
async function seedUsers() {
  await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await client.sql`
  CREATE TABLE IF NOT EXISTS users (
       id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
       name VARCHAR(255) NOT NULL,
       email TEXT NOT NULL UNIQUE,
       password TEXT NOT NULL
     );
   `;

/**
 * Inserts a list of users into the database.
 * 
 * This function takes an array of user objects, hashes their passwords,
 * and inserts them into the `users` table in the database. If a user with
 * the same `id` already exists, the insertion is ignored.
 * 
 * @returns {Promise<any[]>} A promise that resolves to an array of results from the database insertion operations.
 */
const insertedUsers = await Promise.all(
     users.map(async (user) => {
       const hashedPassword = await bcrypt.hash(user.password, 10);
       return client.sql`
         INSERT INTO users (id, name, email, password)
         VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
         ON CONFLICT (id) DO NOTHING;
       `;
     }),
   );

   return insertedUsers;
 }

/**
 * Seeds the invoices table with initial data.
 * 
 * This function performs the following steps:
 * 1. Ensures the "uuid-ossp" extension is available in the database.
 * 2. Creates the "invoices" table if it does not already exist, with columns:
 *    - id: UUID, primary key, default value generated using uuid_generate_v4()
 *    - customer_id: UUID, not null
 *    - amount: INT, not null
 *    - status: VARCHAR(255), not null
 *    - date: DATE, not null
 * 3. Inserts a list of invoices into the "invoices" table, ignoring conflicts on the "id" column.
 * 
 * @returns {Promise<any[]>} A promise that resolves to an array of inserted invoices.
 */
 async function seedInvoices() {
   await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

   await client.sql`
     CREATE TABLE IF NOT EXISTS invoices (
       id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
       customer_id UUID NOT NULL,
       amount INT NOT NULL,
       status VARCHAR(255) NOT NULL,
       date DATE NOT NULL
     );
   `;

  /**
   * Inserts multiple invoices into the database.
   * 
   * This function uses a SQL `INSERT` statement to add invoices to the `invoices` table.
   * If an invoice with the same `id` already exists, the `ON CONFLICT` clause ensures that
   * the existing record is not overwritten.
   * 
   * @returns {Promise<any[]>} A promise that resolves to an array of the inserted invoices.
   */
   const insertedInvoices = await Promise.all(
     invoices.map(
       (invoice) => client.sql`
         INSERT INTO invoices (customer_id, amount, status, date)
         VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
         ON CONFLICT (id) DO NOTHING;
       `,
     ),
   );

   return insertedInvoices;
 }

/**
 * Seeds the customers table with initial data.
 * 
 * This function performs the following steps:
 * 1. Ensures the "uuid-ossp" extension is available in the database.
 * 2. Creates the "customers" table if it does not already exist, with columns for id, name, email, and image_url.
 * 3. Inserts a list of customers into the "customers" table, ignoring conflicts on the id column.
 * 
 * @returns {Promise<any[]>} A promise that resolves to an array of the inserted customers.
 */
 async function seedCustomers() {
   await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

   await client.sql`
     CREATE TABLE IF NOT EXISTS customers (
       id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
       name VARCHAR(255) NOT NULL,
       email VARCHAR(255) NOT NULL,
       image_url VARCHAR(255) NOT NULL
     );
   `;

  /**
   * Inserts multiple customers into the database.
   * 
   * This function uses a SQL `INSERT` statement to add each customer to the `customers` table.
   * If a customer with the same `id` already exists, the insertion is ignored due to the `ON CONFLICT (id) DO NOTHING` clause.
   * 
   * @returns {Promise<any[]>} A promise that resolves to an array of results from the database insertion operations.
   */
   const insertedCustomers = await Promise.all(
     customers.map(
       (customer) => client.sql`
         INSERT INTO customers (id, name, email, image_url)
         VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
         ON CONFLICT (id) DO NOTHING;
       `,
     ),
   );

   return insertedCustomers;
 }

/**
 * Seeds the revenue data into the database.
 * 
 * This function creates a `revenue` table if it does not already exist,
 * with columns for `month` and `revenue`. It then inserts the revenue data
 * into the table, ensuring that duplicate entries for the same month are not created.
 * 
 * @returns {Promise<any[]>} A promise that resolves to an array of the inserted revenue data.
 */
 async function seedRevenue() {
   await client.sql`
     CREATE TABLE IF NOT EXISTS revenue (
       month VARCHAR(4) NOT NULL UNIQUE,
       revenue INT NOT NULL
     );
   `;

  /**
   * Inserts revenue data into the database.
   * 
   * This function uses a SQL query to insert multiple revenue records into the `revenue` table.
   * If a conflict occurs (i.e., a record with the same month already exists), the insertion for that record is skipped.
   * 
   * @returns {Promise<any[]>} A promise that resolves when all insertions are complete.
   */
   const insertedRevenue = await Promise.all(
     revenue.map(
       (rev) => client.sql`
         INSERT INTO revenue (month, revenue)
         VALUES (${rev.month}, ${rev.revenue})
         ON CONFLICT (month) DO NOTHING;
       `,
     ),
   );

   return insertedRevenue;
 }

/**
 * Handles the GET request to seed the database with initial data.
 * 
 * This function performs the following steps:
 * 1. Begins a SQL transaction.
 * 2. Seeds the users table.
 * 3. Seeds the customers table.
 * 4. Seeds the invoices table.
 * 5. Seeds the revenue table.
 * 6. Commits the transaction if all seeding operations are successful.
 * 
 * If any error occurs during the seeding process, the transaction is rolled back
 * and an error response is returned.
 * 
 * @returns {Promise<Response>} A JSON response indicating the success or failure of the seeding operation.
 */
export async function GET() {
    try {
     await client.sql`BEGIN`;
     await seedUsers();
     await seedCustomers();
     await seedInvoices();
     await seedRevenue();
     await client.sql`COMMIT`;

     return Response.json({ message: 'Database seeded successfully' });
   } catch (error) {
     await client.sql`ROLLBACK`;
     return Response.json({ error }, { status: 500 });
   }
}
