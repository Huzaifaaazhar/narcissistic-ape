import { rng } from './rng'

export type QuizCategory = 'pop' | 'cinema' | 'sport' | 'gk' | 'campus'
export type QuizKind = 'mc' | 'year' | 'tf'

export type QuizQuestion = {
  id: string
  cat: QuizCategory
  kind: QuizKind
  q: string
  /** First option is the correct one in the bank; `pickQuiz` shuffles. */
  options: string[]
  /** Shown after answering. Witty, never mean. */
  why: string
}

export const QUIZ_LENGTH = 10
export const QUIZ_SECONDS = 15

/** Original questions. Facts double-checked; no film dialogue or lyrics. */
export const BANK: QuizQuestion[] = [
  // 2010s pop & tech
  { id: 'p1', cat: 'pop', kind: 'year', q: 'Instagram launched in which year?', options: ['2010', '2008', '2012', '2014'], why: 'October 2010. The sepia filters came first, the influencers later.' },
  { id: 'p2', cat: 'pop', kind: 'year', q: 'In which year did "Gangnam Style" become the first YouTube video to pass a billion views?', options: ['2012', '2010', '2014', '2016'], why: 'December 2012. Every school function that year had the horse dance.' },
  { id: 'p3', cat: 'pop', kind: 'mc', q: 'Which app has a ghost as its logo?', options: ['Snapchat', 'Vine', 'Tumblr', 'Kik'], why: 'Snapchat. Disappearing messages, permanent screenshots.' },
  { id: 'p4', cat: 'pop', kind: 'year', q: 'The first iPad went on sale in which year?', options: ['2010', '2007', '2012', '2009'], why: '2010. It was "just a big iPhone" for about a week.' },
  { id: 'p5', cat: 'pop', kind: 'tf', q: 'Facebook bought WhatsApp in 2014.', options: ['True', 'False'], why: 'True. February 2014, for around 19 billion US dollars. Your class group chat was worth a lot.' },
  { id: 'p6', cat: 'pop', kind: 'tf', q: 'Vine videos could be up to 6 seconds long.', options: ['True', 'False'], why: 'True. Six seconds was all anyone needed.' },
  { id: 'p7', cat: 'pop', kind: 'tf', q: 'Oxford Dictionaries made "selfie" its Word of the Year in 2013.', options: ['True', 'False'], why: 'True. 2013 was peak front camera.' },
  { id: 'p8', cat: 'pop', kind: 'year', q: 'Pokémon GO had everyone walking into lamp posts in which year?', options: ['2016', '2014', '2018', '2012'], why: 'Summer 2016. The canteen was a gym, apparently.' },
  { id: 'p9', cat: 'pop', kind: 'mc', q: 'Which company makes the Galaxy series of phones?', options: ['Samsung', 'Nokia', 'HTC', 'Sony'], why: 'Samsung. The Note was a phablet before phablets were cool.' },
  // Cinema (general facts, no dialogue)
  { id: 'c1', cat: 'cinema', kind: 'year', q: '"3 Idiots" released in which year?', options: ['2009', '2007', '2011', '2013'], why: 'December 2009. Every engineering student felt seen.' },
  { id: 'c2', cat: 'cinema', kind: 'year', q: '"Dangal" released in which year?', options: ['2016', '2014', '2018', '2012'], why: '2016. Wrestling never looked so emotional.' },
  { id: 'c3', cat: 'cinema', kind: 'tf', q: '"Lagaan" was nominated for the Academy Award for Best Foreign Language Film.', options: ['True', 'False'], why: 'True. Nominated at the 2002 Oscars. A cricket match for the ages.' },
  { id: 'c4', cat: 'cinema', kind: 'mc', q: 'Which actor is popularly called "King Khan"?', options: ['Shah Rukh Khan', 'Salman Khan', 'Aamir Khan', 'Saif Ali Khan'], why: 'Shah Rukh Khan. Arms wide open, always.' },
  { id: 'c5', cat: 'cinema', kind: 'mc', q: 'Who is nicknamed "Mr. Perfectionist"?', options: ['Aamir Khan', 'Akshay Kumar', 'Ranbir Kapoor', 'Hrithik Roshan'], why: 'Aamir Khan. One film every few years, rehearsed to the decimal.' },
  { id: 'c6', cat: 'cinema', kind: 'mc', q: 'Who is known as the "Big B"?', options: ['Amitabh Bachchan', 'Dharmendra', 'Anil Kapoor', 'Sunny Deol'], why: 'Amitabh Bachchan. The voice alone has its own fan club.' },
  { id: 'c7', cat: 'cinema', kind: 'tf', q: 'Coke Studio Pakistan aired its first season in 2008.', options: ['True', 'False'], why: 'True. 2008, and every car stereo since.' },
  { id: 'c8', cat: 'cinema', kind: 'year', q: '"Sholay" released in which year?', options: ['1975', '1971', '1979', '1983'], why: '1975. Your parents can probably act out the whole thing.' },
  { id: 'c9', cat: 'cinema', kind: 'year', q: '"Pathaan" released in which year?', options: ['2023', '2021', '2019', '2025'], why: 'January 2023. The cinema whistles were heard across town.' },
  // Sport
  { id: 's1', cat: 'sport', kind: 'mc', q: 'Who won the 2017 ICC Champions Trophy?', options: ['Pakistan', 'India', 'England', 'Australia'], why: 'Pakistan, beating India in the final at The Oval.' },
  { id: 's2', cat: 'sport', kind: 'tf', q: 'India won the 2011 Cricket World Cup.', options: ['True', 'False'], why: 'True. Final at the Wankhede, finished with a six.' },
  { id: 's3', cat: 'sport', kind: 'year', q: 'Pakistan won the Cricket World Cup in which year?', options: ['1992', '1996', '1987', '1999'], why: '1992, in Melbourne. Cornered tigers.' },
  { id: 's4', cat: 'sport', kind: 'mc', q: 'How many players does a football team have on the pitch?', options: ['11', '10', '9', '12'], why: 'Eleven. The twelfth is whoever brought the ball.' },
  { id: 's5', cat: 'sport', kind: 'mc', q: 'Which country hosted the 2022 FIFA World Cup?', options: ['Qatar', 'Russia', 'Brazil', 'Saudi Arabia'], why: 'Qatar, in November and December. A winter World Cup.' },
  { id: 's6', cat: 'sport', kind: 'mc', q: 'How many balls are in a standard over in cricket?', options: ['6', '5', '8', '4'], why: 'Six. Unless the umpire lost count, which happens.' },
  // General knowledge
  { id: 'g1', cat: 'gk', kind: 'mc', q: 'What is the capital of Australia?', options: ['Canberra', 'Sydney', 'Melbourne', 'Perth'], why: 'Canberra. Sydney gets the photos, Canberra gets the paperwork.' },
  { id: 'g2', cat: 'gk', kind: 'mc', q: 'Which is the largest planet in our solar system?', options: ['Jupiter', 'Saturn', 'Neptune', 'Earth'], why: 'Jupiter. You could fit over a thousand Earths inside.' },
  { id: 'g3', cat: 'gk', kind: 'mc', q: 'What is the chemical symbol for gold?', options: ['Au', 'Ag', 'Go', 'Gd'], why: 'Au, from the Latin "aurum". Remember it for the trophy.' },
  { id: 'g4', cat: 'gk', kind: 'mc', q: 'How many sides does a hexagon have?', options: ['6', '5', '7', '8'], why: 'Six. Bees figured this out before we did.' },
  { id: 'g5', cat: 'gk', kind: 'tf', q: 'The Great Wall of China is easily visible from space with the naked eye.', options: ['False', 'True'], why: 'False. It is long but narrow; astronauts say you can’t pick it out unaided.' },
  { id: 'g6', cat: 'gk', kind: 'tf', q: 'K2 is the second-highest mountain on Earth.', options: ['True', 'False'], why: 'True. 8,611 metres, and much harder to climb than its number suggests.' },
  { id: 'g7', cat: 'gk', kind: 'mc', q: 'Who wrote "Romeo and Juliet"?', options: ['William Shakespeare', 'Charles Dickens', 'Jane Austen', 'Oscar Wilde'], why: 'Shakespeare. The original campus romance with a bad ending.' },
  { id: 'g8', cat: 'gk', kind: 'mc', q: 'Which gas do plants take in from the air to make food?', options: ['Carbon dioxide', 'Oxygen', 'Nitrogen', 'Hydrogen'], why: 'Carbon dioxide. They breathe out the oxygen you’re using to panic.' },
  // Campus life
  { id: 'u1', cat: 'campus', kind: 'mc', q: 'What does GPA stand for?', options: ['Grade Point Average', 'General Pass Assessment', 'Graded Paper Archive', 'Group Project Allocation'], why: 'Grade Point Average. The number your relatives ask about first.' },
  { id: 'u2', cat: 'campus', kind: 'mc', q: '"Cramming" for an exam means…', options: ['Studying hard at the last minute', 'Skipping the exam', 'Copying notes from a topper', 'Sleeping in the library'], why: 'Last-minute studying. Results may vary; chai consumption will not.' },
  { id: 'u3', cat: 'campus', kind: 'mc', q: 'In campus slang, a "proxy" is when…', options: ['A friend marks you present', 'You submit work early', 'You swap seats', 'The teacher is absent'], why: 'A friend answers your roll call. Not recommended. Very common.' },
  { id: 'u4', cat: 'campus', kind: 'mc', q: 'A semester is usually…', options: ['Half an academic year', 'One month of classes', 'A summer break', 'Exam week'], why: 'Half a year. Feels shorter until finals.' },
  // more pop & tech
  { id: 'p10', cat: 'pop', kind: 'tf', q: 'The first iPhone went on sale in 2007.', options: ['True', 'False'], why: 'True. June 2007, and pockets have never been the same.' },
  { id: 'p11', cat: 'pop', kind: 'mc', q: 'Which game is home to Steve, Creepers and a lot of blocks?', options: ['Minecraft', 'Roblox', 'Terraria', 'Fortnite'], why: 'Minecraft. Somebody in your class built the whole campus in it.' },
  { id: 'p12', cat: 'pop', kind: 'tf', q: 'Flappy Bird was pulled from the app stores by its own creator in 2014.', options: ['True', 'False'], why: 'True. February 2014. Phones everywhere breathed a sigh of relief.' },
  { id: 'p13', cat: 'pop', kind: 'year', q: 'Netflix launched in India in which year?', options: ['2016', '2012', '2018', '2014'], why: 'January 2016, during its big global expansion.' },
  // more cinema
  { id: 'c10', cat: 'cinema', kind: 'mc', q: '"Zindagi Na Milegi Dobara" follows three friends on a road trip through which country?', options: ['Spain', 'Italy', 'Greece', 'Portugal'], why: 'Spain. Every friend group has since planned that trip and not taken it.' },
  { id: 'c11', cat: 'cinema', kind: 'year', q: '"Kuch Kuch Hota Hai" released in which year?', options: ['1998', '1995', '2001', '2003'], why: '1998. It made college romances look much better dressed than real ones.' },
  { id: 'c12', cat: 'cinema', kind: 'mc', q: 'The 2011 TV drama "Humsafar" is from which country?', options: ['Pakistan', 'India', 'Bangladesh', 'Turkey'], why: 'Pakistan. Families across the border watched it together.' },
  { id: 'c13', cat: 'cinema', kind: 'tf', q: '"Dilwale Dulhania Le Jayenge" played at one Mumbai cinema for more than 20 years.', options: ['True', 'False'], why: 'True. Maratha Mandir ran it for over a thousand weeks.' },
  { id: 'c14', cat: 'cinema', kind: 'mc', q: 'Rancho is a character in which film?', options: ['3 Idiots', 'Taare Zameen Par', 'Rang De Basanti', 'Chak De! India'], why: '3 Idiots. The engineering student everyone wanted to be.' },
  // more sport
  { id: 's7', cat: 'sport', kind: 'mc', q: 'Who captained India to the 2011 Cricket World Cup title?', options: ['MS Dhoni', 'Sachin Tendulkar', 'Virat Kohli', 'Sourav Ganguly'], why: 'MS Dhoni, who also hit the winning six.' },
  { id: 's8', cat: 'sport', kind: 'mc', q: 'Which country has won the most FIFA World Cups?', options: ['Brazil', 'Germany', 'Italy', 'Argentina'], why: 'Brazil, with five titles.' },
  { id: 's9', cat: 'sport', kind: 'tf', q: 'In T20 cricket, each side bats for a maximum of 20 overs.', options: ['True', 'False'], why: 'True. That’s the twenty in T20.' },
  { id: 's10', cat: 'sport', kind: 'year', q: 'The Pakistan Super League played its first season in which year?', options: ['2016', '2013', '2018', '2010'], why: '2016, in the UAE.' },
  // more general knowledge
  { id: 'g9', cat: 'gk', kind: 'mc', q: 'What is the longest river in Pakistan?', options: ['Indus', 'Jhelum', 'Chenab', 'Ravi'], why: 'The Indus. It runs the length of the country.' },
  { id: 'g10', cat: 'gk', kind: 'mc', q: 'How many continents are there?', options: ['7', '5', '6', '8'], why: 'Seven, by the usual count.' },
  { id: 'g11', cat: 'gk', kind: 'tf', q: 'At sea level, water boils at 100 °C.', options: ['True', 'False'], why: 'True. Higher up, it boils cooler, which is why mountain chai is a struggle.' },
  { id: 'g12', cat: 'gk', kind: 'mc', q: 'Which planet is known as the Red Planet?', options: ['Mars', 'Venus', 'Jupiter', 'Mercury'], why: 'Mars. Iron oxide dust; basically a rusty planet.' },
  // more campus life
  { id: 'u5', cat: 'campus', kind: 'mc', q: 'A "viva" is…', options: ['An oral exam', 'A group project', 'A sports trial', 'A late fee'], why: 'An oral exam. The examiner smiles; nobody trusts it.' },
  { id: 'u6', cat: 'campus', kind: 'mc', q: 'A freshers’ party welcomes…', options: ['First-year students', 'Final-year students', 'New teachers', 'Alumni'], why: 'First-years. Seniors claim they organised it for them, not for the free food.' },
  { id: 'u7', cat: 'campus', kind: 'mc', q: 'Your "elective" is…', options: ['A course you choose', 'A compulsory exam', 'The class monitor', 'A library fine'], why: 'A course you pick. Choose wisely; it’s 8 a.m. on Mondays.' },
]

