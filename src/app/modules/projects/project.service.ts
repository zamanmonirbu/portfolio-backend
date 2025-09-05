import { Project } from './project.model';
import { IProject, IProjectAttrs } from './project.model';

export const ProjectService = {
  create(payload: IProjectAttrs) {
    return Project.create(payload);
  },

  list() {
    return Project.find().lean();
  },

  findById(id: string) {
    return Project.findById(id).lean();
  }
};
