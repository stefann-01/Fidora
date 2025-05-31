// Import the initialization file to populate the database
import './db/init';

// Import your database functions
import { getAllClaims } from './funcs/claims';
import { getAllEvidence } from './funcs/evidence';
import { getAllUsers } from './funcs/users';

// Now you can use the database functions with populated data
console.log('Users in database:', getAllUsers().length);
console.log('Claims in database:', getAllClaims().length);
console.log('Evidence in database:', getAllEvidence().length);

// Your backend server code here... 