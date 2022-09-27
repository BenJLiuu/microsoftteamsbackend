import { authRegisterV1 } from './auth';
import { clearV1 } from './other';

  test('Test only invalid email', () => {
    expect(authRegisterV1('@bob@.org.org', 'pass123', 'Bob', 'Smith')).toEqual({ error: 'Invalid Email Address.' });
    });
    
    test('Test only email already in use', () => {
      expect(authRegisterV1('mitchellemail@gmail.com', 'pass123', 'Bob', 'Smith')).toEqual({ error: 'Email Already in Use.' });
      });
      
    test('Test only password too short', () => {
      expect(authRegisterV1('bobsmith@gmail.com', 'abc3', 'Bob', 'Smith')).toEqual({ error: 'Password too Short.' });
      });
      
    test('Test only first name too long', () => {
      expect(authRegisterV1('bobsmith@gmail.com', 'pass123', 'Bobbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', 'Smith')).toEqual({ error: 'Invalid First Name.' });
      });
      
    test('Test only first name too short', () => {
      expect(authRegisterV1('bobsmith@gmail.com', 'pass123', '', 'Smith')).toEqual({ error: 'Invalid First Name.' });
      });
      
    test('Test only last name too long', () => {
      expect(authRegisterV1('bobsmith@gmail.com', 'pass123', 'Bob', 'Smithhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh')).toEqual({ error: 'Invalid Last Name' });
      });
      
    test('Test only last name too short', () => {
      expect(authRegisterV1('bobsmith@gmail.com', 'pass123', 'Bob', '')).toEqual({ error: 'Invalid Last Name' });
      });
