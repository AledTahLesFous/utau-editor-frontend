import { Injectable } from '@angular/core';
import { Api } from './api.service.';

@Injectable({ providedIn: 'root' })
export class ProjectService {

  constructor(private api: Api) {}

  getProjects() {
    return this.api.getProjects();
  }

  createProject(projectData: any, token: string) {
    return this.api.createProject(projectData, token);
  }

  getProjectByName(name: string) {
    return this.api.getProjectByName(name);
  }

  updateProject(name: string, projectData: any, token: string) {
    return this.api.updateProject(name, projectData, token);
  }

  deleteProject(name: string, token: string) {
    return this.api.deleteProject(name, token);
  }

  getProjectByTitle(title: string, token: string) {
  return this.api.getProjectByTitle(title, token);
}

updateProjectById(id: string, data: any, token: string) {
  return this.api.updateProjectById(id, data, token);
}

getNotesByProject(id: string) {
  return this.api.getNotesByProject(id);
}

addNote(note: any, token: string) {
  return this.api.addNote(note, token);
}

updateNote(id: string, data: any, token: string) {
  return this.api.updateNote(id, data, token);
}

deleteNote(id: string, token: string) {
  return this.api.deleteNote(id, token);
}

getAllPhonemes() {
  return this.api.getAllPhonemes();
}

getPhonemesByIds(ids: string[]) {
  return this.api.getPhonemesByIds(ids);
}

getVoicebanks(token: string) {
  return this.api.getVoicebanks(token);
}

}
