const inquirer = require('inquirer');
const fs = require('fs');
const {
  editFile,
  editJson,
  joinPath,
  filterQuestions,
  changeQuestions
} = require('./helpers');

const CURR_DIR = process.cwd();

async function generate(questions, chosenProject) {
  let projectChoice = '';
  try {
    const answers = await inquirer.prompt(questions);
    projectChoice = answers['project-choice'] || chosenProject;
    const projectName = answers['project-name'];

    const boilerplatePath = joinPath(`../boilerplates/${projectChoice}`);

    const currentProjectPath = `${CURR_DIR}/${projectName}`;
    fs.mkdirSync(currentProjectPath);
    createDirectoryContents(boilerplatePath, projectName);

    const jsonFilePath = `${currentProjectPath}/package.json`;
    const stats = fs.existsSync(jsonFilePath);
    if (stats) {
      const editName = editJson({ name: projectName });
      editFile(`${currentProjectPath}/package.json`, editName);
    }
  } catch (e) {
    const errCode = e.code;

    const projectName = filterQuestions('name', 'project-name');
    const message = changeQuestions(
      'message',
      'folder already exist, try with another project name'
    );
    const q = questions.filter(projectName).map(message);

    if (errCode === 'EEXIST') {
      return generate(q, projectChoice);
    }
    console.log(e);
    process.exit(1);
  }
}

function createDirectoryContents(boilerplatePath, newProjectPath) {
  const filesToCreate = fs.readdirSync(boilerplatePath);

  filesToCreate.forEach(file => {
    if (file === 'README.md') return;

    const origFilePath = `${boilerplatePath}/${file}`;

    const stats = fs.statSync(origFilePath);

    if (stats.isFile()) {
      const contents = fs.readFileSync(origFilePath, 'utf8');

      const writePath = `${CURR_DIR}/${newProjectPath}/${file}`;
      fs.writeFileSync(writePath, contents, 'utf8');
    } else if (stats.isDirectory()) {
      if (file === 'node_modules') return;

      fs.mkdirSync(`${CURR_DIR}/${newProjectPath}/${file}`);

      createDirectoryContents(
        `${boilerplatePath}/${file}`,
        `${newProjectPath}/${file}`
      );
    }
  });
}

module.exports = generate;
