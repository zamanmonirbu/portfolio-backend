// project.service.ts
import { Project } from './project.model';
import { IProject, IProjectAttrs } from './project.model';

export const ProjectService = {
  create(payload: IProjectAttrs) {
    return Project.create(payload)
  },

  async list(page = 1, limit = 5) {
    const skip = (page - 1) * limit

    // Get total count for pagination
    const totalProjects = await Project.countDocuments()

    // Get paginated projects
    const projects = await Project.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalProjects / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return {
      projects,
      pagination: {
        currentPage: page,
        totalPages,
        totalProjects,
        limit,
        hasNextPage,
        hasPrevPage,
      }
    }
  },

  findById(id: string) {
    return Project.findById(id).lean()
  },

  update(id: string, payload: Partial<IProjectAttrs>) {
    return Project.findByIdAndUpdate(id, payload, { new: true }).lean()
  },

  async delete(id: string) {
    const result = await Project.findByIdAndDelete(id).lean()
    return result !== null
  },
}

