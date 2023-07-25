// external modules
import inquirer from 'inquirer';
import chalk from 'chalk';

// internal modules
import fs from 'fs';

const operations = function () {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'actions',
        message: 'O que deseja fazer?',
        choices: [
          'Criar conta',
          'Consultar saldo',
          'Depositar',
          'Sacar',
          'Sair',
        ],
      },
    ])
    .then(answer => {
      const action = answer['actions'];

      if (action === 'Criar conta') {
        createAccount();
      } else if (action === 'Consultar saldo') {
        getAccountBalance();
      } else if (action === 'Depositar') {
        deposit();
      } else if (action === 'Sacar') {
        withdraw();
      } else if (action === 'Sair') {
        console.log(chalk.bgBlue.black('Obrigado por usar o Accounts!!'));
        process.exit();
      }
    })
    .catch(err => {
      console.log(err);
    });
};
operations();

// Create account
const createAccount = function () {
  console.log(chalk.bgGreen('Parabéns por escolher o nosso banco!'));
  console.log(chalk.green('Defina as opções da sua conta a seguir.'));

  buildAccount();
};

const buildAccount = function () {
  inquirer
    .prompt([
      {
        name: 'accountName',
        message: 'Digite um nome para sua conta',
      },
    ])
    .then(answer => {
      const accountName = answer['accountName'];

      console.info(accountName);

      if (!fs.existsSync(`accounts`)) {
        fs.mkdirSync('accounts');
      }

      if (fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(
          chalk.bgRed.black('Esta conta já existe, escolha outro nome!'),
        );

        buildAccount();
        return;
      }

      fs.writeFileSync(
        `accounts/${accountName}.json`,
        '{"balance": 0}',
        err => {
          console.log(err);
        },
      );

      console.log(chalk.green('Parabéns!! Sua conta foi criada.'));
      operations();
    })
    .catch(err => {
      console.log(err);
    });
};

// function deposit
const deposit = function () {
  inquirer
    .prompt([
      {
        name: 'accountName',
        message: 'Qual é o nome da sua conta?',
      },
    ])
    .then(answer => {
      const accountName = answer['accountName'];

      if (!checkAccount(accountName)) {
        return deposit();
      }

      inquirer
        .prompt([
          {
            name: 'amount',
            message: 'Digite o quanto deseja depositar',
          },
        ])
        .then(answer => {
          const amount = answer['amount'];

          // add amount
          addAmmount(accountName, amount);
          operations();
        })
        .catch(err => {
          console.log(err);
        });
    })
    .catch(err => console.log(err));
};

const checkAccount = function (accountName) {
  if (!fs.existsSync(`accounts/${accountName}.json`)) {
    console.log(chalk.bgRed.black('Esta conta não existe escolha outro nome!'));
    return false;
  }

  return true;
};

const addAmmount = function (accountName, amount) {
  const accountData = getAccount(accountName);

  if (!amount) {
    console.log(
      chalk.bgRed.black('Algo deu errado tente novamente mais tarde'),
    );
    return;
  }

  accountData.balance += +amount;

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    err => {
      console.log(err);
    },
  );

  console.log(chalk.bgGreen(`Foi depositado R$${amount} na sua conta`));
};

// select account
const getAccount = function (accountName) {
  const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
    encoding: 'utf-8',
    flag: 'r',
  });

  return JSON.parse(accountJSON);
};

// show account balance
const getAccountBalance = function () {
  inquirer
    .prompt([
      {
        name: 'accountName',
        message: 'Qual é o nome da sua conta?',
      },
    ])
    .then(answer => {
      const account = answer['accountName'];

      if (!checkAccount(account)) {
        return getAccountBalance();
      }

      const accountData = getAccount(account);
      console.log(
        chalk.bgBlue.black(`Seu saldo é de R$${accountData.balance}`),
      );

      operations();
    })
    .catch(err => console.log(err));
};

const withdraw = function () {
  inquirer
    .prompt([
      {
        name: 'accountName',
        message: 'Qual é o nome da sua conta?',
      },
    ])
    .then(answer => {
      const accountName = answer['accountName'];

      if (!checkAccount(accountName)) {
        return withdraw();
      }

      inquirer
        .prompt([
          {
            name: 'amount',
            message: 'Digite o quanto deseja sacar',
          },
        ])
        .then(answer => {
          const amount = answer['amount'];

          // add amount
          removeAmmount(accountName, amount);
          operations();
        })
        .catch(err => {
          console.log(err);
        });
    })
    .catch(err => console.log(err));
};

const removeAmmount = function (accountName, amount) {
  const accountData = getAccount(accountName);

  if (!amount) {
    console.log(
      chalk.bgRed.black('Algo deu errado tente novamente mais tarde'),
    );
    return;
  }

  if (accountData.balance < amount) {
    console.log(
      chalk.bgRed.black(
        `Saldo insuficiente, seu saldo é de R$${accountData.balance}`,
      ),
    );
    return;
  }

  accountData.balance -= +amount;

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    err => {
      console.log(err);
    },
  );

  console.log(chalk.bgGreen(`Foi sacado R$${amount} na sua conta`));
};
