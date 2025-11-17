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

// Likes
getLikesByProject(projectId: string) {
  return this.api.getLikesByProject(projectId);
}

getUserLikeForProject(userId: string, projectId: string) {
  return this.api.getUserLikeForProject(userId, projectId);
}

addLike(projectId: string, userId: string, token: string) {
  return this.api.addLike(projectId, userId, token);
}

removeLike(likeId: string, token: string) {
  return this.api.removeLike(likeId, token);
}

uploadFile(file: File, token: string) {
  return this.api.uploadFile(file, token);
}

getUserProjects(userId: string, token: string) {
  return this.api.getProjectsByUser(userId, token);
}

deleteProject(projectId: string, token: string) {
  return this.api.deleteProjectById(projectId, token);
  }

}
