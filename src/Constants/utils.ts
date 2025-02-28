export const utils = {
    get_initial_contents: (text: string): string => {
        if (!text) return '';
        const cleanedText = text.trim().replace(/\s+/g, ' ').toLowerCase();
        const words = cleanedText.split(' ');
        const initials = words.map(word => {
            const sanitizedWord = word.replace(/[^a-zA-Z]/g, '');
            return sanitizedWord.length > 0 ? sanitizedWord.charAt(0).toUpperCase() : '';
        });
        return initials.filter(Boolean).join('');
    }
};
