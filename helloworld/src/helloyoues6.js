import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Tell me your name:', (answer) => {
  console.log(`Hello ${answer}!!`);
  rl.close();
});