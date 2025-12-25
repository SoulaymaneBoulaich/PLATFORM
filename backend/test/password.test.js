const { validatePassword } = require('../utils/password');

describe('Password validator', () => {
    test('rejects short passwords', () => {
        const errors = validatePassword('Ab1!');
        expect(errors).toContain('Password must be at least 8 characters');
    });

    test('requires a number and special char', () => {
        const errors = validatePassword('abcdefgh');
        expect(errors).toContain('Password must contain at least one number');
        expect(errors).toContain('Password must contain at least one special character');
    });

    test('accepts valid password', () => {
        const errors = validatePassword('Passw0rd!');
        expect(errors.length).toBe(0);
    });

    test('handles non-string input', () => {
        const errors = validatePassword(null);
        expect(errors).toContain('Password must be a string');
    });
});