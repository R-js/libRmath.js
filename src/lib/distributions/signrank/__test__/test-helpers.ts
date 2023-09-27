export function ms(ms: number): string {
    //years
    const years = Math.trunc(ms / 31536000000);
    const months = Math.trunc((ms - years * 31536000000) / 2592000000);
    const days = Math.trunc((ms - years * 31536000000 - months * 2592000000) / 86400000);
    const hours = Math.trunc((ms - years * 31536000000 - months * 2592000000 - days * 86400000) / 3600e3);
    const mins = Math.trunc((ms - years * 31536000000 - months * 2592000000 - days * 86400000 - hours * 3600e3) / 60e3);
    const sec = Math.trunc(
        (ms - years * 31536000000 - months * 2592000000 - days * 86400000 - hours * 3600e3 - mins * 60e3) / 1000
    );
    const millis = ms % 1000;
    const text: string[] = [];
    if (years) {
        text.push(`${years} years`);
    }
    if (months) {
        text.push(`${months} months`);
    }
    if (days) {
        text.push(`${days} days`);
    }
    if (hours) {
        text.push(`${hours} hours`);
    }
    if (mins) {
        text.push(`${mins} minutes`);
    }
    if (sec) {
        text.push(`${sec} seconds`);
    }
    if (millis) {
        text.push(`${millis} ms`);
    }
    return text.join(',');
}
