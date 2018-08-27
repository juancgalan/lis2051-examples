import readline from 'readline-promise';

const rlp = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true
});

function main() {
  console.log("Running...");
  rlp.questionAsync('Tell me your name:')
    .then(answer => {
      console.log(`Hello ${answer}`);
      process.exit();
    });
};

main();