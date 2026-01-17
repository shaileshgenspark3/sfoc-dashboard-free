export interface Quote {
    id: string;
    text: string;
    author: string;
}

export const MOTIVATIONAL_QUOTES: Quote[] = [
    { id: '1', text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
    { id: '2', text: "Fitness is not about being better than someone else. It’s about being better than you were yesterday.", author: "Khloe Kardashian" },
    { id: '3', text: "Discipline is doing what needs to be done, even if you don't want to do it.", author: "Unknown" },
    { id: '4', text: "Success starts with self-discipline.", author: "Unknown" },
    { id: '5', text: "Don't stop when you're tired. Stop when you're done.", author: "David Goggins" },
    { id: '6', text: "Your body can stand almost anything. It’s your mind that you have to convince.", author: "Unknown" },
    { id: '7', text: "The pain you feel today will be the strength you feel tomorrow.", author: "Arnold Schwarzenegger" },
    { id: '8', text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
    { id: '9', text: "Sweat is just fat crying.", author: "Unknown" },
    { id: '10', text: "If it doesn't challenge you, it doesn't change you.", author: "Fred DeVito" },
    { id: '11', text: "What seems impossible today will one day become your warm-up.", author: "Unknown" },
    { id: '12', text: "We are what we repeatedly do. Excellence then is not an act but a habit.", author: "Aristotle" },
    { id: '13', text: "You don't find needed time, you make it.", author: "Unknown" },
    { id: '14', text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
    { id: '15', text: "The difference between who you are and who you want to be is what you do.", author: "Unknown" }
];

export const getRandomQuote = (): Quote => {
    return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
};
