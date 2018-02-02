import { window, workspace, Terminal } from 'vscode'

import { getTestRunner } from '../utils/runner'
import { TestRunner } from '../types/TestRunner'

let term: Terminal = null

function _getNewTerminal(): Terminal {
    if (term) {
        term.dispose()
    }

    term = window.createTerminal()

    return term
}

async function runTest (testName, rootPath, fileName) {
    const testRunner = await getTestRunner(rootPath)
    const additionalArgs = workspace.getConfiguration("javascript-test-runner").get("additionalArgs")
    const term = _getNewTerminal()

    const isJest = testRunner === TestRunner.jest

    // escape backlash for bash
    testName = testName.replace(/\\/g, "\\\\")

    // escape single quote for bash
    testName = testName.replace(/'/g, "'\\''")

    let commandLine = `${rootPath}/node_modules/.bin/jest '${fileName}' --testNamePattern='${testName}' ${additionalArgs}`

    if (isJest === false) {
        // escape regexp string for `mocha --grep` arguments
        testName = testName.replace(/[.*+?^${}()|[\]]/g, '\\$&')
        commandLine = `${rootPath}/node_modules/.bin/mocha '${fileName}' --grep='${testName}' ${additionalArgs}`
    }

    term.sendText(commandLine, true)
    term.show(true)
}


export default runTest
