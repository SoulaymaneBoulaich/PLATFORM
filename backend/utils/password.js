function validatePassword(password) {
    const errors = [];
    if (!password || typeof password !== 'string') {
        errors.push('Password must be a string');
        return errors;
    }

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters');
    }
    if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }
    return errors;
}

module.exports = { validatePassword };