 export const validDNI = (dni: string) => {
    const dniRegex = /^\d{8}[A-Za-z]$/;
    return dniRegex.test(dni);
}

export const validEmail = (email: string) => {
    const emailRegex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

export const validPhone = (phone: string) => {
    const phoneRegex = /^[6789]\d{8}$/;
    return phoneRegex.test(phone);
};
