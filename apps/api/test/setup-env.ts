import * as path from 'path';
import * as dotenv from 'dotenv';

// e2e tests always run against the dedicated test database (never the dev
// or seeded database) so they're free to truncate tables between tests.
dotenv.config({ path: path.resolve(__dirname, '../.env.test'), override: true });
