# Mini Task CLI Runner

## Startup

### Install

### Create an entrypoint

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

### Configuration

create `taskconfig.json` under the project root directory.

| Field       | Value       | Desc.                                 |
| ----------- | ----------- | ------------------------------------- |
| accountFile | account.csv | account file path                     |
| taskDefDir  | scr/tasks   | directory where tasks are defined     |
| reportDir   | .task       | directory task result are persisted   |
| taskTimeout | 600000      | task timeout value in millis          |
| shuffleId   | true        | should shuffle user ID on a batch run |
| chain       | -           | default chain                         |
| chains      | -           | define chain information              |
| deployed    | -           | deployed addresses                    |

### Define a task

create `tasks/test.js`

```

import task from "mini-task-clirunner";

task(1, "example").action(async (user, ctx) => {
  const { id, name, chain } = ctx;
  console.log("excuting task", id, name, "for user", user.address "@", chain);
});

```

### Run

Run the command in terminal:

`yarn task test 1,2`

This command reads: run the test task for user 1 and 2.

## Details

### Configuration

### Task details

#### passing user info

### Command line arguments and options
