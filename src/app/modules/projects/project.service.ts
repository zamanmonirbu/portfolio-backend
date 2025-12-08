import { Project } from './project.model';
import { IProject, IProjectAttrs } from './project.model';

export const ProjectService = {
  create(payload: IProjectAttrs) {
    return Project.create(payload);
  },

  list() {
    return Project.find().sort({ createdAt: -1 }).limit(5).lean();
  },

  findById(id: string) {
    return Project.findById(id).lean();
  },

  // ✅ FIXED update
  update(id: string, payload: Partial<IProjectAttrs>) {
    return Project.findByIdAndUpdate(id, payload, { new: true }).lean();
  },

  // ✅ FIXED delete
  async delete(id: string) {
    const result = await Project.findByIdAndDelete(id).lean();
    return result !== null;
  },
};
