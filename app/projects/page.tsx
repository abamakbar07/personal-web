import { Projects } from 'app/components/projects'
import { getContent } from 'app/utils/content'

export const metadata = {
  title: getContent('projects', 'title'),
  description: getContent('projects', 'description'),
}

export default function Page() {
  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">
        {getContent('projects', 'title')}
      </h1>
      <p className="mb-8">
        {getContent('projects', 'introduction')}
      </p>
      <Projects />
    </section>
  )
}