import * as vscode from 'vscode';
import { CMakeToolsApi, CMakeToolsExtensionExports, CodeModel, ConfigurationType, Project, Version } from 'vscode-cmake-tools';
import * as fs from 'fs';
import * as ps from 'sound-play'

// generate a random compilemt for user from list of words
function generateRandomCompliment(): string {
	const sentences = vscode.workspace.getConfiguration('cmakeLastSuccessfulCompilation').get<string[]>('compliments') || ["Awesome", "Fantastic", "Incredible", "Remarkable", "Extraordinary"];
	const randomIndex = Math.floor(Math.random() * sentences.length);
	return sentences[randomIndex];
}

function printCodeModelContent(codemodel: CodeModel.Content): void {
  codemodel.configurations.forEach((configuration) => {
    configuration.projects.forEach((project) => {
      if (project.targets) {
        project.targets.forEach((target) => {
            if (target.artifacts) {
              target.artifacts.forEach((artifact) => {
                const { mtime } = fs.statSync(artifact);
                const timeSinceModified = Date.now() - mtime.getTime();
                const minutesSinceModified = Math.floor(timeSinceModified / (1000 * 60));
                if (timeSinceModified > 1000 * 1) {
                  const message = minutesSinceModified === 0 ? `Your last successful compilation was just now.` : `Your last successful compilation was ${minutesSinceModified} minutes ago.`;
                  vscode.window.showErrorMessage(generateRandomCompliment() + " " + message, { modal: true}).then((selection) => {
                  });
                }
              });
            }
        });
      }
    });
  });
}

async function printProjectDetails(project: Project): Promise<void> {
  const codemodel: CodeModel.Content | undefined = project.codeModel;
  if (codemodel) {
    printCodeModelContent(codemodel);
  }
}

async function updateProject(project: Project): Promise<void> {
  activeProject = project;
  activeProject.onCodeModelChanged(async (_) => {
    const buildType = await activeProject?.getActiveBuildType();
    const isDebugOrRelease = (buildType === 'Debug' || buildType === 'Release');
    if (isDebugOrRelease) {
      if (activeProject && activeProject.codeModel) {
        printCodeModelContent(activeProject.codeModel);
      }
    }
  });
}

let api: CMakeToolsApi;
let activeProject: Project | undefined;

export async function activate(_context: vscode.ExtensionContext) {
  const cmakeToolsExtension: CMakeToolsExtensionExports = await vscode.extensions.getExtension('ms-vscode.cmake-tools')?.activate();
  api = cmakeToolsExtension.getApi(Version.v3);

  // Other items available on the api object.
  const proj = await api.getProject(vscode.Uri.file(api.getActiveFolderPath()));
  if (proj) {
    await updateProject(proj);
  }

  api.onActiveProjectChanged(async (projectUri) => {
    let proj;
    if (projectUri) {
      proj = await api.getProject(projectUri);
    }

    if (proj) {
      await updateProject(proj);
    }
  });
}