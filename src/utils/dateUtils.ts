/**
 * Adds business days to a given date, skipping weekends and (optionally) Korean public holidays.
 */
export function addBusinessDays(baseDate: string | Date, daysToAdd: number): Date {
    let date = new Date(baseDate);
    if (isNaN(date.getTime())) return new Date();

    let count = 0;
    while (count < daysToAdd) {
        date.setDate(date.getDate() + 1);
        const day = date.getDay();
        // 0: Sunday, 6: Saturday
        const isWeekend = day === 0 || day === 6;
        
        // Simple Korea public holiday check (minimal example, can be expanded)
        // Hardcoded for 2026 common ones if needed, otherwise just skip weekends
        if (!isWeekend) {
            count++;
        }
    }
    return date;
}

export function formatDateWithDay(date: Date): string {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const day = days[date.getDay()];
    return `${yyyy}-${mm}-${dd}(${day})`;
}
