import Link from 'next/link'
import Image from 'next/image'
import { getContent } from 'app/utils/content'

type Project = {
  title: string
  description: string
  imageUrl: string
  deployedUrl: string
  technologies: string[]
  feedbackUrl?: string
}

export function Projects() {
  // Get projects from content
  const projects = getContent('projects', 'items') as Project[]

  return (
    <div className="flex flex-col space-y-8">
      {projects.map((project, index) => (
        <div key={index} className="flex flex-col space-y-4">
          <div className="relative w-full h-48 overflow-hidden rounded-lg">
            <Image 
              src={project.imageUrl} 
              alt={project.title}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="text-xl font-medium tracking-tight">
              {project.title}
            </h3>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              {project.description}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {project.technologies.map((tech, techIndex) => (
                <span 
                  key={techIndex} 
                  className="px-2 py-1 text-xs rounded-full bg-neutral-100 dark:bg-neutral-800"
                >
                  {tech}
                </span>
              ))}
            </div>
            <div className="mt-4 flex gap-4">
              <Link 
                href={project.deployedUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                View Project →
              </Link>
              {project.feedbackUrl && (
                <Link 
                  href={project.feedbackUrl}
                  className="text-green-600 dark:text-green-400 hover:underline"
                >
                  Give Feedback →
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}