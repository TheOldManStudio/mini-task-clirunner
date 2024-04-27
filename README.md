# Mini Task CLI Runner

## Startup

### Install

### 2. Create an entrypoint

create `src/runner.js`

```
import { TaskCliRunner } from "mini-task-clirunner";

new TaskCliRunner().run().catch(console.error);
```

add a script command to the `package.json`

```
"scripts": {
    "task": "babel-node ./src/runner.js"
  },
```

### 3. Prepare user accounts

User accounts are stored in a CSV file.

```
id, address,    privkey
1,  0x1234...,  0xabcd...
...
```

### 4. Configuration

create `taskconfig.json` under the root directory.

```
{
  "shuffleId": true,
  "accountFile": "./accounts.csv",
  "taskDefDir": "./src/tasks",
  "reportDir": ".",
  "taskTimeout": 600000,

  "chain": "ethereum",

  "chains": {
    "ethereum": {
      "chainId": 1,
      "chain": "Ethereum",
      "network": "mainnet",
      "rpc": "https://eth.melos.studio/",
      "coin": "eth"
    },


  },

  "deployed": {
    "ethereum": {
      "WETH": "0xabcd"
    }
  }
}

```

### 5. Define a task

A task is defined using Javascript. Create an example `test.js` under the `src/tasks` directory:

```

import task from "mini-task-clirunner";

task(1, "example").action(async (user, ctx) => {
  const { id, name, chain } = ctx;
  const { address } = user;
  console.log("excuting task", id, name, "for user", address "@", chain);
});

```

### 6. Run

Command to run the `test.js` task for user 1 and 2 goes:

`yarn task test 1,2`

## Details

### Configuration

| Field       | Value       | Desc.                                     |
| ----------- | ----------- | ----------------------------------------- |
| accountFile | account.csv | account file path                         |
| taskDefDir  | scr/tasks   | directory where tasks are defined         |
| reportDir   | .task       | directory where task result are persisted |
| taskTimeout | 600000      | task timeout value (in millis)            |
| shuffleId   | true        | should shuffle user ID on a batch run     |
| chain       | -           | the working chain                         |
| chains      | -           | define list of supported chains           |
| deployed    | -           | deployed contract addresses               |

### Task

#### passing user info

### Command line arguments and options

`yarn task [global-options] <task-js-file-name> <user-id-list> [task-specific-args]`

task-js-file-name
