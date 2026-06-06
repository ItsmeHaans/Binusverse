import { PrismaClient, ItemRarity, Difficulty } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env['DATABASE_URL']! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Seed all 28 battle items (8 usable + 20 relics)
  const items = [
    // Battle items (usable in quiz)
    { name: 'Phantom Eraser',    description: 'Eliminates 2 wrong answer options.',           ability: 'eliminate_two',    rarity: ItemRarity.LEGENDARY, imageKey: 'eraser'  },
    { name: 'Time Freeze Orb',   description: 'Adds +10 seconds to the current timer.',       ability: 'add_time',         rarity: ItemRarity.EPIC,      imageKey: 'freeze'  },
    { name: '2nd Chance Scroll', description: 'Retry a failed question without penalty.',     ability: 'retry_question',   rarity: ItemRarity.RARE,      imageKey: 'retry'   },
    { name: 'XP Magnet',         description: 'Multiplies XP earned this battle by 1.5×.',   ability: 'xp_multiplier',    rarity: ItemRarity.UNCOMMON,  imageKey: 'xp'      },
    { name: 'Aegis Shield',      description: 'Absorbs the next wrong answer.',               ability: 'absorb_wrong',     rarity: ItemRarity.RARE,      imageKey: 'shield'  },
    { name: 'Soul Gem',          description: 'Reveals the correct answer for 2 seconds.',    ability: 'peek_answer',      rarity: ItemRarity.EPIC,      imageKey: 'gem'     },
    { name: 'Time Warp',         description: 'Skip a question — counts as correct (50% XP).', ability: 'skip_question',  rarity: ItemRarity.UNCOMMON,  imageKey: 'warp'    },
    { name: 'Focus Potion',      description: 'Pauses the timer until you answer.',           ability: 'pause_timer',      rarity: ItemRarity.RARE,      imageKey: 'focus'   },
    // Relics (collectible)
    { name: 'Mirror Relic',      description: 'A mysterious reflective relic.',               ability: 'relic_passive',    rarity: ItemRarity.RARE,      imageKey: 'mirror'  },
    { name: 'Storm Relic',       description: 'Charged with electrical energy.',               ability: 'relic_passive',    rarity: ItemRarity.EPIC,      imageKey: 'storm'   },
    { name: 'Oracle Relic',      description: 'Grants foresight to the bearer.',              ability: 'relic_passive',    rarity: ItemRarity.LEGENDARY, imageKey: 'oracle'  },
    { name: 'Vortex Relic',      description: 'A swirling dimensional fragment.',             ability: 'relic_passive',    rarity: ItemRarity.EPIC,      imageKey: 'vortex'  },
    { name: 'Prism Relic',       description: 'Refracts light into pure knowledge.',          ability: 'relic_passive',    rarity: ItemRarity.RARE,      imageKey: 'prism'   },
    { name: 'Nova Relic',        description: 'Born from a stellar explosion.',               ability: 'relic_passive',    rarity: ItemRarity.LEGENDARY, imageKey: 'nova'    },
    { name: 'Echo Relic',        description: 'Resonates with past wisdom.',                  ability: 'relic_passive',    rarity: ItemRarity.UNCOMMON,  imageKey: 'echo'    },
    { name: 'Compass Relic',     description: 'Always points toward the right answer.',       ability: 'relic_passive',    rarity: ItemRarity.UNCOMMON,  imageKey: 'compass' },
    { name: 'Anchor Relic',      description: 'Grounds the mind in certainty.',               ability: 'relic_passive',    rarity: ItemRarity.COMMON,    imageKey: 'anchor'  },
    { name: 'Lantern Relic',     description: 'Illuminates hidden knowledge.',                ability: 'relic_passive',    rarity: ItemRarity.UNCOMMON,  imageKey: 'lantern' },
    { name: 'Tome Relic',        description: 'Contains ancient academic scrolls.',           ability: 'relic_passive',    rarity: ItemRarity.RARE,      imageKey: 'tome'    },
    { name: 'Cipher Relic',      description: 'Encrypted fragment of forbidden lore.',        ability: 'relic_passive',    rarity: ItemRarity.EPIC,      imageKey: 'cipher'  },
    { name: 'Dust Relic',        description: 'Remnants of a forgotten civilization.',        ability: 'relic_passive',    rarity: ItemRarity.COMMON,    imageKey: 'dust'    },
    { name: 'Coin Relic',        description: 'A lucky coin from the ancients.',              ability: 'relic_passive',    rarity: ItemRarity.COMMON,    imageKey: 'coin'    },
    { name: 'Badge Relic',       description: 'Marks achievement in battle.',                 ability: 'relic_passive',    rarity: ItemRarity.UNCOMMON,  imageKey: 'badge'   },
    { name: 'Rune Relic',        description: 'Carved with mystical symbols.',                ability: 'relic_passive',    rarity: ItemRarity.RARE,      imageKey: 'rune'    },
    { name: 'Glitch Relic',      description: 'A corrupted fragment of digital reality.',     ability: 'relic_passive',    rarity: ItemRarity.EPIC,      imageKey: 'glitch'  },
    { name: 'Pouch Relic',       description: 'Holds the essence of accumulated XP.',        ability: 'relic_passive',    rarity: ItemRarity.COMMON,    imageKey: 'pouch'   },
    { name: 'Scroll Relic',      description: 'Ancient scroll of battlefield tactics.',       ability: 'relic_passive',    rarity: ItemRarity.UNCOMMON,  imageKey: 'scroll'  },
    { name: 'Spark Relic',       description: 'A fragment of the first digital spark.',       ability: 'relic_passive',    rarity: ItemRarity.RARE,      imageKey: 'spark'   },
  ];

  for (const item of items) {
    await prisma.item.upsert({
      where: { name: item.name },
      update: {},
      create: item,
    });
  }
  console.log(`Seeded ${items.length} items.`);

  // Seed quiz questions
  const questions = [
    // EASY
    { text: 'What does CPU stand for?', optionA: 'Central Processing Unit', optionB: 'Computer Personal Unit', optionC: 'Central Program Utility', optionD: 'Core Processing Unit', correctOption: 'A', topic: 'Computer Basics', difficulty: Difficulty.EASY },
    { text: 'What is the binary representation of the decimal number 5?', optionA: '100', optionB: '101', optionC: '110', optionD: '010', correctOption: 'B', topic: 'Number Systems', difficulty: Difficulty.EASY },
    { text: 'Which of the following is NOT a programming language?', optionA: 'Python', optionB: 'HTML', optionC: 'Java', optionD: 'Photoshop', correctOption: 'D', topic: 'Programming', difficulty: Difficulty.EASY },
    { text: 'What does RAM stand for?', optionA: 'Read Access Memory', optionB: 'Random Access Memory', optionC: 'Rapid Access Module', optionD: 'Random Allocation Memory', correctOption: 'B', topic: 'Computer Basics', difficulty: Difficulty.EASY },
    { text: 'Which data structure uses LIFO order?', optionA: 'Queue', optionB: 'Linked List', optionC: 'Stack', optionD: 'Tree', correctOption: 'C', topic: 'Data Structures', difficulty: Difficulty.EASY },
    { text: 'What is the output of 2 ** 10 in Python?', optionA: '20', optionB: '512', optionC: '1024', optionD: '100', correctOption: 'C', topic: 'Programming', difficulty: Difficulty.EASY },
    { text: 'Which HTML tag is used to create a hyperlink?', optionA: '<link>', optionB: '<a>', optionC: '<href>', optionD: '<url>', correctOption: 'B', topic: 'Web Development', difficulty: Difficulty.EASY },
    { text: 'What symbol is used for single-line comments in Python?', optionA: '//', optionB: '--', optionC: '#', optionD: '/*', correctOption: 'C', topic: 'Programming', difficulty: Difficulty.EASY },
    { text: 'What does HTTP stand for?', optionA: 'HyperText Transfer Protocol', optionB: 'High Transfer Text Protocol', optionC: 'HyperText Transmission Process', optionD: 'Host Transfer Text Protocol', correctOption: 'A', topic: 'Networking', difficulty: Difficulty.EASY },
    { text: 'Which of the following is a valid IP address?', optionA: '999.1.1.1', optionB: '192.168.1.1', optionC: '256.0.0.1', optionD: '192.168.1.300', correctOption: 'B', topic: 'Networking', difficulty: Difficulty.EASY },
    // NORMAL
    { text: 'What is the time complexity of binary search?', optionA: 'O(n)', optionB: 'O(n²)', optionC: 'O(log n)', optionD: 'O(1)', correctOption: 'C', topic: 'Algorithms', difficulty: Difficulty.NORMAL },
    { text: 'Which sorting algorithm has the best average-case time complexity?', optionA: 'Bubble Sort', optionB: 'Merge Sort', optionC: 'Insertion Sort', optionD: 'Selection Sort', correctOption: 'B', topic: 'Algorithms', difficulty: Difficulty.NORMAL },
    { text: 'In OOP, what is encapsulation?', optionA: 'Inheriting methods from a parent class', optionB: 'Bundling data and methods within a class', optionC: 'Overriding parent class methods', optionD: 'Creating multiple forms of a method', correctOption: 'B', topic: 'OOP', difficulty: Difficulty.NORMAL },
    { text: 'What does SQL stand for?', optionA: 'Structured Query Language', optionB: 'Simple Query Language', optionC: 'Standard Query Logic', optionD: 'Sequential Query Language', correctOption: 'A', topic: 'Database', difficulty: Difficulty.NORMAL },
    { text: 'Which HTTP method is used to update a resource?', optionA: 'GET', optionB: 'POST', optionC: 'DELETE', optionD: 'PUT', correctOption: 'D', topic: 'Web Development', difficulty: Difficulty.NORMAL },
    { text: 'What is a foreign key in a relational database?', optionA: 'A key that uniquely identifies each row', optionB: 'A key that references the primary key of another table', optionC: 'An encrypted key used for security', optionD: 'A key from an external database', correctOption: 'B', topic: 'Database', difficulty: Difficulty.NORMAL },
    { text: 'What does the "git pull" command do?', optionA: 'Sends local changes to remote', optionB: 'Creates a new branch', optionC: 'Fetches and merges remote changes into the current branch', optionD: 'Deletes the remote branch', correctOption: 'C', topic: 'DevOps', difficulty: Difficulty.NORMAL },
    { text: 'What is the difference between == and === in JavaScript?', optionA: 'No difference', optionB: '== checks value only; === checks value and type', optionC: '=== checks value only; == checks value and type', optionD: '=== is only for strings', correctOption: 'B', topic: 'Programming', difficulty: Difficulty.NORMAL },
    { text: 'Which OSI layer is responsible for routing?', optionA: 'Data Link Layer', optionB: 'Transport Layer', optionC: 'Network Layer', optionD: 'Physical Layer', correctOption: 'C', topic: 'Networking', difficulty: Difficulty.NORMAL },
    { text: 'What is a deadlock in operating systems?', optionA: 'When a process uses too much memory', optionB: 'When two or more processes wait indefinitely for resources held by each other', optionC: 'When the CPU is overloaded', optionD: 'When a thread terminates unexpectedly', correctOption: 'B', topic: 'Operating Systems', difficulty: Difficulty.NORMAL },
    // HARD
    { text: 'What is the space complexity of merge sort?', optionA: 'O(1)', optionB: 'O(log n)', optionC: 'O(n)', optionD: 'O(n log n)', correctOption: 'C', topic: 'Algorithms', difficulty: Difficulty.HARD },
    { text: 'In the CAP theorem, what does "C" stand for?', optionA: 'Concurrency', optionB: 'Consistency', optionC: 'Capacity', optionD: 'Caching', correctOption: 'B', topic: 'Distributed Systems', difficulty: Difficulty.HARD },
    { text: 'What is the output of: [*range(0,5,2)] in Python?', optionA: '[0, 1, 2, 3, 4]', optionB: '[0, 2, 4]', optionC: '[1, 3, 5]', optionD: '[0, 2, 4, 6]', correctOption: 'B', topic: 'Programming', difficulty: Difficulty.HARD },
    { text: 'Which normal form eliminates transitive dependencies?', optionA: '1NF', optionB: '2NF', optionC: '3NF', optionD: 'BCNF', correctOption: 'C', topic: 'Database', difficulty: Difficulty.HARD },
    { text: 'What is the purpose of the "volatile" keyword in Java?', optionA: 'Prevents a variable from being modified', optionB: 'Ensures visibility of changes to a variable across threads', optionC: 'Makes a variable thread-local', optionD: 'Enables garbage collection', correctOption: 'B', topic: 'Programming', difficulty: Difficulty.HARD },
    { text: 'In TCP/IP, which protocol resolves IP addresses to MAC addresses?', optionA: 'DNS', optionB: 'DHCP', optionC: 'ARP', optionD: 'ICMP', correctOption: 'C', topic: 'Networking', difficulty: Difficulty.HARD },
    { text: 'What does ACID stand for in databases?', optionA: 'Atomicity, Consistency, Isolation, Durability', optionB: 'Access, Control, Index, Data', optionC: 'Atomicity, Concurrency, Integrity, Distribution', optionD: 'Access, Consistency, Isolation, Distribution', correctOption: 'A', topic: 'Database', difficulty: Difficulty.HARD },
    { text: 'What is the primary difference between a process and a thread?', optionA: 'Threads are heavier weight than processes', optionB: 'Processes share memory space; threads do not', optionC: 'Threads share memory within a process; processes have independent memory', optionD: 'There is no difference', correctOption: 'C', topic: 'Operating Systems', difficulty: Difficulty.HARD },
    { text: "Which algorithm is used in Dijkstra's shortest path?", optionA: 'Depth-First Search', optionB: 'Greedy with a priority queue', optionC: 'Dynamic Programming only', optionD: 'Breadth-First Search', correctOption: 'B', topic: 'Algorithms', difficulty: Difficulty.HARD },
    { text: 'What is the time complexity of building a heap from n elements?', optionA: 'O(n log n)', optionB: 'O(n²)', optionC: 'O(n)', optionD: 'O(log n)', correctOption: 'C', topic: 'Algorithms', difficulty: Difficulty.HARD },
  ];

  for (const q of questions) {
    const existing = await prisma.question.findFirst({ where: { text: q.text } });
    if (!existing) {
      await prisma.question.create({ data: q });
    }
  }
  console.log(`Seeded ${questions.length} quiz questions (skipped duplicates).`);

  const today = new Date().toISOString().split('T')[0]!;
  const existing = await prisma.dailyQuiz.findUnique({ where: { quizDate: today } });

  if (!existing) {
    const normalQs = await prisma.question.findMany({
      where: { difficulty: Difficulty.NORMAL },
      take: 10,
    });

    await prisma.dailyQuiz.create({
      data: {
        quizDate: today,
        questions: {
          create: normalQs.map((q, i) => ({
            questionId: q.id,
            order: i + 1,
          })),
        },
      },
    });
    console.log(`Created daily quiz for ${today}.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
