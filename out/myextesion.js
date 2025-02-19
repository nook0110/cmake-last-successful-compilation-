"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
const vscode = __importStar(require("vscode"));
const vscode_cmake_tools_1 = require("vscode-cmake-tools");
const fs = __importStar(require("fs"));
function printCodeModelContent(codemodel) {
    codemodel.configurations.forEach((configuration) => {
        configuration.projects.forEach((project) => {
            if (project.targets) {
                project.targets.forEach((target) => {
                    if (target.name === 'Debug' || target.name === 'Release') {
                        if (target.artifacts) {
                            target.artifacts.forEach((artifact) => {
                                const { mtime } = fs.statSync(artifact);
                                const timeSinceModified = Date.now() - mtime.getTime();
                                const minutesSinceModified = Math.floor(timeSinceModified / (1000 * 60));
                                if (timeSinceModified > 1000 * 5) {
                                    vscode.window.showErrorMessage(`You are a fckingloser! Your last successful compilation was ${minutesSinceModified} minutes ago.`);
                                }
                            });
                        }
                    }
                });
            }
        });
    });
}
async function printProjectDetails(project) {
    const codemodel = project.codeModel;
    if (codemodel) {
        printCodeModelContent(codemodel);
    }
}
async function updateProject(project) {
    activeProject = project;
    // await printProjectDetails(activeProject);
    activeProject.onCodeModelChanged((_) => {
        if (activeProject && activeProject.codeModel) {
            printCodeModelContent(activeProject.codeModel);
        }
    });
}
let api;
let activeProject;
async function activate(_context) {
    const cmakeToolsExtension = await vscode.extensions.getExtension('ms-vscode.cmake-tools')?.activate();
    api = cmakeToolsExtension.getApi(vscode_cmake_tools_1.Version.v3);
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
//# sourceMappingURL=myextesion.js.map