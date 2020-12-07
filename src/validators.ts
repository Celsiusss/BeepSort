export const validateNumber = (value: string | number, min = 0, max = Infinity): boolean => {
    const number = Number(value);
    return number >= min && number <= max;
}