export type PreparedQuestion = QuizQuestion & { answer: number }

/** Seeded selection: a balanced mix (3 pop, 2 cinema, 2 sport, 2 gk, 1 campus) with shuffled options. */
export function pickQuiz(seed: string): PreparedQuestion[] {
  const r = rng(`quiz:${seed}`)
  const shuffle = <T,>(xs: T[]) => {
    const a = xs.slice()
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1))
      ;[a[i], a[j]] = [a[j]!, a[i]!]
    }
    return a
  }
  const want: [QuizCategory, number][] = [['pop', 3], ['cinema', 2], ['sport', 2], ['gk', 2], ['campus', 1]]
  const picked = want.flatMap(([cat, n]) => shuffle(BANK.filter((q) => q.cat === cat)).slice(0, n))
  return shuffle(picked).map((q) => {
    // true/false keeps True first for readability; others are shuffled
    const order = q.kind === 'tf' ? (q.options[0] === 'True' ? [0, 1] : [1, 0]) : shuffle(q.options.map((_, i) => i))
    return { ...q, options: order.map((i) => q.options[i]!), answer: order.indexOf(0) }
  })
}

/** Points for one answer: base 100 × speed (up to ×1.5) × streak (×1.25 per prior correct, capped ×2). */
export function quizPoints(correct: boolean, secondsLeft: number, streakBefore: number, totalSeconds = QUIZ_SECONDS): number {
  if (!correct) return 0
  const speed = 1 + 0.5 * Math.max(0, Math.min(1, secondsLeft / totalSeconds))
  const streak = Math.min(2, 1 + 0.25 * streakBefore)
  return Math.round(100 * speed * streak)
}

/** Best possible quiz score (all correct, instantly): used to normalise the round. */
export const QUIZ_MAX = Array.from({ length: QUIZ_LENGTH }, (_, i) => quizPoints(true, QUIZ_SECONDS, i)).reduce((a, b) => a + b, 0)
